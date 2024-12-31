// Import stylesheets
import './style.css';

// Import Firebase services from firebase.js
import { auth, db } from './firebase';

// Firebase authentication and Firestore services
import {
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  where,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');
const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

// Listen to guestbook updates
function subscribeGuestbook() {
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestbookListener = onSnapshot(q, (snaps) => {
    guestbook.innerHTML = '';
    snaps.forEach((doc) => {
      const entry = document.createElement('p');
      entry.textContent = `${doc.data().name}: ${doc.data().text}`;
      guestbook.appendChild(entry);
    });
  });
}

function unsubscribeGuestbook() {
  if (guestbookListener) {
    guestbookListener();
    guestbookListener = null;
  }
}

function subscribeCurrentRSVP(user) {
  const ref = doc(db, 'attendees', user.uid);
  rsvpListener = onSnapshot(ref, (doc) => {
    if (doc && doc.data()) {
      const attendingResponse = doc.data().attending;
      rsvpYes.className = attendingResponse ? 'clicked' : '';
      rsvpNo.className = attendingResponse ? '' : 'clicked';
    }
  });
}

function unsubscribeCurrentRSVP() {
  if (rsvpListener) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = '';
  rsvpNo.className = '';
}

async function main() {
  // FirebaseUI configuration
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };

  const ui = new firebaseui.auth.AuthUI(auth);

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      signOut(auth);
    } else {
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  // Listen to authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      guestbookContainer.style.display = 'block';
      subscribeGuestbook();
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = 'RSVP';
      guestbookContainer.style.display = 'none';
      unsubscribeGuestbook();
      unsubscribeCurrentRSVP();
    }
  });

  // Listen to form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
    });
    input.value = '';
  });

  // Listen to RSVP responses
  rsvpYes.onclick = async () => {
    const userRef = doc(db, 'attendees', auth.currentUser.uid);
    await setDoc(userRef, { attending: true });
  };

  rsvpNo.onclick = async () => {
    const userRef = doc(db, 'attendees', auth.currentUser.uid);
    await setDoc(userRef, { attending: false });
  };

  // Listen to attendee count updates
  const attendingQuery = query(
    collection(db, 'attendees'),
    where('attending', '==', true)
  );
  onSnapshot(attendingQuery, (snap) => {
    const newAttendeeCount = snap.docs.length;
    numberAttending.innerHTML = `${newAttendeeCount} people going`;
  });
}

main();

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBN9oBxZC77p7pGRa1NPaHkwPB3nITRrzw',
    authDomain: 'fir-web-codelab-22aeb.firebaseapp.com',
    projectId: 'fir-web-codelab-22aeb',
    storageBucket: 'fir-web-codelab-22aeb.firebasestorage.app',
    messagingSenderId: '190908663044',
    appId: '1:190908663044:web:a94ddce5f3484603827c51',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



import { writable, type Writable } from 'svelte/store';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import firebase from 'firebase/compat/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAbeCvfydyPtrIWDoVGeFFHtQy4dN4dhSE',
	authDomain: 'voidshift-af224.firebaseapp.com',
	projectId: 'voidshift-af224',
	storageBucket: 'voidshift-af224.firebasestorage.app',
	messagingSenderId: '332082071203',
	appId: '1:332082071203:web:392b3843d23ab34ee92116',
	measurementId: 'G-WYZ2HB5PKP',
	databaseURL: 'https://voidshift-af224-default-rtdb.firebaseio.com'
};

// Initialize Firebase

let app;

if (!getApps().length) {
	// If there are no initialized apps, initialize Firebase
	app = initializeApp(firebaseConfig);
} else {
	// If Firebase is already initialized, use the existing app
	app = getApp(); // Use default app
}
export const db = getDatabase(app);
export const database: Writable<Database> = writable(db);

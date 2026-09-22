// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClt2McYxnnlKlS0dNoMPS07kvuR-n_odo",
  authDomain: "calender-5033e.firebaseapp.com",
  projectId: "calender-5033e",
  storageBucket: "calender-5033e.firebasestorage.app",
  messagingSenderId: "627688181455",
  appId: "1:627688181455:web:cb1100cc17d231a0ba71ba"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let firestoreDb;
if (typeof window !== "undefined") {
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (e) {
    firestoreDb = getFirestore(app);
  }
} else {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

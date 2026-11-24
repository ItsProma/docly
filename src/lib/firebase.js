import { initializeApp, getApp, getApps } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASt_ds5QU74MJpGrTRWVNsgdYrAO_PtxI",
  authDomain: "docly-60360.firebaseapp.com",
  projectId: "docly-60360",
  storageBucket: "docly-60360.firebasestorage.app",
  messagingSenderId: "488901755657",
  appId: "1:488901755657:web:eb17e5051ab548129ec9d8",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const storage = getStorage(app);
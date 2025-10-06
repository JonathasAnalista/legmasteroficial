import admin from 'firebase-admin';
import { config } from './config.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey
    })
  });
}

export const firebaseAdmin = admin;
export const db = admin.firestore();

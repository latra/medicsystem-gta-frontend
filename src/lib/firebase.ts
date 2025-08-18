import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDH8tf6cg6OoRTbz62Wpipa2ygAHB5d3SY",
  authDomain: "medicalapp-dev-512ac.firebaseapp.com",
  projectId: "medicalapp-dev-512ac",
  storageBucket: "medicalapp-dev-512ac.firebasestorage.app",
  messagingSenderId: "850416043098",
  appId: "1:850416043098:web:3ef20ddd27a28ed9778463"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 
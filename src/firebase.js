import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import axios from 'axios';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja funkcji Analytics (opcjonalne)
const analytics = getAnalytics(app);

// Inicjalizacja autoryzacji i Firestore
const auth = getAuth();
const db = getFirestore(app);

// Funkcja do przesyłania tokenu użytkownika do backendu
const sendTokenToBackend = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/community-cocktails/approval`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log('Response from backend:', response.data);
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  } else {
    console.error('User is not logged in');
  }
};

// Konfiguracja providerów Google i Facebook
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, db, analytics, googleProvider, facebookProvider, sendTokenToBackend };

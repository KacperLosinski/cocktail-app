// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Globalny stan ładowania
  const [authLoading, setAuthLoading] = useState(false);  // Stan ładowania dla operacji autoryzacyjnych
  const [error, setError] = useState('');  // Przechowywanie błędów autoryzacji

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Funkcja rejestracji nowego użytkownika
  const register = async (email, password) => {
    setAuthLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error('Registration Error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Funkcja logowania
  const login = async (email, password) => {
    setAuthLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login Error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Funkcja wylogowania
  const logout = async () => {
    setAuthLoading(true);
    setError('');
    try {
      await signOut(auth);
      setCurrentUser(null); // Usuwamy użytkownika po wylogowaniu
    } catch (error) {
      setError('Failed to log out. Please try again.');
      console.error('Logout Error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    authLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Tylko wyświetlanie dzieci, gdy ładowanie jest zakończone */}
    </AuthContext.Provider>
  );
};


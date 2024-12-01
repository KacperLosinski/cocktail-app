import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async (userId) => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'favorites'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userFavorites = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchFavorites(currentUser.uid);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchFavorites]);

  const addFavorite = useCallback(async (cocktail) => {
    if (!user) {
      setError('You need to be logged in to add favorites.');
      return;
    }

    const favoriteData = {
      idDrink: cocktail.idDrink || cocktail._id,
      strDrink: cocktail.strDrink || cocktail.name,
      strDrinkThumb: cocktail.strDrinkThumb || cocktail.image,
      userId: user.uid,
      type: cocktail.idDrink ? 'main' : 'community',
    };

    try {
      const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
      setFavorites((prev) => [...prev, { id: docRef.id, ...favoriteData }]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError('Failed to add favorite. Please try again.');
    }
  }, [user]);

  const removeFavorite = useCallback(async (id) => {
    if (!user) {
      setError('You need to be logged in to remove favorites.');
      return;
    }

    try {
      const q = query(collection(db, 'favorites'), where('userId', '==', user.uid), where('idDrink', '==', id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn(`Favorite with id ${id} not found.`);
        return;
      }

      const docId = querySnapshot.docs[0]?.id;
      if (docId) {
        await deleteDoc(doc(db, 'favorites', docId));
        setFavorites((prev) => prev.filter((fav) => fav.idDrink !== id));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove favorite. Please try again.');
    }
  }, [user]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, loading, error }}>
      {children}
    </FavoritesContext.Provider>
  );
};

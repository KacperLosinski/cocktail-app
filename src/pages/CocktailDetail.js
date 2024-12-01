import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CocktailDetail.css';

// Funkcja pomocnicza do uzyskania listy składników i ich miar
const getIngredients = (cocktail) => {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = cocktail[`strIngredient${i}`];
    const measure = cocktail[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push({
        name: ingredient,
        measure: measure ? measure : '',
        imageUrl: `https://www.thecocktaildb.com/images/ingredients/${ingredient}-Small.png`, // URL do obrazka składnika
      });
    }
  }
  return ingredients;
};

const CocktailDetail = () => {
  const { id } = useParams(); // Pobieramy ID koktajlu z parametrów URL
  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true); // Dodanie stanu ładowania
  const [error, setError] = useState(''); // Dodanie stanu błędu
  const [message, setMessage] = useState(''); // Dodanie stanu komunikatu
  const { addFavorite, removeFavorite, favorites } = useFavorites();
  const { currentUser } = useAuth(); // Sprawdzenie, czy użytkownik jest zalogowany

  const API_URL = process.env.REACT_APP_EXTERNAL_API_URL || 'https://www.thecocktaildb.com/api/json/v1/1';

  // Sprawdza, czy koktajl jest już w ulubionych
  const isFavorite = favorites.some((fav) => fav.idDrink === id);

  // Funkcja do pobierania szczegółów koktajlu z API na podstawie ID
  const fetchCocktailDetails = useCallback(async () => {
    setLoading(true); // Ustawienie stanu ładowania na true przed rozpoczęciem żądania
    try {
      const response = await fetch(`${API_URL}/lookup.php?i=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cocktail details');
      }
      const data = await response.json();
      if (data && data.drinks) {
        setCocktail(data.drinks[0]);
      } else {
        setError('No cocktail details found.');
      }
    } catch (error) {
      console.error('Error fetching cocktail details:', error);
      setError('Failed to load cocktail details. Please try again later.');
    } finally {
      setLoading(false); // Ustawiamy ładowanie na false po zakończeniu pobierania
    }
  }, [id, API_URL]);

  useEffect(() => {
    fetchCocktailDetails();
  }, [fetchCocktailDetails]);

  // Obsługa dodawania do ulubionych
  const handleFavoriteClick = () => {
    if (!currentUser) {
      setMessage('You need to be logged in to add cocktails to your favorites.');
      return;
    }

    if (isFavorite) {
      removeFavorite(cocktail.idDrink); // Usunięcie z ulubionych
    } else {
      addFavorite(cocktail); // Dodanie do ulubionych
    }
  };

  // Automatyczne ukrywanie komunikatu po kilku sekundach
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(''); // Ukryj komunikat po 3 sekundach
      }, 3000);
      return () => clearTimeout(timer); // Czyść timer, aby uniknąć wycieków pamięci
    }
  }, [message]);

  return (
    <div className="cocktail-detail-container">
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h2 className="cocktail-name">{cocktail.strDrink}</h2>
          <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} className="cocktail-image" />

          <h3 className="section-title">Ingredients</h3>
          <div className="ingredients-list">
            {getIngredients(cocktail).map((ingredient, index) => (
              <div key={index} className="ingredient-item">
                <img src={ingredient.imageUrl} alt={ingredient.name} className="ingredient-image" />
                <div className="ingredient-name">{ingredient.name}</div>
                <div className="ingredient-measure">{ingredient.measure}</div>
              </div>
            ))}
          </div>
          <h3 className="section-title">Instructions</h3>
          <p className="instructions">{cocktail.strInstructions}</p>
          <button
            className={`favorite-button ${isFavorite ? 'favorite' : ''}`}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          {message && <p className="error-message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default CocktailDetail;

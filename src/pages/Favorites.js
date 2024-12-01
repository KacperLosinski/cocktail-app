import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Favorites.css';

// Pobranie adresu API z zmiennych środowiskowych
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  // Obsługa kliknięcia na koktajl w celu przejścia do jego szczegółów
  const handleCocktailClick = (fav) => {
    const path = fav.type === 'main' ? `/cocktail/${fav.idDrink}` : `/community-cocktail/${fav.idDrink}`;
    navigate(path);
  };

  return (
    <div className="favorites-container">
      <h2 className="favorites-title">Your Favorite Cocktails</h2>
      {favorites.length > 0 ? (
        <div className="favorites-list">
          {favorites.map((fav) => (
            <div
              key={fav.idDrink || fav._id}
              className="favorite-item"
              onClick={() => handleCocktailClick(fav)} // Cała karta przenosi do szczegółów
            >
              <img
                src={
                  fav.type === 'main'
                    ? fav.strDrinkThumb
                    : `${API_URL}${fav.strDrinkThumb || fav.image}`
                }
                alt={fav.strDrink || fav.name}
                className="favorite-image"
              />
              <div className="favorite-info">
                <h4 className="favorite-name">{fav.strDrink || fav.name}</h4>

                <button
                  className="remove-favorite-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Zapobiega propagacji zdarzenia na kontener
                    removeFavorite(fav.idDrink || fav._id);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-favorites-message">You don't have any favorite cocktails yet. Start adding some!</p>
      )}
    </div>
  );
};

export default Favorites;

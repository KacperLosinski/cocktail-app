import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import kontekstu autoryzacji, aby pobrać bieżącego użytkownika
import StarRating from './components/StarRating'; // Ścieżka może się różnić w zależności od lokalizacji komponentu
import '../styles/CommunityCocktails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MyCocktails = () => {
  const { currentUser } = useAuth(); // Użyj kontekstu do uzyskania bieżącego użytkownika
  const [myCocktails, setMyCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCocktails = async () => {
      if (!currentUser) {
        setLoading(false);
        setError('Musisz być zalogowany, aby zobaczyć swoje koktajle.');
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/api/community-cocktails`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filtrowanie koktajli, aby pokazać tylko te stworzone przez bieżącego użytkownika
        const userCocktails = response.data.filter(
          (cocktail) => cocktail.userId === currentUser.email
        );

        setMyCocktails(userCocktails);
      } catch (error) {
        setError('Nie udało się pobrać Twoich koktajli. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCocktails();
  }, [currentUser]);

  const handleCocktailClick = (id) => {
    navigate(`/community-cocktail/${id}`);
  };

  const renderStars = (currentRating, isUserRating = false) => {
    return Array(5)
      .fill(0)
      .map((_, index) => {
        const isFilled = index < Math.floor(currentRating);
        const isPartial = index === Math.floor(currentRating) && currentRating % 1 !== 0;
        const starClass = isUserRating ? 'user-rating-star' : 'average-rating-star';
  
        return (
          <span
            key={index}
            className={`star ${starClass} ${isFilled ? 'filled' : isPartial ? 'partial' : 'empty'}`}
            onClick={isUserRating ? () => setRating(index + 1) : undefined}
          >
            ★
          </span>
        );
      });
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="community-cocktails-container">
      <h2>My Cocktails</h2>
      {myCocktails.length > 0 ? (
        <div className="cocktail-list">
          {myCocktails.map((cocktail) => (
            <div
              key={cocktail._id}
              className="cocktail-item"
              onClick={() => handleCocktailClick(cocktail._id)}
            >
              <img
                src={cocktail.image ? `${API_URL}${cocktail.image}` : '/default-image.jpg'}
                alt={cocktail.name}
                className="community-cocktail-image"
              />
              <h3>{cocktail.name}</h3>
              <div className="rating-section">
                <div className="star-container">
                  <span className="rating-count">{cocktail.ratings?.length || 0} ratings</span>
                  <StarRating rating={cocktail.averageRating || 0} />
                  <span className="average-rating-value">{(cocktail.averageRating || 0).toFixed(1)}</span>
                </div>
                <div className="comment-section">
                  <p className="comment-count">{cocktail.comments?.length || 0} comments</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Nie masz jeszcze żadnych koktajli.</p>
      )}
    </div>
  );
};

export default MyCocktails;

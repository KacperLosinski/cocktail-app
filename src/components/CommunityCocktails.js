import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CommunityCocktails.css';
import { auth } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CommunityCocktails = () => {
  const [communityCocktails, setCommunityCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [removingId, setRemovingId] = useState(null); // ID usuwanego koktajlu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunityCocktails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/community-cocktails`);
        setCommunityCocktails(response.data);
      } catch (error) {
        setError('Failed to fetch community cocktails. Please try again later.');
        console.error('Error fetching community cocktails:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdmin = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdTokenResult();
          setIsAdmin(idToken.claims.admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    fetchCommunityCocktails();
    checkAdmin();
  }, []);

  const handleRemoveCocktail = async (id) => {
    setRemovingId(id);
    try {
      await axios.delete(`${API_URL}/api/community-cocktails/${id}`, {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      });
      setCommunityCocktails((prev) => prev.filter((cocktail) => cocktail._id !== id));
      setError('');
    } catch (error) {
      setError('Failed to remove cocktail. Please try again later.');
      console.error('Error removing cocktail:', error);
    } finally {
      setRemovingId(null);
    }
  };

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
            style={isPartial ? { '--clip-width': `${(currentRating % 1) * 100}%` } : {}}
            onClick={isUserRating ? () => setRating(index + 1) : undefined}
          >
            ★
          </span>
        );
      });
  };

  return (
    <div className="community-cocktails-container">
      <h2>Community Cocktails</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : communityCocktails.length > 0 ? (
        <div className="cocktail-list">
          {communityCocktails.map((cocktail) => (
            <div
              key={cocktail._id}
              className="cocktail-item"
              onClick={() => handleCocktailClick(cocktail._id)}
              role="button"
              tabIndex={0}
              aria-label={`View details of ${cocktail.name}`}
              onKeyPress={(e) => e.key === 'Enter' && handleCocktailClick(cocktail._id)}
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
                  {renderStars(cocktail.averageRating || 0)}
                  <span className="average-rating-value">
                    {(cocktail.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <div className="comment-section">
                  <p className="comment-count">{cocktail.comments?.length || 0} comments</p>
                </div>
              </div>
              <p>By {cocktail.creator || 'Unknown'}</p>
              {isAdmin && (
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCocktail(cocktail._id);
                  }}
                  disabled={removingId === cocktail._id}
                >
                  {removingId === cocktail._id ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No community cocktails available yet.</p>
      )}
    </div>
  );
};

export default CommunityCocktails;

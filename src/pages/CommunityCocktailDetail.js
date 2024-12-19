import React, { useEffect, useState, useCallback } from 'react'; 
import { useParams } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating'; // Ścieżka może się różnić w zależności od lokalizacji komponentu
import '../styles/CommunityCocktailDetail.css';
import { auth } from '../firebase';

const CommunityCocktailDetail = () => {
  const { id } = useParams(); 
  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const { addFavorite, removeFavorite, favorites } = useFavorites();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]); // Domyślna wartość jako pusta tablica
  const maxCommentLength = 1500;

  const API_URL = process.env.REACT_APP_API_URL;

  // Sprawdza, czy koktajl jest już w ulubionych
  const isFavorite = favorites.some((fav) => fav.idDrink === (cocktail?.idDrink || cocktail?._id));

  const fetchCocktailDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/community-cocktails/${id}`, {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch cocktail details.');

      const data = await response.json();
      setCocktail(data.cocktail || data);
      setAverageRating(data.cocktail?.averageRating || data.averageRating || 0);
      setComments(data.comments || []); // Ustawienie domyślnej wartości
    } catch (error) {
      setError('Nie udało się załadować szczegółów koktajlu. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);
  
  useEffect(() => {
    fetchCocktailDetails();
  }, [fetchCocktailDetails]);

  const handleFavoriteClick = () => {
    if (!currentUser) return;

    if (isFavorite) {
      removeFavorite(cocktail._id);
    } else {
      addFavorite(cocktail);
    }
  };

  const handleRatingSubmit = async () => {
    if (!currentUser || rating < 1 || rating > 5) return;

    try {
      const response = await fetch(`${API_URL}/api/community-cocktails/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ score: rating, cocktailId: id, userId: currentUser.uid }),
      });
      if (!response.ok) throw new Error('Failed to submit rating.');

      const updatedData = await response.json();
      setAverageRating(updatedData.averageRating);
      setRating(0);
      fetchCocktailDetails();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleCommentChange = (e) => {
    if (e.target.value.length <= maxCommentLength) {
      setComment(e.target.value);
    }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser || !comment.trim()) return;
  
    try {
      const response = await fetch(`${API_URL}/api/community-cocktails/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ text: comment, userId: currentUser.email }),
      });
      if (!response.ok) throw new Error('Failed to submit comment.');
  
      setComment('');
      setComments((prevComments) => [
        ...prevComments,
        { userName: currentUser.email.split('@')[0], text: comment.trim() }
      ]);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  if (loading) {
    return <p className="loading-message">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!cocktail) {
    return <p className="error-message">Cocktail not found.</p>;
  }

  return (
    <div className="cocktail-detail-container">
      <h2 className="cocktail-name">{cocktail.name}</h2>
      <img src={`${API_URL}${cocktail.image}`} alt={cocktail.name} className="cocktail-image" />

      <h3 className="section-title">Ingredients</h3>
      <div className="ingredients-list">
        {cocktail.ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-item">
            <div className="ingredient-name">{ingredient.name}</div>
            <div className="ingredient-measure">{ingredient.measure}</div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Instructions</h3>
      <p className="instructions">{cocktail.instructions}</p>

      <button
        className={`favorite-button ${isFavorite ? 'favorite' : ''}`}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>

      <div className="rating-section">
        <h3>Average Rating</h3>
        <div className="average-rating">
          <span className="average-rating-value">{averageRating.toFixed(1)}</span>
          <div className="star-container">
          <StarRating currentRating={averageRating} />
          </div>
          <span className="rating-count">{cocktail.ratings?.length || 0} ratings</span>
        </div>

        <h3>Rate this cocktail</h3>
        <div className="star-container">
          <StarRating currentRating={rating} isUserRating={true} onRatingChange={setRating} />
        </div>
        <button onClick={handleRatingSubmit}>Submit Rating</button>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.map((c, index) => (
          <div key={index} className="comment">
            <p><strong>{c.userName}:</strong> {c.text}</p>
          </div>
        ))}
        <textarea
          placeholder="Leave a comment"
          value={comment}
          onChange={handleCommentChange}
          maxLength={maxCommentLength}
        />
        <button onClick={handleCommentSubmit}>Submit Comment</button>
      </div>
    </div>
  );
};

export default CommunityCocktailDetail;

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/CocktailFilters.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CocktailFilters = ({ setCocktails }) => {
  const [ingredient, setIngredient] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllIngredients = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/ingredients`);
        setIngredientsList(response.data.drinks.map((drink) => drink.strIngredient1));
        setError('');
      } catch (error) {
        console.error('Error fetching ingredients list:', error);
        setError('Failed to fetch ingredients list.');
      }
    };

    fetchAllIngredients();
  }, []);

  // Debounced search logic
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleInputChange = useCallback(
    debounce((value) => {
      if (value.length > 0) {
        const filtered = ingredientsList.filter((ing) =>
          ing.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredIngredients(filtered);
      } else {
        setFilteredIngredients([]);
      }
    }, 300),
    [ingredientsList]
  );

  const handleIngredientInput = (e) => {
    const input = e.target.value;
    setIngredient(input);
    handleInputChange(input);
  };

  const handleFilter = async () => {
    if (!ingredient) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/filter/${ingredient}`);
      setCocktails(response.data.drinks || []);
      setError('');
    } catch (error) {
      console.error('Error fetching cocktails by ingredient:', error);
      setError('Failed to fetch cocktails by ingredient.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngredientClick = (selectedIngredient) => {
    setIngredient(selectedIngredient);
    setFilteredIngredients([]);
  };

  return (
    <div className="filter-container">
      <h3 className="filter-title">Filter by Ingredient</h3>
      <div className="filter-input-group">
        <input
          type="text"
          className="filter-input"
          value={ingredient}
          onChange={handleIngredientInput}
          placeholder="Enter ingredient name..."
          aria-label="Filter cocktails by ingredient"
          aria-autocomplete="list"
        />
        <button className="filter-button" onClick={handleFilter} disabled={isLoading}>
          {isLoading ? 'Filtering...' : 'Filter'}
        </button>
      </div>
      {filteredIngredients.length > 0 && (
        <ul className="ingredients-suggestions" aria-live="polite">
          {filteredIngredients.map((ing, index) => (
            <li
              key={index}
              className="ingredient-suggestion-item"
              onClick={() => handleIngredientClick(ing)}
              role="option"
            >
              {ing}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="error-message" aria-live="assertive">{error}</p>}
    </div>
  );
};

export default CocktailFilters;

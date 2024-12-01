import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cocktails, setCocktails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllIngredients = async () => {
      try {
        const response = await axios.get(`${API_URL}/ingredients`);
        // Sprawdzamy, czy `ingredients` istnieje i jest tablicą
        if (response.data && Array.isArray(response.data.ingredients)) {
          const sortedIngredients = response.data.ingredients
            .map(item => item.strIngredient1) // Zakładamy, że `strIngredient1` jest poprawne
            .sort();
          setAllIngredients(sortedIngredients);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching ingredients list:', error);
        setError('Failed to fetch ingredients list.');
      }
    };
    
    fetchAllIngredients();
  }, []);
  

  const addIngredient = () => {
    if (searchTerm.trim() && !ingredients.includes(searchTerm.trim().toLowerCase())) {
      setIngredients([...ingredients, searchTerm.trim().toLowerCase()]);
      setSearchTerm('');
    }
  };

  const addIngredientFromList = (ingredient) => {
    if (!ingredients.includes(ingredient.toLowerCase())) {
      setIngredients([...ingredients, ingredient.toLowerCase()]);
      setSearchTerm('');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter(ing => ing !== ingredient.toLowerCase()));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    handleSearchByIngredients(page, e.target.value);
  };

  const fetchCocktailDetails = async (cocktail) => {
    try {
      const response = await axios.get(`${API_URL}/lookup/${cocktail.idDrink}`);
      
      // Logujemy pełną odpowiedź z serwera
      console.log(`Response for ${cocktail.idDrink}:`, response.data);
      
      // Sprawdzamy, czy struktura odpowiedzi jest zgodna z oczekiwaniami
      if (response.data && Array.isArray(response.data.drinks) && response.data.drinks.length > 0) {
        const cocktailDetails = response.data.drinks[0];
        const ingredientsList = extractIngredients(cocktailDetails);
  
        return {
          ...cocktail,
          ingredients: ingredientsList,
        };
      } else {
        console.warn(`Unexpected response structure for ${cocktail.idDrink}:`, response.data);
        return { ...cocktail, ingredients: [] };
      }
  
    } catch (error) {
      console.error(`Error fetching details for cocktail ${cocktail.idDrink}:`, error);
      return { ...cocktail, ingredients: [] };
    }
  };
  
  
  
  
  
  const extractIngredients = (cocktail) => {
    if (!cocktail || !cocktail.strIngredient1) return [];
  
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      if (ingredient) ingredients.push(ingredient.toLowerCase());
    }
    return ingredients;
  };

  const fetchAllPages = async () => {
    let allCocktails = [];
    let currentPage = 1;
    let totalPages = 1;
  
    try {
      do {
        const response = await axios.post(`${API_URL}/cocktails`, {
          ingredients,
          page: currentPage,
          limit: 50,
        });
        const result = response.data;
        console.log(`Page ${currentPage} response:`, result); // Log the result for each page
  
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch cocktails');
        }
  
        allCocktails = [...allCocktails, ...result.data];
        totalPages = result.totalPages;
        currentPage++;
      } while (currentPage <= totalPages);
  
      console.log("All Cocktails:", allCocktails.map(cocktail => cocktail.idDrink)); // Log idDrink values
      return allCocktails;
    } catch (error) {
      console.error('Error fetching all cocktails:', error);
      setError('Failed to fetch cocktails. Please try again later.');
      setLoading(false);
      return [];
    }
  };
  

  const sortAndPaginate = (cocktails, selectedPage, sortOption) => {
    let filteredCocktails = cocktails;

    if (sortOption === 'have-all-ingredients') {
        // Filter to include only cocktails that have all ingredients
        filteredCocktails = cocktails.filter(cocktail =>
            cocktail.ingredients.every(ing => ingredients.includes(ing))
        );
    }

    const sortedCocktails = filteredCocktails
        .filter(cocktail => cocktail && Array.isArray(cocktail.ingredients))
        .sort((a, b) => {
            if (sortOption === 'alphabetical-asc') {
                return (a.strDrink || '').localeCompare(b.strDrink || '');
            }
            if (sortOption === 'alphabetical-desc') {
                return (b.strDrink || '').localeCompare(a.strDrink || '');
            }
            if (sortOption === 'matching-ingredients') {
                const matchingA = a.ingredients.filter(ing => ingredients.includes(ing)).length;
                const matchingB = b.ingredients.filter(ing => ingredients.includes(ing)).length;
                return matchingB - matchingA;
            }
            if (sortOption === 'missing-ingredients') {
                const missingA = a.ingredients.filter(ing => !ingredients.includes(ing)).length;
                const missingB = b.ingredients.filter(ing => !ingredients.includes(ing)).length;
                return missingA - missingB;
            }
            return 0;
        });

    const startIndex = (selectedPage - 1) * 50;
    const paginatedCocktails = sortedCocktails.slice(startIndex, startIndex + 50);

    setCocktails(paginatedCocktails);
    setPage(selectedPage);
    setTotalPages(Math.ceil(sortedCocktails.length / 50));
};

  
  

  const handleSearchByIngredients = async (selectedPage = 1) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
  
    const allCocktails = await fetchAllPages();
  
    if (allCocktails.length > 0) {
      const detailedCocktails = await Promise.all(
        allCocktails.map(cocktail => fetchCocktailDetails(cocktail))
      );
  
      console.log("Page 1 response:", detailedCocktails); // Dodaj ten log tutaj
  
      sortAndPaginate(detailedCocktails, selectedPage, sortOption);
    } else {
      setCocktails([]);
    }
  
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    handleSearchByIngredients(newPage);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Search for Cocktails Based on Ingredients</h1>
      <div className="home-search-container">
        <input
          type="text"
          className="home-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter ingredient name..."
        />
        <button className="home-add-button" onClick={addIngredient} disabled={loading}>
          Add Ingredient
        </button>
        {searchTerm && (
          <div className="home-ingredients-dropdown">
            {allIngredients
              .filter(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((ingredient, index) => (
                <div key={index} className="home-ingredient-option" onClick={() => addIngredientFromList(ingredient)}>
                  {ingredient} <button className="home-add-ingredient-button"></button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="home-ingredients-list">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="home-ingredient-item">
            {ingredient}
            <button className="home-remove-button" onClick={() => removeIngredient(ingredient)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="sort-search-container">
    <div className="sort-container">
      <label htmlFor="sort">Sort by:</label>
      <select id="sort" value={sortOption} onChange={handleSortChange}>
        <option value="">Default</option>
        <option value="alphabetical-asc">Alphabetical (A-Z)</option>
        <option value="alphabetical-desc">Alphabetical (Z-A)</option>
        <option value="matching-ingredients">Matching Ingredients</option>
        <option value="missing-ingredients">Missing Ingredients</option>
        <option value="have-all-ingredients">You have all ingredients</option>
      </select>
    </div>

    <button
      className="home-search-by-ingredients-button"
      onClick={() => handleSearchByIngredients()}
      disabled={loading}
    >
      {loading ? 'Searching...' : 'Search Cocktails'}
    </button>
  </div>

  {error && <p className="home-error-message">{error}</p>}
{cocktails.length > 0 && !loading ? (
  <div className="home-cocktail-list">
    {cocktails
      .filter(cocktail => cocktail.strDrinkThumb && cocktail.strDrink) // Filtrujemy koktajle bez zdjęcia lub nazwy
      .map(cocktail => (
        <div
          key={cocktail.idDrink}
          className="home-cocktail-item"
          onClick={() => navigate(`/cocktail/${cocktail.idDrink}`)}
        >
          <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} className="home-cocktail-image" />
          <div className="home-cocktail-name">{cocktail.strDrink}</div>
          <div className="home-cocktail-description">
            Ingredients: {cocktail.ingredients && cocktail.ingredients.length > 0 
              ? cocktail.ingredients.join(', ') 
              : 'No ingredients listed'}
          </div>
        </div>
      ))}
  </div>
) : (
  hasSearched && !loading && (
    <div className="home-no-cocktails">
      No cocktails found with the selected ingredients. Try adding or removing ingredients.
    </div>
  )
)}


      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`pagination-button ${page === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

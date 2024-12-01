// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_EXTERNAL_API_URL || 'https://www.thecocktaildb.com/api/json/v1/1';

export const fetchCocktailByName = async (name) => {
  try {
    const response = await axios.get(`${API_URL}search.php?s=${name}`);
    return response.data.drinks;
  } catch (error) {
    console.error('Error fetching cocktails by name:', error);
    return [];
  }
};

export const fetchCocktailByIngredient = async (ingredient) => {
  try {
    const response = await axios.get(`${API_URL}filter.php?i=${ingredient}`);
    return response.data.drinks;
  } catch (error) {
    console.error('Error fetching cocktails by ingredient:', error);
    return [];
  }
};

// Poprawiona nazwa funkcji tutaj
export const fetchCocktailDetailsById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}lookup.php?i=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cocktail details by ID:', error);
    throw error;
  }
};

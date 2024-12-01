import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AddCocktail.css';
import getCroppedImg from '../utils/cropImage';

const AddCocktail = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', measure: '' }]);
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [message, setMessage] = useState('');
  const [cropSuccess, setCropSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Wskaźnik ładowania

  const maxInstructionsLength = 3000;

  const token = localStorage.getItem('authToken');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Dynamiczne API

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', measure: '' }]);
  };

  const handleChangeIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Obsługa typów plików
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setMessage('Unsupported file type. Please upload a JPEG or PNG image.');
      return;
    }

    if (file.size <= 5 * 1024 * 1024) {
      setImage(URL.createObjectURL(file));
      setMessage('');
    } else {
      setMessage('File size must be less than 5MB.');
    }
  };

  const showCroppedImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(croppedImageBlob);
      setCropSuccess('Image cropped successfully!');
      setTimeout(() => setCropSuccess(''), 3000);
    } catch (e) {
      console.error('Error cropping image:', e);
      setMessage('Failed to crop image.');
    }
  }, [image, croppedAreaPixels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Ustawienie wskaźnika ładowania

    const formData = new FormData();
    formData.append('userId', currentUser.email);
    formData.append('name', name);
    formData.append('instructions', instructions);
    formData.append('image', croppedImage);

    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}][name]`, ingredient.name);
      formData.append(`ingredients[${index}][measure]`, ingredient.measure);
    });

    try {
      const response = await axios.post(`${API_URL}/api/community-cocktails`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      console.log('Cocktail added successfully:', response.data);
    } catch (error) {
      console.error('Failed to add cocktail:', error.response?.data || error);
      setMessage('Failed to add cocktail. Try again later.');
    } finally {
      setIsLoading(false); // Wyłączenie wskaźnika ładowania
    }
  };

  return (
    <div className="add-cocktail-container">
      <h2>Add Your Cocktail</h2>
      {message && <p className="message">{message}</p>}
      {cropSuccess && <p className="success-message">{cropSuccess}</p>}
      {isLoading && <p className="loading-message">Adding your cocktail...</p>}

      <form onSubmit={handleSubmit} className="add-cocktail-form">
        <div className="form-group">
          <label>Cocktail Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Ingredients:</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-group">
              <input
                type="text"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => handleChangeIngredient(index, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Measure"
                value={ingredient.measure}
                onChange={(e) => handleChangeIngredient(index, 'measure', e.target.value)}
                required
              />
              <button
                type="button"
                className="remove-ingredient-button"
                onClick={() => handleRemoveIngredient(index)}
              >
                X
              </button>
            </div>
          ))}
          <button type="button" className="add-ingredient-button" onClick={handleAddIngredient}>
            Add Ingredient
          </button>
        </div>

        <div className="form-group">
          <label>Instructions:</label>
          <textarea
            value={instructions}
            maxLength={maxInstructionsLength}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
          <p>{instructions.length}/{maxInstructionsLength} characters</p>
        </div>

        <div className="form-group">
          <label htmlFor="file-upload" className="custom-file-label">
            Choose Image
          </label>
          <input
            id="file-upload"
            className="file-input"
            type="file"
            onChange={handleImageChange}
            required
          />
        </div>

        {image && (
          <div className="cropper-container">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <button type="button" onClick={showCroppedImage} className="submit-button">
          Crop Image
        </button>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Cocktail'}
        </button>
      </form>
    </div>
  );
};

export default AddCocktail;

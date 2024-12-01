import React, { useState, useEffect } from 'react';
import '../styles/AgeVerification.css';
import { useNavigate } from 'react-router-dom';

const AgeVerification = ({ onVerify, title = "Are You 18 or Older?", underageRedirect = '/' }) => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const ageVerified = localStorage.getItem('ageVerified');
      if (ageVerified === 'true') {
        setIsAgeVerified(true);
        onVerify(true); // Weryfikacja się powiodła
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [onVerify]);

  const handleAgeVerification = () => {
    try {
      localStorage.setItem('ageVerified', 'true');
      setIsAgeVerified(true);
      onVerify(true); // Potwierdzenie, że weryfikacja się powiodła
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handleUnderage = () => {
    alert('Unfortunately, you do not have access to this site.');
    navigate(underageRedirect); // Przekierowanie dla niepełnoletnich
  };

  if (isAgeVerified) {
    return null; // Jeśli weryfikacja została przeprowadzona, okno się nie pokazuje
  }

  return (
    <div className="age-verification-overlay" aria-live="polite">
      <div className="age-verification-container">
        <h2>{title}</h2>
        <div className="age-verification-buttons">
          <button
            onClick={handleAgeVerification}
            className="age-verification-button"
            aria-label="Confirm you are 18 or older"
          >
            Yes, I am 18 or older
          </button>
          <button
            onClick={handleUnderage}
            className="age-verification-button underage"
            aria-label="Confirm you are under 18"
          >
            No, I am under 18
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;

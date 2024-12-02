import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import CocktailDetail from './pages/CocktailDetail';
import CommunityCocktailDetail from './pages/CommunityCocktailDetail';
import { AppWrapper } from './components/Header'; // Importuje komponent AppWrapper do przyklejonej nawigacji
import AddCocktail from './components/AddCocktail'; 
import CommunityCocktails from './components/CommunityCocktails';  
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AgeVerification from './components/AgeVerification';
import './styles/App.css'; 
import '@fontsource/titillium-web';

// Komponent do zabezpieczania tras (tylko dla zalogowanych użytkowników)
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  const handleAgeVerification = (verified) => {
    setIsAgeVerified(verified);
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router basename="/cocktail-app"> {/* Dodano basename dla obsługi podfolderu */}
          {!isAgeVerified && <AgeVerification onVerify={handleAgeVerification} />}
          {isAgeVerified && (
            <AppWrapper> {/* Cała aplikacja z nawigacją przyklejoną u góry */}
              <div className="app-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/cocktail/:id" element={<CocktailDetail />} />
                  <Route path="/add-cocktail" element={<PrivateRoute><AddCocktail /></PrivateRoute>} />
                  <Route path="/community-cocktails" element={<PrivateRoute><CommunityCocktails /></PrivateRoute>} />
                  <Route path="/community-cocktail/:id" element={<CommunityCocktailDetail />} />           
                  <Route path="*" element={<h2 className="error-404">404 Not Found</h2>} />
                </Routes>
              </div>
            </AppWrapper>
          )}
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;

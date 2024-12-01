import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import styled from 'styled-components';



// Stylizacja nawigacji z przyklejeniem do góry i nową paletą kolorów
const Nav = styled.nav`
  background-color: #0b1455;
  color: #f8faff;
  font-weight: bold;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  font-family: 'Anton SC', sans-serif; /* Ustawienie czcionki Anton SC */
`;

const NavBrand = styled(Link)`
  font-size: 1.8rem;
  color: #1cdc6a;
  text-decoration: none;
  font-family: 'Titillium Web', sans-serif;


  &:hover {
    color: #ee4f19;
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Titillium Web', sans-serif;


  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 60px;
    left: 0;
    background-color: #0b1455;
    padding: 1rem;
    border-radius: 0 0 10px 10px;
    display: ${({ open }) => (open ? 'flex' : 'none')};
  }
`;

const NavLink = styled(Link)`
  color: #d8e3e0;
  text-decoration: none;
  margin-right: 1.5rem;
  font-size: 1rem;
  font-family: 'Titillium Web', sans-serif;
  transition: color 0.3s ease;

  &:hover {
    color: #ee4f19;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`;

const NavButton = styled.button`
  background-color: #3d2fee;
  border: none;
  color: #f8faff;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
  font-family: 'Anton SC', sans-serif; /* Ustawienie czcionki Anton SC dla przycisku */
  font-weight: bold;

  &:hover {
    background-color: #ee4f19;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0.5rem 0;
  }
`;


const MenuIcon = styled.div`
  display: none;
  cursor: pointer;
  color: #f8faff;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Nav>
      <NavBrand to="/">My Cocktail App</NavBrand>

      <MenuIcon onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </MenuIcon>

      <NavLinks open={menuOpen}>
        <NavLink to="/">Home</NavLink>
        {currentUser ? (
          <>
            <NavLink to="/favorites">Favorites</NavLink>
            <NavLink to="/add-cocktail">Add Cocktail</NavLink>
            <NavLink to="/community-cocktails">Community Cocktails</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavButton onClick={handleLogout}>Logout</NavButton>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

// Eksport komponentu kontenera do przyklejenia
export const AppWrapper = ({ children }) => (
  <div style={{ paddingTop: '4rem'}}>
    <Header />
    {children}
  </div>
);

export default Header;
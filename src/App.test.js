import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Dodanie Routera dla tras
import App from './App';

test('renders Home page with Search Cocktails button', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  
  // Sprawdzamy, czy przycisk "Search Cocktails" istnieje na stronie głównej
  const searchButton = screen.getByText(/Search Cocktails/i);
  expect(searchButton).toBeInTheDocument();
});


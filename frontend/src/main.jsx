import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Performance optimization: Disable React StrictMode in production
const StrictModeWrapper = process.env.NODE_ENV === 'production' 
  ? React.Fragment
  : React.StrictMode;

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictModeWrapper>
    <App />
  </StrictModeWrapper>
);
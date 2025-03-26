import React from 'react';
import emailIcon from '../assets/email.png';
import instagramIcon from '../assets/instagram.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="copyright">&copy; {currentYear} CrumbCompass. All rights reserved.</p>
        </div>
        <div className="footer-section">
          <ul className="social-links">
            <li>
              <a href="mailto:crumbcompass@gmail.com" aria-label="Email">
                <img src={emailIcon} alt="Email" className="footer-icon" /> crumbcompass@gmail.com
              </a>
            </li>
            <li>
              <a href="https://instagram.com/crumbcompass" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src={instagramIcon} alt="Instagram" className="footer-icon" /> @crumbcompass
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
    );
  };
  
  export default Footer;
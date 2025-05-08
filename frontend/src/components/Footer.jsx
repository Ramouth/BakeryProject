import React from 'react';
import { Mail, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="copyright">&copy; {currentYear} CrumbCompass. All rights reserved.</p>
        </div>
        <div className="footer-section">
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
        <div className="footer-section">
          <ul className="social-links">
            <li>
              <a href="mailto:crumbcompass@gmail.com" aria-label="Email">
                <Mail className="footer-icon" /> crumbcompass@gmail.com
              </a>
            </li>
            <li>
              <a href="https://instagram.com/crumbcompass" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="footer-icon" /> @crumbcompass
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
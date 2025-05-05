import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/other/cookie-banner.css';
const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    if (!hasAcceptedCookies) {
      setIsVisible(true);
    }
  }, []);
  
  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p>
          We use necessary cookies and store some data (e.g., IP addresses, email addresses, usernames, and passwords) 
          for security purposes, such as preventing DoS attacks. We comply with GDPR regulations.
        </p>
        <div className="cookie-banner-actions">
          <Link to="/privacy-policy" className="cookie-privacy-link">
            Read More
          </Link>
          <button onClick={acceptCookies} className="btn btn-primary cookie-accept-btn">
            Accept Necessary Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
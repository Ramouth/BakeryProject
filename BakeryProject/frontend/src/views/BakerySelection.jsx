import { useState, useEffect } from 'react';
import { useReview } from '../store/ReviewContext';
import bakeryService from '../services/bakeryService'; 

const BakerySelection = () => {
  const { selectedBakery, setSelectedBakery, goToNextStep } = useReview();
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bakeries from API
  useEffect(() => {
    const fetchBakeries = async () => {
      try {
        const data = await bakeryService.getAllBakeries(); // Use the bakeryService to get bakeries
        setBakeries(data); // Assume the response directly returns an array of bakeries
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError('Failed to load bakeries. Please try again later.');
        setLoading(false);
      }
    };

    fetchBakeries();
  }, []);
  
  // Handle bakery selection
  const handleBakerySelect = (bakery) => {
    setSelectedBakery(bakery);
  };

  // Handle next step
  const handleNext = () => {
    if (selectedBakery) {
      goToNextStep('pastrySelection');
    }
  };

  if (loading) {
    return <div className="container"><div className="card">Loading bakeries...</div></div>;
  }
  
  if (error) {
    return <div className="container"><div className="card error-message">{error}</div></div>;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h2>Choose a bakery</h2>
        <p>Where did you go?</p>
        
        <div className="dropdown-list">
          {bakeries.map((bakery) => (
            <div 
              key={bakery.id} 
              className={`dropdown-item ${selectedBakery && selectedBakery.id === bakery.id ? 'selected' : ''}`}
              onClick={() => handleBakerySelect(bakery)}
            >
              {bakery.name}
            </div>
          ))}
        </div>
        
        <div className="nav-buttons">
          <button className="btn" onClick={() => goToNextStep('start')}>
            back
          </button>
          <button className="btn" onClick={() => {}} style={{ visibility: 'hidden' }}>
            skip
          </button>
          <button 
            className="btn"
            onClick={handleNext}
            disabled={!selectedBakery}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BakerySelection;
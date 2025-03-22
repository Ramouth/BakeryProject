import { useState, useEffect } from 'react';
import { useReview } from '../store/reviewContext';

const BakerySelection = () => {
  const { selectedBakery, setSelectedBakery, goToNextStep } = useReview();
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOther, setShowOther] = useState(false);
  const [customBakeryName, setCustomBakeryName] = useState('');
  
  // Fetch bakeries from API
  useEffect(() => {
    const fetchBakeries = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockBakeries = [
          { id: 1, name: 'Hart Bakery', location: 'Copenhagen' },
          { id: 2, name: 'Andersen Bakery', location: 'Frederiksberg' },
          { id: 3, name: 'Meyers Bageri', location: 'Copenhagen' },
          { id: 4, name: 'Lagkagehuset', location: 'Copenhagen' },
          { id: 5, name: 'Bageriet', location: 'Frederiksberg' },
        ];
        
        setBakeries(mockBakeries);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bakeries. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBakeries();
  }, []);
  
  // Handle bakery selection
  const handleBakerySelect = (bakery) => {
    setSelectedBakery(bakery);
    setShowOther(false);
  };
  
  // Handle "Other" option
  const handleOtherSelect = () => {
    setShowOther(true);
    setSelectedBakery(null);
  };
  
  // Handle custom bakery submission
  const handleCustomBakerySubmit = () => {
    if (customBakeryName.trim().length > 0) {
      setSelectedBakery({
        id: 'custom',
        name: customBakeryName,
        location: 'Custom Location'
      });
    }
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
        <h2>Bakery Reviews</h2>
        <p>Which did you visit?</p>
        
        <div className="dropdown-list">
          {bakeries.map((bakery, index) => (
            <div 
              key={bakery.id} 
              className={`dropdown-item ${selectedBakery && selectedBakery.id === bakery.id ? 'selected' : ''}`}
              onClick={() => handleBakerySelect(bakery)}
            >
              Option {index + 1}: {bakery.name}
            </div>
          ))}
          <div 
            className={`dropdown-item ${showOther ? 'selected' : ''}`}
            onClick={handleOtherSelect}
          >
            Other
          </div>
        </div>
        
        {showOther && (
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter bakery name"
              value={customBakeryName}
              onChange={(e) => setCustomBakeryName(e.target.value)}
            />
            <button 
              className="btn"
              onClick={handleCustomBakerySubmit}
              disabled={customBakeryName.trim().length === 0}
            >
              add
            </button>
          </div>
        )}
        
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
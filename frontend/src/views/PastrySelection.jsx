import { useState, useEffect } from 'react';
import { useReview } from '../store/reviewContext';

const PastrySelection = () => {
  const { selectedBakery, selectedPastry, setSelectedPastry, goToNextStep } = useReview();
  const [pastries, setPastries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customPastryName, setCustomPastryName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  
  // Fetch pastries from API based on selected bakery
  useEffect(() => {
    const fetchPastries = async () => {
      try {
        // In a real app, this would be an API call filtered by bakery ID
        // For now, we'll use mock data
        const mockPastries = [
          { id: 1, name: 'Croissant', bakeryId: 1 },
          { id: 2, name: 'Pain au Chocolat', bakeryId: 1 },
          { id: 3, name: 'Cinnamon Roll', bakeryId: 1 },
          { id: 4, name: 'Danish Pastry', bakeryId: 1 },
          { id: 5, name: 'Sourdough Bread', bakeryId: 1 },
        ];
        
        setPastries(mockPastries);
        setLoading(false);
      } catch (err) {
        setError('Failed to load pastries. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPastries();
  }, [selectedBakery]);
  
  // Handle pastry selection
  const handlePastrySelect = (pastry) => {
    setSelectedPastry(pastry);
    setShowCustom(false);
  };
  
  // Handle "Other" option
  const handleOtherSelect = () => {
    setShowCustom(true);
    setSelectedPastry(null);
  };
  
  // Handle custom pastry submission
  const handleCustomPastrySubmit = () => {
    if (customPastryName.trim().length > 0) {
      setSelectedPastry({
        id: 'custom',
        name: 'Other',
        customName: customPastryName,
        bakeryId: selectedBakery.id
      });
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (selectedPastry) {
      goToNextStep('pastryRating');
    }
  };
  
  if (loading) {
    return <div className="container"><div className="card">Loading pastries...</div></div>;
  }
  
  if (error) {
    return <div className="container"><div className="card error-message">{error}</div></div>;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h2>Bakery Reviews</h2>
        <p>{selectedBakery.name} - Option 1</p>
        
        <div className="dropdown-list">
          {pastries.map((pastry, index) => (
            <div 
              key={pastry.id} 
              className={`dropdown-item ${selectedPastry && selectedPastry.id === pastry.id ? 'selected' : ''}`}
              onClick={() => handlePastrySelect(pastry)}
            >
              Option {index + 1}: {pastry.name}
            </div>
          ))}
          <div 
            className={`dropdown-item ${showCustom ? 'selected' : ''}`}
            onClick={handleOtherSelect}
          >
            Other
          </div>
        </div>
        
        {showCustom && (
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter pastry name"
              value={customPastryName}
              onChange={(e) => setCustomPastryName(e.target.value)}
            />
            <button 
              className="btn"
              onClick={handleCustomPastrySubmit}
              disabled={customPastryName.trim().length === 0}
            >
              add
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn">choose different pastry</button>
        </div>
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('bakerySelection')}
          >
            back
          </button>
          <button 
            className="btn"
            onClick={() => {}}
            style={{ visibility: 'hidden' }}
          >
            skip
          </button>
          <button 
            className="btn"
            onClick={handleNext}
            disabled={!selectedPastry}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastrySelection;
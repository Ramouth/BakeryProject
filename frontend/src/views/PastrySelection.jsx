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
    return <div className="container">Loading pastries...</div>;
  }
  
  if (error) {
    return <div className="container error-message">{error}</div>;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h2>Choose Pastry</h2>
        <p>Select a pastry from {selectedBakery.name}</p>
        
        <div className="dropdown-list">
          {pastries.map(pastry => (
            <div 
              key={pastry.id} 
              className={`dropdown-item ${selectedPastry && selectedPastry.id === pastry.id ? 'selected' : ''}`}
              onClick={() => handlePastrySelect(pastry)}
            >
              {pastry.name}
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
            <label htmlFor="customPastry">Enter Pastry Name:</label>
            <input
              type="text"
              id="customPastry"
              placeholder="Pastry name"
              value={customPastryName}
              onChange={(e) => setCustomPastryName(e.target.value)}
            />
            <button 
              className="btn btn-secondary"
              onClick={handleCustomPastrySubmit}
              disabled={customPastryName.trim().length === 0}
            >
              Add Pastry
            </button>
          </div>
        )}
        
        <div className="nav-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => goToNextStep('bakerySelection')}
          >
            Back
          </button>
          <button 
            className="btn"
            onClick={handleNext}
            disabled={!selectedPastry}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastrySelection;
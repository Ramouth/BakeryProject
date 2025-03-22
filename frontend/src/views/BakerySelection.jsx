import { useState, useEffect } from 'react';
import { useReview } from '../store/reviewContext';

const BakerySelection = () => {
  const { selectedBakery, setSelectedBakery, goToNextStep } = useReview();
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [showOther, setShowOther] = useState(false);
  const [customBakeryName, setCustomBakeryName] = useState('');
  
  // Fetch bakeries from API
  useEffect(() => {
    const fetchBakeries = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockBakeries = [
          { id: 1, name: 'Hart Bageri', location: 'Copenhagen' },
          { id: 2, name: 'Andersen Bakery', location: 'Frederiksberg' },
          { id: 3, name: 'Meyers Bageri', location: 'Copenhagen' },
          { id: 4, name: 'Lagkagehuset', location: 'Copenhagen' },
          { id: 5, name: 'Bageriet', location: 'Frederiksberg' },
        ];
        
        setBakeries(mockBakeries);
        setFilteredBakeries(mockBakeries);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bakeries. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBakeries();
  }, []);
  
  // Filter bakeries when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBakeries(bakeries);
    } else {
      const filtered = bakeries.filter(bakery => 
        bakery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bakery.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBakeries(filtered);
    }
  }, [searchTerm, bakeries]);
  
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
    return <div className="container">Loading bakeries...</div>;
  }
  
  if (error) {
    return <div className="container error-message">{error}</div>;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h2>Select a Bakery</h2>
        <p>Choose a bakery from Copenhagen or Frederiksberg</p>
        
        <div className="form-group">
          <label htmlFor="search">Search Bakeries:</label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="dropdown-list">
          {filteredBakeries.map(bakery => (
            <div 
              key={bakery.id} 
              className={`dropdown-item ${selectedBakery && selectedBakery.id === bakery.id ? 'selected' : ''}`}
              onClick={() => handleBakerySelect(bakery)}
            >
              <strong>{bakery.name}</strong> - {bakery.location}
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
            <label htmlFor="customBakery">Enter Bakery Name:</label>
            <input
              type="text"
              id="customBakery"
              placeholder="Bakery name"
              value={customBakeryName}
              onChange={(e) => setCustomBakeryName(e.target.value)}
            />
            <button 
              className="btn btn-secondary"
              onClick={handleCustomBakerySubmit}
              disabled={customBakeryName.trim().length === 0}
            >
              Add Bakery
            </button>
          </div>
        )}
        
        <div className="nav-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => goToNextStep('start')}
          >
            Back
          </button>
          <button 
            className="btn"
            onClick={handleNext}
            disabled={!selectedBakery}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BakerySelection;
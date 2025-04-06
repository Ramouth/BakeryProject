import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RatingBar from '../components/RatingComponent';
import '../styles/product-profile.css';

const ProductProfile = () => {
  const { productId, bakeryId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    // Mock data fetch - in a real app, this would be an API call
    const fetchProductData = async () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data for the product
        const mockProduct = {
          id: productId,
          name: "Rugbrød",
          bakeryId: bakeryId,
          bakeryName: "Lagkagehuset",
          bakeryLocation: "Torvegade 45, 1400 København K",
          description: "Traditional Danish rye bread. Dense, dark and full of flavor with a slight tanginess from the sourdough. Perfect for smørrebrød (open sandwiches).",
          ratings: {
            overall: 4.8,
            taste: 4.9,
            value: 4.5,
            appearance: 4.7
          },
          reviewCount: 86,
          nutritionalInfo: {
            calories: 220,
            fat: "1g",
            carbs: "43g",
            protein: "7g",
            fiber: "8g"
          },
          ingredients: [
            "Whole grain rye flour", 
            "Water", 
            "Sourdough starter", 
            "Salt", 
            "Malt extract"
          ],
          serving: "Perfect for traditional Danish open sandwiches. Pairs well with pickled herring, egg, or leverpostej (liver pate).",
          similarProducts: [
            { id: 101, name: "Sourdough Bread", bakeryId: 2, bakeryName: "Hart Bageri" },
            { id: 102, name: "Rugbrød", bakeryId: 5, bakeryName: "Meyers Bageri" },
            { id: 103, name: "Dark Rye", bakeryId: 4, bakeryName: "Andersen Bakery" }
          ],
          availability: "Daily",
          reviews: [
            {
              id: 1,
              userName: "Morten J.",
              date: "October 12, 2024",
              rating: 5,
              comment: "The best rugbrød in Copenhagen! Dense and flavorful with the perfect crust. I buy this every week for my smørrebrød."
            },
            {
              id: 2,
              userName: "Sofie H.",
              date: "October 5, 2024",
              rating: 5,
              comment: "Authentic Danish rugbrød with a wonderful depth of flavor. Stays fresh for days and has the perfect texture."
            },
            {
              id: 3,
              userName: "Thomas P.",
              date: "September 28, 2024",
              rating: 4,
              comment: "Very good traditional rugbrød. Not quite as good as my grandmother's, but definitely the best you can buy in the city!"
            },
            {
              id: 4,
              userName: "Clara M.",
              date: "September 22, 2024",
              rating: 5,
              comment: "Excellent texture and flavor. Love that it's not too dense but still holds up well with toppings. Perfect for lunch!"
            }
          ]
        };

        setProduct(mockProduct);
        setLoading(false);
      }, 500);
    };

    fetchProductData();
  }, [productId, bakeryId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="product-profile-container">
      {/* Product header */}
      <div className="product-header">
        <div className="product-header-content">
          <div className="product-bakery">
            <Link to={`/bakery/${product.bakeryId}`}>{product.bakeryName}</Link>
          </div>
          <h1>{product.name}</h1>
          <div className="product-rating-summary">
            <span className="product-rating-value">{product.ratings.overall}</span>
            <span className="product-rating-stars">★★★★★</span>
            <span className="product-review-count">({product.reviewCount} reviews)</span>
          </div>
        </div>
        <div className="product-image-container">
          <div className="product-image-placeholder"></div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="product-tabs">
        <button 
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      {/* Tab content */}
      <div className="product-content">
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <div className="reviews-summary">
              <div className="reviews-total">
                <span className="large-rating">{product.ratings.overall}</span>
                <span className="total-reviews">{product.reviewCount} reviews</span>
              </div>
              
              <div className="rating-details">
                <div className="rating-item">
                  <span className="rating-label">Overall:</span>
                  <RatingBar rating={product.ratings.overall * 2} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Taste:</span>
                  <RatingBar rating={product.ratings.taste * 2} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Value:</span>
                  <RatingBar rating={product.ratings.value * 2} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Appearance:</span>
                  <RatingBar rating={product.ratings.appearance * 2} max={10} disabled={true} />
                </div>
              </div>
              
              <button className="btn btn-primary">Write a Review</button>
            </div>
            
            <div className="reviews-list">
              {product.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{review.userName}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  
                  <div className="review-rating">
                    {Array.from({length: 5}).map((_, index) => (
                      <span key={index} className={index < review.rating ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
              
              <button className="btn btn-secondary load-more">Load More Reviews</button>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-section">
            <h2>About this {product.name}</h2>
            <p className="product-description">{product.description}</p>
            
            <div className="product-details">
              <div className="availability-section">
                <h3>Availability</h3>
                <p>{product.availability}</p>
                <p>Available at <Link to={`/bakery/${product.bakeryId}`}>{product.bakeryName}</Link>, {product.bakeryLocation}</p>
              </div>
              
              <div className="serving-section">
                <h3>Serving Suggestion</h3>
                <p>{product.serving}</p>
              </div>
            </div>
            
            <div className="similar-products-section">
              <h3>Similar Products</h3>
              <div className="similar-products">
                {product.similarProducts.map(item => (
                  <div key={item.id} className="similar-product-card">
                    <div className="similar-product-img-placeholder"></div>
                    <div className="similar-product-info">
                      <h4>{item.name}</h4>
                      <div className="similar-product-bakery">
                        <Link to={`/bakery/${item.bakeryId}`}>{item.bakeryName}</Link>
                      </div>
                      <Link to={`/product/${item.id}/bakery/${item.bakeryId}`} className="btn btn-small">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductProfile;
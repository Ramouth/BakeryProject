import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import RatingBar from '../components/RatingComponent';
import '../styles/product-profile.css';

const ProductProfile = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [bakery, setBakery] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product details with caching (60 seconds default)
        const productResponse = await apiClient.get(`/products/${productId}`, true);
        setProduct(productResponse);
        
        // If we have a bakery ID, fetch bakery details with caching
        if (productResponse.bakeryId) {
          const bakeryResponse = await apiClient.get(`/bakeries/${productResponse.bakeryId}`, true);
          setBakery(bakeryResponse);
          
          // Fetch similar products (other products from same bakery) with caching
          try {
            const similarResponse = await apiClient.get(`/products/bakery/${productResponse.bakeryId}`, true);
            // Filter out the current product and limit to 3 items
            const filtered = similarResponse.products
              .filter(item => item.id !== parseInt(productId))
              .slice(0, 3);
            setSimilarProducts(filtered);
          } catch (error) {
            console.error('Error fetching similar products:', error);
            setSimilarProducts([]);
          }
        }
        
        // Fetch product reviews with caching (shorter time as reviews change more often)
        try {
          const reviewsResponse = await apiClient.get(`/productreviews/product/${productId}`, true);
          setProductReviews(reviewsResponse.productReviews || []);
        } catch (error) {
          console.error('Error fetching product reviews:', error);
          setProductReviews([]);
        }
        
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError('Failed to load product information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  // Calculate ratings from reviews
  const calculateRatings = () => {
    if (!productReviews || productReviews.length === 0) {
      return {
        overall: 0,
        taste: 0,
        price: 0,
        presentation: 0
      };
    }
    
    const sumRatings = productReviews.reduce((acc, review) => {
      return {
        overall: acc.overall + (review.overallRating || 0),
        taste: acc.taste + (review.tasteRating || 0),
        price: acc.price + (review.priceRating || 0),
        presentation: acc.presentation + (review.presentationRating || 0)
      };
    }, { overall: 0, taste: 0, price: 0, presentation: 0 });
    
    const count = productReviews.length;
    
    return {
      overall: sumRatings.overall / count,
      taste: sumRatings.taste / count,
      price: sumRatings.price / count,
      presentation: sumRatings.presentation / count
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p className="error-message">Product not found</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const ratings = calculateRatings();
  const reviewCount = productReviews.length;

  // Format bakery address
  const formatBakeryAddress = () => {
    if (!bakery) return '';
    
    const addressParts = [];
    if (bakery.streetName) addressParts.push(bakery.streetName);
    if (bakery.streetNumber) addressParts.push(bakery.streetNumber);
    if (bakery.zipCode) addressParts.push(bakery.zipCode);
    
    return addressParts.join(' ');
  };

  return (
    <div className="product-profile-container">
      {/* Product header */}
      <div className="product-header">
        <div className="product-header-content">
          <div className="product-bakery">
            {bakery && <Link to={`/bakery/${bakery.id}`}>{bakery.name}</Link>}
          </div>
          <h1>{product.name}</h1>
          <div className="product-rating-summary">
            <span className="product-rating-value">{(ratings.overall / 2).toFixed(1)}</span>
            <span className="product-rating-stars">★★★★★</span>
            <span className="product-review-count">({reviewCount} reviews)</span>
          </div>
        </div>
        <div className="product-image-container">
          <div className="product-image-placeholder">
            {/* If product has an image URL, use it here */}
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="product-image" />
            )}
          </div>
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
                <span className="large-rating">{(ratings.overall / 2).toFixed(1)}</span>
                <span className="total-reviews">{reviewCount} reviews</span>
              </div>
              
              <div className="rating-details">
                <div className="rating-item">
                  <span className="rating-label">Overall:</span>
                  <RatingBar rating={ratings.overall} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Taste:</span>
                  <RatingBar rating={ratings.taste} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Price:</span>
                  <RatingBar rating={ratings.price} max={10} disabled={true} />
                </div>
                <div className="rating-item">
                  <span className="rating-label">Presentation:</span>
                  <RatingBar rating={ratings.presentation} max={10} disabled={true} />
                </div>
              </div>
              
              <button className="btn btn-primary">Write a Review</button>
            </div>
            
            <div className="reviews-list">
              {productReviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product!</p>
              ) : (
                productReviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.username || 'Anonymous'}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    
                    <div className="review-rating">
                      {Array.from({length: 5}).map((_, index) => (
                        <span 
                          key={index} 
                          className={index < (review.overallRating / 2) ? "star filled" : "star"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    
                    <p className="review-text">{review.review}</p>
                  </div>
                ))
              )}
              
              {productReviews.length > 0 && (
                <button className="btn btn-secondary load-more">Load More Reviews</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-section">
            <h2>About this {product.name}</h2>
            <p className="product-description">
              {product.description || `${product.name} is a delicious product offered by ${bakery?.name || 'this bakery'}.`}
            </p>
            
            <div className="product-details">
              <div className="availability-section">
                <h3>Availability</h3>
                <p>{product.availability || 'Available daily'}</p>
                {bakery && (
                  <p>
                    Available at <Link to={`/bakery/${bakery.id}`}>{bakery.name}</Link>, {formatBakeryAddress()}
                  </p>
                )}
              </div>
              
              <div className="serving-section">
                <h3>Category</h3>
                <p>{product.category || 'Pastry'}</p>
              </div>
            </div>
            
            <div className="similar-products-section">
              <h3>Similar Products</h3>
              {similarProducts.length === 0 ? (
                <p>No similar products found.</p>
              ) : (
                <div className="similar-products">
                  {similarProducts.map(item => (
                    <div key={item.id} className="similar-product-card">
                      <div className="similar-product-img-placeholder">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="similar-product-image" />
                        )}
                      </div>
                      <div className="similar-product-info">
                        <h4>{item.name}</h4>
                        <div className="similar-product-bakery">
                          {bakery && <Link to={`/bakery/${bakery.id}`}>{bakery.name}</Link>}
                        </div>
                        <Link to={`/product/${item.id}`} className="btn btn-small">View</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductProfile;
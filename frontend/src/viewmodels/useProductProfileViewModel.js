import { useState, useEffect } from 'react';
import productService from '../services/productService';
import bakeryService from '../services/bakeryService';
import reviewService from '../services/reviewService';
import { Product } from '../models/Product';
import { Bakery } from '../models/Bakery';
import { ProductReview } from '../models/Review';

export const useProductProfileViewModel = (productId) => {
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
        const productData = await productService.getById(productId);
        const productModel = Product.fromApiResponse(productData);
        setProduct(productModel);
        
        if (productModel.bakeryId) {
          const [bakeryData, similarData, reviewsData] = await Promise.all([
            bakeryService.getById(productModel.bakeryId),
            productService.getProductsByBakery(productModel.bakeryId),
            reviewService.getProductReviewsByProduct(productId)
          ]);
          
          setBakery(Bakery.fromApiResponse(bakeryData));
          setSimilarProducts(similarData.products
            .filter(p => p.id !== parseInt(productId))
            .slice(0, 3)
            .map(p => Product.fromApiResponse(p)));
          setProductReviews((reviewsData.productReviews || []).map(r => ProductReview.fromApiResponse(r)));
        }
      } catch (error) {
        setError('Failed to load product information');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const calculateRatings = () => {
    if (!productReviews.length) {
      return { overall: 0, taste: 0, price: 0, presentation: 0 };
    }
    
    const sumRatings = productReviews.reduce((acc, review) => ({
      overall: acc.overall + (review.overallRating || 0),
      taste: acc.taste + (review.tasteRating || 0),
      price: acc.price + (review.priceRating || 0),
      presentation: acc.presentation + (review.presentationRating || 0)
    }), { overall: 0, taste: 0, price: 0, presentation: 0 });
    
    const count = productReviews.length;
    return {
      overall: sumRatings.overall / count,
      taste: sumRatings.taste / count,
      price: sumRatings.price / count,
      presentation: sumRatings.presentation / count
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    product,
    bakery,
    productReviews,
    similarProducts,
    loading,
    error,
    activeTab,
    setActiveTab,
    calculateRatings,
    formatDate
  };
};
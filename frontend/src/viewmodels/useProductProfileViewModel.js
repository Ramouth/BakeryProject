// In useProductProfileViewModel.js, try this alternative approach
// that directly logs and maps the review properties

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
          
          // Debug the raw reviews data from API
          console.log("Raw product reviews from API:", reviewsData);
          
          if (reviewsData && reviewsData.productReviews) {
            const reviews = reviewsData.productReviews.map(r => {
              // Map directly from API response data
              return {
                id: r.id,
                review: r.review,
                username: r.username || "Anonymous",
                created_at: r.created_at,
                overallRating: Number(r.overallRating) || 0,
                tasteRating: Number(r.tasteRating) || 0,
                priceRating: Number(r.priceRating) || 0,
                presentationRating: Number(r.presentationRating) || 0
              };
            });
            
            console.log("Processed reviews with direct mapping:", reviews);
            setProductReviews(reviews);
          } else {
            console.warn("No product reviews found in API response");
            setProductReviews([]);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
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
    if (!productReviews || productReviews.length === 0) {
      return {
        overall: 0,
        taste: 0,
        price: 0,
        presentation: 0
      };
    }
    
    console.log("Reviews being used for rating calculation:", productReviews);
    
    // First check if these properties exist in our reviews
    const firstReview = productReviews[0];
    console.log("First review properties:", {
      "overallRating": firstReview.overallRating,
      "tasteRating": firstReview.tasteRating,
      "priceRating": firstReview.priceRating,
      "presentationRating": firstReview.presentationRating,
    });
    
    // Calculate sum of all ratings
    let totalOverall = 0;
    let totalTaste = 0;
    let totalPrice = 0;
    let totalPresentation = 0;
    let countOverall = 0;
    let countTaste = 0;
    let countPrice = 0;
    let countPresentation = 0;
    
    productReviews.forEach(review => {
      // Log each review's properties for debugging
      console.log(`Review ${review.id} ratings:`, {
        overall: review.overallRating,
        taste: review.tasteRating,
        price: review.priceRating,
        presentation: review.presentationRating
      });
      
      // Handle overall rating
      if (review.overallRating && review.overallRating > 0) {
        totalOverall += Number(review.overallRating);
        countOverall++;
      }
      
      // Handle taste rating
      if (review.tasteRating && review.tasteRating > 0) {
        totalTaste += Number(review.tasteRating);
        countTaste++;
      }
      
      // Handle price rating
      if (review.priceRating && review.priceRating > 0) {
        totalPrice += Number(review.priceRating);
        countPrice++;
      }
      
      // Handle presentation rating
      if (review.presentationRating && review.presentationRating > 0) {
        totalPresentation += Number(review.presentationRating);
        countPresentation++;
      }
    });
    
    // Calculate averages
    const result = {
      overall: countOverall > 0 ? totalOverall / countOverall : 0,
      taste: countTaste > 0 ? totalTaste / countTaste : 0,
      price: countPrice > 0 ? totalPrice / countPrice : 0,
      presentation: countPresentation > 0 ? totalPresentation / countPresentation : 0
    };
    
    console.log("Final calculated ratings:", result);
    return result;
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
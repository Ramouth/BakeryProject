// frontend/src/viewmodels/useProductRankingsViewModel.js

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import apiClient from '../services/api';
import { Product } from '../models/Product';

export const useProductRankingsViewModel = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subcategoryId || null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bakeries, setBakeries] = useState({});

  // Fetch category and subcategories
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // If we have a categoryId, fetch the specific category
        if (categoryId) {
          const categoryResponse = await productService.getById(categoryId);
          if (categoryResponse) {
            setCategory(categoryResponse);
          }
          
          // Fetch subcategories for this category
          const subcategoriesResponse = await productService.getSubcategoriesByCategory(categoryId);
          if (subcategoriesResponse && subcategoriesResponse.subcategories) {
            setSubcategories(subcategoriesResponse.subcategories);
            
            // If subcategoryId is provided, set it as selected
            if (subcategoryId) {
              setSelectedSubcategoryId(subcategoryId);
              
              // Get the specific subcategory details
              const matchingSubcategory = subcategoriesResponse.subcategories.find(
                sc => sc.id === subcategoryId
              );
              
              if (matchingSubcategory) {
                setSubcategory(matchingSubcategory);
              }
            } else if (subcategoriesResponse.subcategories.length > 0) {
              // Select the first subcategory by default
              setSelectedSubcategoryId(subcategoriesResponse.subcategories[0].id);
              setSubcategory(subcategoriesResponse.subcategories[0]);
            }
          }
        } else {
          // If no categoryId, fetch all subcategories
          const allSubcategoriesResponse = await productService.getAllSubcategories();
          if (allSubcategoriesResponse && allSubcategoriesResponse.subcategories) {
            setSubcategories(allSubcategoriesResponse.subcategories);
            
            // If subcategoryId is provided, set it as selected
            if (subcategoryId) {
              setSelectedSubcategoryId(subcategoryId);
              
              // Get the specific subcategory details
              const matchingSubcategory = allSubcategoriesResponse.subcategories.find(
                sc => sc.id === subcategoryId
              );
              
              if (matchingSubcategory) {
                setSubcategory(matchingSubcategory);
              }
            } else if (allSubcategoriesResponse.subcategories.length > 0) {
              // Select the first subcategory by default
              setSelectedSubcategoryId(allSubcategoriesResponse.subcategories[0].id);
              setSubcategory(allSubcategoriesResponse.subcategories[0]);
            }
          }
        }
        
        // Fetch bakeries for lookup
        const bakeriesResponse = await apiClient.get('/bakeries', true);
        if (bakeriesResponse && bakeriesResponse.bakeries) {
          const bakeryMap = {};
          bakeriesResponse.bakeries.forEach(bakery => {
            bakeryMap[bakery.id] = bakery;
          });
          setBakeries(bakeryMap);
        }
        
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError('Failed to load category information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [categoryId, subcategoryId]);

  // Fetch product rankings when the selected subcategory changes
  useEffect(() => {
    const fetchProductRankings = async () => {
      if (!selectedSubcategoryId) return;
      
      try {
        setLoading(true);
        
        // Fetch products by subcategory
        const response = await productService.getProductsBySubcategory(selectedSubcategoryId);
        if (response && response.products) {
          const products = response.products.map(p => Product.fromApiResponse(p));
          
          // Process products and create rankings
          const rankingsWithReviews = await Promise.all(
            products.map(async (product, index) => {
              // Fetch reviews for this product
              const reviewsResponse = await apiClient.get(`/productreviews/product/${product.id}`, true);
              const reviews = reviewsResponse?.productReviews || [];
              
              // Calculate average rating
              let avgRating = 0;
              if (reviews.length > 0) {
                const sum = reviews.reduce((acc, review) => acc + (review?.overallRating || 0), 0);
                avgRating = sum / reviews.length;
              }
              
              // Find the top review
              let topReview = null;
              if (reviews.length > 0) {
                topReview = reviews.reduce((best, current) => {
                  if (!best || !current) return best || current;
                  return ((current?.overallRating || 0) > (best?.overallRating || 0)) ? current : best;
                }, reviews[0]);
              }
              
              // Get bakery information
              const bakery = bakeries[product.bakeryId] || {};
              
              return {
                rank: index + 1,
                productId: product.id,
                bakeryId: product.bakeryId,
                bakeryName: bakery.name || 'Unknown Bakery',
                address: formatBakeryAddress(bakery),
                topReview: topReview?.review || 'No reviews yet',
                rating: (avgRating / 2).toFixed(1), // Convert to 5-star scale
                reviewCount: reviews.length,
                image: product.imageUrl || ''
              };
            })
          );
          
          // Sort by rating (highest first)
          const sortedRankings = rankingsWithReviews.sort((a, b) => 
            parseFloat(b.rating) - parseFloat(a.rating)
          );
          
          setProductRankings(sortedRankings);
        }
      } catch (error) {
        console.error('Error fetching product rankings:', error);
        setError('Failed to load product rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductRankings();
  }, [selectedSubcategoryId, bakeries]);

  // Format bakery address
  const formatBakeryAddress = (bakery) => {
    if (!bakery) return '';
    
    const addressParts = [];
    if (bakery.streetName) addressParts.push(bakery.streetName);
    if (bakery.streetNumber) addressParts.push(bakery.streetNumber);
    
    let line1 = addressParts.join(' ');
    
    const line2Parts = [];
    if (bakery.zipCode) line2Parts.push(bakery.zipCode);
    
    let line2 = line2Parts.join(' ');
    
    if (line1 && line2) {
      return `${line1}, ${line2}`;
    } else if (line1) {
      return line1;
    } else if (line2) {
      return line2;
    } else {
      return 'Address not available';
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategoryId(subcategoryId);
    
    // Update URL
    if (categoryId) {
      navigate(`/product-rankings/${categoryId}/${subcategoryId}`);
    } else {
      navigate(`/product-rankings/${subcategoryId}`);
    }
    
    // Find and set the selected subcategory
    const selectedSubcategory = subcategories.find(sc => sc.id === subcategoryId);
    if (selectedSubcategory) {
      setSubcategory(selectedSubcategory);
    }
  };

  return {
    category,
    subcategory,
    subcategories,
    selectedSubcategoryId,
    productRankings,
    loading,
    error,
    handleSubcategorySelect,
    categoryId
  };
};
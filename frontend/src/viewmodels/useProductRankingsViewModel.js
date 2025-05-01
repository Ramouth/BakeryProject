import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export const useProductRankingsViewModel = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bakeries, setBakeries] = useState({});

  // Fetch all data needed for the view
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products and bakeries in parallel
      const [productsResponse, bakeriesResponse] = await Promise.all([
        apiClient.get('/products', true),
        apiClient.get('/bakeries', true)
      ]);
      
      // Safely get products array
      const products = productsResponse?.products || [];
      console.log('Products response:', productsResponse);
      
      // Create bakery map for lookups
      const bakeryMap = {};
      if (bakeriesResponse && Array.isArray(bakeriesResponse.bakeries)) {
        bakeriesResponse.bakeries.forEach(bakery => {
          if (bakery && bakery.id) {
            bakeryMap[bakery.id] = bakery;
          }
        });
      }
      setBakeries(bakeryMap);
      
      // Create product type groups based on names
      organizeProducts(products);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Organize products into product types based on their names
  const organizeProducts = (products) => {
    try {
      // Ensure products is an array
      if (!Array.isArray(products)) {
        console.error('Products is not an array:', products);
        setProductTypes([]);
        setLoading(false);
        return;
      }
      
      // Filter products by category if specified
      let filteredProducts = products;
      if (categoryId) {
        filteredProducts = products.filter(product => 
          product && product.category && 
          product.category.toLowerCase().includes(categoryId.toLowerCase())
        );
      }
      
      console.log('Filtered products:', filteredProducts);
      
      // Group products by name
      const productGroups = {};
      for (const product of filteredProducts) {
        // Skip invalid products
        if (!product || !product.name) continue;
        
        const name = product.name;
        const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
        
        if (!productGroups[nameSlug]) {
          productGroups[nameSlug] = {
            id: nameSlug,
            name: name,
            products: []
          };
        }
        
        productGroups[nameSlug].products.push(product);
      }
      
      // Convert to array and sort alphabetically
      const productTypeList = Object.values(productGroups).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      console.log('Product types created:', productTypeList);
      setProductTypes(productTypeList);
      
      // Determine which product type to select
      if (subcategoryId && productGroups[subcategoryId]) {
        setSelectedProduct(subcategoryId);
      } else if (productTypeList.length > 0) {
        setSelectedProduct(productTypeList[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error organizing products:', err);
      setProductTypes([]);
      setError('Failed to organize products. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch reviews for a specific product
  const fetchProductReviews = async (productId) => {
    try {
      if (!productId) return [];
      
      const response = await apiClient.get(`/productreviews/product/${productId}`, true);
      return Array.isArray(response?.productReviews) ? response.productReviews : [];
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  };

  // Generate rankings for the selected product type
  const generateProductRankings = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    
    const productType = productTypes.find(pt => pt.id === selectedProduct);
    if (!productType || !Array.isArray(productType.products) || productType.products.length === 0) {
      setProductRankings([]);
      setLoading(false);
      return;
    }
    
    try {
      // Fetch reviews for each product in this group
      const productsWithReviews = await Promise.all(
        productType.products.map(async product => {
          if (!product || !product.id) return null;
          
          const reviews = await fetchProductReviews(product.id);
          
          let avgRating = 0;
          if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + (review?.overallRating || 0), 0);
            avgRating = sum / reviews.length;
          }
          
          let topReview = null;
          if (reviews.length > 0) {
            topReview = reviews.reduce((best, current) => {
              if (!best || !current) return best || current;
              return ((current?.overallRating || 0) > (best?.overallRating || 0)) ? current : best;
            }, reviews[0]);
          }
          
          return {
            ...product,
            avgRating: avgRating / 2, // Convert to 5-star scale
            reviewCount: reviews.length,
            topReview: topReview
          };
        })
      );
      
      // Filter out null values and sort by rating
      const validProducts = productsWithReviews.filter(p => p !== null);
      const sortedProducts = validProducts.sort((a, b) => b.avgRating - a.avgRating);
      
      // Format for display
      const rankings = sortedProducts.map((product, index) => {
        const bakery = bakeries[product?.bakeryId] || {};
        
        return {
          rank: index + 1,
          productId: product?.id || '',
          bakeryId: product?.bakeryId || '',
          bakeryName: bakery?.name || 'Unknown Bakery',
          address: formatBakeryAddress(bakery),
          topReview: product?.topReview?.review || 'No reviews yet',
          rating: (product?.avgRating || 0).toFixed(1),
          reviewCount: product?.reviewCount || 0,
          image: product?.imageUrl || ''
        };
      });
      
      setProductRankings(rankings);
    } catch (error) {
      console.error('Error generating rankings:', error);
      setError('Failed to generate rankings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format bakery address for display
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

  // Handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    
    if (categoryId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${productId}`);
    }
  };

  // Get the name of the selected product
  const getSelectedProductName = () => {
    if (!selectedProduct || !productTypes.length) return '';
    const found = productTypes.find(p => p.id === selectedProduct);
    return found ? found.name : '';
  };

  // Get the name of the current category
  const getCategoryName = () => {
    // Simple mapping for known category IDs
    const categoryNames = {
      'danish': 'Danish Products',
      'bread': 'Breads',
      'viennoiserie': 'Viennoiserie',
      'cakes': 'Cakes & Tarts',
      'specialty': 'Specialty Items'
    };
    
    return categoryId ? (categoryNames[categoryId] || categoryId) : 'All Categories';
  };

  // Fetch data when category or subcategory changes
  useEffect(() => {
    fetchData();
  }, [categoryId, subcategoryId]);

  // Update rankings when selected product changes
  useEffect(() => {
    if (selectedProduct && productTypes.length > 0) {
      generateProductRankings();
    }
  }, [selectedProduct, productTypes.length]);

  return {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    error,
    handleProductSelect,
    getSelectedProductName,
    getCategoryName,
    categoryId
  };
};
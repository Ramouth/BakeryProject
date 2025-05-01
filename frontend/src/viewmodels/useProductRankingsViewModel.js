import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export const useProductRankingsViewModel = () => {
  const { categoryId, subcategoryId } = useParams();
  console.log('URL Parameters from useParams:', { categoryId, subcategoryId });
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bakeries, setBakeries] = useState({});
  const [rawProducts, setRawProducts] = useState([]);

  // Direct override when URL has subcategory parameter
  useEffect(() => {
    if (subcategoryId) {
      console.log(`Directly setting selectedProduct from URL param: ${subcategoryId}`);
      setSelectedProduct(subcategoryId);
    }
  }, [subcategoryId]);

  // Fetch all data needed for the view
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for category:", categoryId, "subcategory:", subcategoryId);
      
      // Fetch products and bakeries in parallel
      const [productsResponse, bakeriesResponse] = await Promise.all([
        apiClient.get('/products', true),
        apiClient.get('/bakeries', true)
      ]);
      
      // Safely get products array
      const products = productsResponse?.products || [];
      console.log('Products response: Found', products.length, 'products');
      setRawProducts(products);
      
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
      
      // Build the product types (subcategory menu)
      buildProductTypeMenu(products);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Build the product type menu from product names
  const buildProductTypeMenu = useCallback((products) => {
    try {
      // Filter products by category if specified
      let filteredProducts = products;
      if (categoryId) {
        filteredProducts = products.filter(product => 
          product && product.category && 
          product.category.toLowerCase().includes(categoryId.toLowerCase())
        );
      }
      
      console.log(`Found ${filteredProducts.length} products for category ${categoryId}`);
      
      // Get unique product names
      const uniqueProductNames = [];
      const productNameMap = new Map();
      
      filteredProducts.forEach(product => {
        if (product && product.name && !productNameMap.has(product.name)) {
          productNameMap.set(product.name, true);
          uniqueProductNames.push(product.name);
        }
      });
      
      // Create the product type menu items
      const menuItems = uniqueProductNames.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Created menu items:', menuItems);
      setProductTypes(menuItems);
      
      // Set the initial selected product
      if (subcategoryId && menuItems.some(item => item.id === subcategoryId)) {
        console.log('Setting selected product to:', subcategoryId);
        setSelectedProduct(subcategoryId);
      } else if (menuItems.length > 0) {
        console.log('Setting selected product to first item:', menuItems[0].id);
        setSelectedProduct(menuItems[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error building product menu:', err);
      setProductTypes([]);
      setError('Failed to process products. Please try again later.');
      setLoading(false);
    }
  }, [categoryId, subcategoryId]);

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
  const generateProductRankings = useCallback(async () => {
    if (!selectedProduct || !rawProducts.length) {
      return;
    }
    
    setLoading(true);
    console.log(`Generating rankings for subcategory '${selectedProduct}'`);
    
    try {
      // Find the product type by ID to get the actual product name
      const productType = productTypes.find(pt => pt.id === selectedProduct);
      if (!productType) {
        console.log('Product type not found:', selectedProduct);
        setProductRankings([]);
        setLoading(false);
        return;
      }
      
      const productName = productType.name;
      console.log(`Looking for products with exact name: '${productName}'`);
      
      // Filter products by category and exact name match
      const matchingProducts = rawProducts.filter(product => 
        product && 
        product.name === productName && // Exact name match is crucial
        (!categoryId || product.category?.toLowerCase().includes(categoryId.toLowerCase()))
      );
      
      console.log(`Found ${matchingProducts.length} products with name '${productName}'`);
      console.log('Matching products:', matchingProducts);
      
      if (matchingProducts.length === 0) {
        setProductRankings([]);
        setLoading(false);
        return;
      }
      
      // Get reviews for each product
      const productsWithReviews = await Promise.all(
        matchingProducts.map(async product => {
          const reviews = await fetchProductReviews(product.id);
          console.log(`Product ${product.id} has ${reviews.length} reviews`);
          
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
      
      console.log(`Created ${rankings.length} rankings for display`);
      setProductRankings(rankings);
    } catch (error) {
      console.error('Error generating rankings:', error);
      setError('Failed to generate rankings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, rawProducts, productTypes, categoryId, bakeries]);

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
    console.log(`User selected product: ${productId}`);
    setSelectedProduct(productId);
    
    // Force navigate to the correct URL
    if (categoryId) {
      const url = `/product-rankings/${categoryId}/${productId}`;
      console.log(`Navigating to: ${url}`);
      navigate(url);
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
    console.log('URL params changed:', { categoryId, subcategoryId });
    fetchData();
    
    // Important: If subcategoryId is provided in URL, set it as selected
    if (subcategoryId) {
      console.log('Setting selected product from URL param:', subcategoryId);
      setSelectedProduct(subcategoryId);
    }
  }, [categoryId, subcategoryId]);

  // Update rankings when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      console.log('Selected product changed, generating rankings...');
      generateProductRankings();
    }
  }, [selectedProduct, generateProductRankings]);

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

export default useProductRankingsViewModel;
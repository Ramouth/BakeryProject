import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export const useProductRankingsViewModel = () => {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [bakeries, setBakeries] = useState({});

  const productCategories = {
    'danish': { name: 'Danish Products', filter: 'danish' },
    'bread': { name: 'Breads', filter: 'bread' },
    'viennoiserie': { name: 'Viennoiserie', filter: 'viennoiserie' },
    'cakes': { name: 'Cakes & Tarts', filter: 'cakes' },
    'specialty': { name: 'Specialty Items', filter: 'specialty' }
  };

  const defaultCategories = [
    { id: 'danish', name: 'Danish Products' },
    { id: 'bread', name: 'Breads' },
    { id: 'viennoiserie', name: 'Viennoiserie' },
    { id: 'cakes', name: 'Cakes & Tarts' },
    { id: 'specialty', name: 'Specialty Items' }
  ];

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products', true);
      const products = response.products || [];
      setAllProducts(products);
      
      organizeProductsByCategory(products, categoryId);
      await fetchBakeries();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  const fetchBakeries = async () => {
    try {
      const response = await apiClient.get('/bakeries', true);
      const bakeryMap = {};
      
      (response.bakeries || []).forEach(bakery => {
        bakeryMap[bakery.id] = bakery;
      });
      
      setBakeries(bakeryMap);
    } catch (error) {
      console.error('Error fetching bakeries:', error);
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await apiClient.get(`/productreviews/product/${productId}`, true);
      return response.productReviews || [];
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  };

  const normalizeProductName = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  const organizeProductsByCategory = (products, category) => {
    if (category && productCategories[category]) {
      const categoryFilter = productCategories[category].filter;
      const categoryProducts = products.filter(
        product => product.category && product.category.toLowerCase().includes(categoryFilter)
      );
      
      const productTypeMap = {};
      categoryProducts.forEach(product => {
        const normalizedName = normalizeProductName(product.name);
        if (!productTypeMap[normalizedName]) {
          productTypeMap[normalizedName] = {
            id: normalizedName,
            name: product.name,
            products: []
          };
        }
        productTypeMap[normalizedName].products.push(product);
      });
      
      setProductTypes(Object.values(productTypeMap));
      
      if (productId) {
        setSelectedProduct(productId);
        generateProductRankings(productId, Object.values(productTypeMap));
      } else if (Object.values(productTypeMap).length > 0) {
        const firstProductType = Object.values(productTypeMap)[0];
        setSelectedProduct(firstProductType.id);
        generateProductRankings(firstProductType.id, Object.values(productTypeMap));
      }
    } else {
      const featuredProducts = [];
      
      defaultCategories.forEach(category => {
        const matchingProduct = products.find(
          product => product.category && product.category.toLowerCase().includes(category.id)
        );
        
        if (matchingProduct) {
          featuredProducts.push({
            id: normalizeProductName(matchingProduct.name),
            name: matchingProduct.name,
            products: [matchingProduct]
          });
        }
      });
      
      if (featuredProducts.length < 5) {
        const popularProducts = products
          .filter(product => {
            return !featuredProducts.some(fp => 
              normalizeProductName(fp.name) === normalizeProductName(product.name)
            );
          })
          .slice(0, 5 - featuredProducts.length);
          
        popularProducts.forEach(product => {
          featuredProducts.push({
            id: normalizeProductName(product.name),
            name: product.name,
            products: [product]
          });
        });
      }
      
      setProductTypes(featuredProducts);
      
      if (featuredProducts.length > 0) {
        const firstProductType = featuredProducts[0];
        setSelectedProduct(firstProductType.id);
        generateProductRankings(firstProductType.id, featuredProducts);
      }
    }
  };

  const generateProductRankings = async (productTypeId, productTypes) => {
    setLoading(true);
    
    const productType = productTypes.find(pt => pt.id === productTypeId);
    
    if (!productType) {
      setProductRankings([]);
      setLoading(false);
      return;
    }
    
    const products = productType.products;
    
    const productsWithReviews = await Promise.all(
      products.map(async product => {
        const reviews = await fetchProductReviews(product.id);
        
        let avgRating = 0;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, review) => acc + review.overallRating, 0);
          avgRating = sum / reviews.length;
        }
        
        let topReview = null;
        if (reviews.length > 0) {
          topReview = reviews.reduce((best, current) => {
            return (current.overallRating > best.overallRating) ? current : best;
          }, reviews[0]);
        }
        
        return {
          ...product,
          avgRating: avgRating / 2,
          reviewCount: reviews.length,
          topReview: topReview
        };
      })
    );
    
    const sortedProducts = productsWithReviews
      .filter(product => product.reviewCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating);
    
    const rankings = sortedProducts.map((product, index) => {
      const bakery = bakeries[product.bakeryId] || {};
      
      return {
        rank: index + 1,
        productId: product.id,
        bakeryId: product.bakeryId,
        bakeryName: bakery.name || 'Unknown Bakery',
        address: formatBakeryAddress(bakery),
        topReview: product.topReview ? product.topReview.review : 'No reviews yet',
        rating: product.avgRating.toFixed(1),
        reviewCount: product.reviewCount,
        image: product.imageUrl
      };
    });
    
    setProductRankings(rankings);
    setLoading(false);
  };

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
      return `${line1}\n${line2}`;
    } else if (line1) {
      return line1;
    } else if (line2) {
      return line2;
    } else {
      return 'Address not available';
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    generateProductRankings(productId, productTypes);
    
    if (categoryId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${productId}`);
    }
  };

  const getSelectedProductName = () => {
    if (!selectedProduct || !productTypes.length) return '';
    const found = productTypes.find(p => p.id === selectedProduct);
    return found ? found.name : '';
  };

  const getCategoryName = () => {
    if (!categoryId) return 'All Categories';
    return productCategories[categoryId]?.name || 'Products';
  };

  useEffect(() => {
    fetchAllProducts();
  }, [categoryId]);

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
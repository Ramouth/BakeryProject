import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export const useProductCategoryViewModel = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Predefined categories structure
  const categories = [
    {
      id: 'danish',
      name: 'Danish Products',
      products: [
        { id: 'kanelsnegl', name: 'Kanelsnegle' },
        { id: 'spandauer', name: 'Spandauer' },
        { id: 'tebirkes', name: 'Tebirkes' },
        { id: 'romsnegl', name: 'Romsnegl' }
      ]
    },
    {
      id: 'bread',
      name: 'Breads',
      products: [
        { id: 'rugbrod', name: 'Rugbrød' },
        { id: 'sourdough', name: 'Sourdough' },
        { id: 'franskbrod', name: 'Franskbrød' },
        { id: 'flutes', name: 'Flutes' }
      ]
    },
    {
      id: 'viennoiserie',
      name: 'Viennoiserie',
      products: [
        { id: 'classic-croissant', name: 'Classic Croissant' },
        { id: 'chocolate-croissant', name: 'Chocolate Croissant' },
        { id: 'almond-croissant', name: 'Almond Croissant' },
        { id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant' }
      ]
    },
    {
      id: 'cakes',
      name: 'Cakes & Tarts',
      products: [
        { id: 'hindbaersnitter', name: 'Hindbærsnitter' },
        { id: 'drommekage', name: 'Drømmekage' },
        { id: 'napoleon-hat', name: 'Napoleon\'s Hat' },
        { id: 'othellolagkage', name: 'Othellolagkage' }
      ]
    },
    {
      id: 'specialty',
      name: 'Specialty Items',
      products: [
        { id: 'cardamom-bun', name: 'Cardamom Bun' },
        { id: 'chokoladebolle', name: 'Chokoladebolle' },
        { id: 'wienerbrod', name: 'Wienerbrød' },
        { id: 'brunsviger', name: 'Brunsviger' }
      ]
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products', true);
        console.log(`Found ${response.products?.length || 0} products in the database`);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const navigateToProduct = (categoryId, productId) => {
    if (productId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${categoryId}`);
    }
  };

  return {
    categories,
    activeCategory,
    loading,
    handleMouseEnter,
    handleMouseLeave,
    navigateToProduct
  };
};
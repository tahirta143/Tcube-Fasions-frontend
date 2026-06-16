'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('tcube_favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (err) {
        console.error('Error parsing favorites data:', err);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tcube_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  const toggleFavorite = (product) => {
    if (!product || !product.id) return;
    
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.some((item) => item.id === product.id);
      if (exists) {
        return prevFavorites.filter((item) => item.id !== product.id);
      } else {
        // Save minimal representation of product
        return [
          ...prevFavorites,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            discount_price: product.discount_price,
            images: product.images,
            category: product.category,
            stock: product.stock
          }
        ];
      }
    });
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        favoritesCount
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

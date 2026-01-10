import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    
    // Get favorites from Redux state
    const favoritesFromRedux = useSelector(state => state?.productHome?.favorites?.items || []);
    const favoritesPagination = useSelector(state => state?.productHome?.favorites?.pagination || null);

    // Load wishlist from localStorage on component mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (error) {
                console.error('Error parsing wishlist from localStorage:', error);
                setWishlist([]);
            }
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (productId) => {
        setWishlist(prev => {
            if (!prev.includes(productId)) {
                return [...prev, productId];
            }
            return prev;
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(id => id !== productId));
    };

    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const getWishlistCount = () => {
        // Use Redux favorites count if available, otherwise use localStorage
        if (favoritesPagination && favoritesPagination.total !== undefined) {
            return favoritesPagination.total;
        }
        // If we have favorites items in Redux, use that count
        if (favoritesFromRedux && favoritesFromRedux.length > 0) {
            return favoritesFromRedux.length;
        }
        return wishlist.length;
    };

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

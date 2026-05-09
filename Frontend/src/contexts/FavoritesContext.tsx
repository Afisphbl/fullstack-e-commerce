import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Product } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: Product[];
  isLoading: boolean;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Helper to map product data
  const mapWishlistProduct = (p: any): Product => {
    const mapImage = (img: string | undefined) => {
      if (!img) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600';
      if (img.startsWith('http')) return img;
      return `/uploads/products/${img}`;
    };

    return {
      ...p,
      id: p._id || p.id,
      image: mapImage(p.imageCover || p.image),
      imageCover: p.imageCover,
      images: Array.isArray(p.images) ? p.images.map(mapImage) : [],
      originalPrice: p.originalPrice || null,
    };
  };

  // Fetch wishlist from backend
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiFetch('/api/v1/users/wishlist');
      const products = response.data.wishlist || [];
      return products.map(mapWishlistProduct);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add to wishlist mutation
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiFetch('/api/v1/users/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to wishlist');
    },
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiFetch(`/api/v1/users/wishlist/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });

  const addFavorite = useCallback((product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    addMutation.mutate(product.id);
  }, [isAuthenticated, addMutation]);

  const removeFavorite = useCallback((productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage favorites');
      return;
    }
    removeMutation.mutate(productId);
  }, [isAuthenticated, removeMutation]);

  const isFavorite = useCallback((productId: string) => {
    return wishlist.some((p: Product) => p.id === productId || p._id === productId);
  }, [wishlist]);

  const toggleFavorite = useCallback((product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    
    if (isFavorite(product.id)) {
      removeMutation.mutate(product.id);
    } else {
      addMutation.mutate(product.id);
    }
  }, [isAuthenticated, isFavorite, addMutation, removeMutation]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites: wishlist, 
      isLoading,
      addFavorite, 
      removeFavorite, 
      isFavorite, 
      toggleFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

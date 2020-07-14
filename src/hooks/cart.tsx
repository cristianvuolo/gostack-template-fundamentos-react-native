import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(
        '@GoStackMarketplace:cartItems',
      );
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
      console.log(products);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateProductsToAsyncStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoStackMarketplace:cartItems',
        JSON.stringify(products),
      );
    }
    // updateProductsToAsyncStorage();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const productInCart = products.find(
        cartProduct => product.id === cartProduct.id,
      );

      if (productInCart) {
        const newProducts = [...products];
        newProducts.splice(
          products.findIndex(cartProduct => product.id === cartProduct.id),
          1,
        );
        const updatedProduct = {
          ...product,
          quantity: productInCart.quantity + 1,
        };

        newProducts.push(updatedProduct);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoStackMarketplace:cartItems',
          JSON.stringify(newProducts),
        );
        return;
      }
      const productWithQuantity = { ...product, quantity: 1 };
      const newProducts = [...products, productWithQuantity];
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoStackMarketplace:cartItems',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(cartProduct => id === cartProduct.id);

      if (product) {
        const newProducts = [...products];
        newProducts.splice(
          products.findIndex(cartProduct => id === cartProduct.id),
          1,
        );
        const updatedProduct = { ...product, quantity: product.quantity + 1 };
        newProducts.push(updatedProduct);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoStackMarketplace:cartItems',
          JSON.stringify(newProducts),
        );
        return;
      }

      Alert.alert('Product not found in cart, refresh your app.');
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(cartProduct => id === cartProduct.id);

      if (product) {
        const newProducts = [...products];
        newProducts.splice(
          products.findIndex(cartProduct => id === cartProduct.id),
          1,
        );
        const updatedProduct = { ...product, quantity: product.quantity - 1 };
        if (updatedProduct.quantity > 0) newProducts.push(updatedProduct);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoStackMarketplace:cartItems',
          JSON.stringify(newProducts),
        );
        return;
      }

      Alert.alert('Product not found in cart, refresh your app.');
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

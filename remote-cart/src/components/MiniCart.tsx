import './MiniCart.css';
import { useState, useEffect } from 'react';

const cartItems = [
  { id: 'jacket', name: 'Jacket', quantity: 1, price: 148 },
  { id: 'pack', name: 'Pack', quantity: 1, price: 96 },
];

const MiniCart = () => {

    const [cart, setCart] = useState(cartItems);

    useEffect(() => {
        const handleAddToCart = (event: CustomEvent) => {
            const product = event.detail;
            setCart((prevCart) => {
                const existingItem = prevCart.find((item) => item.id === product.id);
                if (existingItem) {
                    return prevCart.map((item) =>   
                        item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                    );
                } else {
                    return [...prevCart, { ...product, quantity: 1 }];
                }
            });
        };
        
        window.addEventListener('add-to-cart', handleAddToCart as EventListener);   

        return () => {
            window.removeEventListener('add-to-cart', handleAddToCart as EventListener);
        };
    }, []);

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <aside className="mini-cart" data-remote="remote-cart" aria-label="Mini cart">
        <div className="mini-cart-count">{totalItems}</div>
        <div className="mini-cart-copy">
            <span>Cart</span>
            <strong>${totalPrice}</strong>
        </div>
        </aside>
    );
};

export default MiniCart;

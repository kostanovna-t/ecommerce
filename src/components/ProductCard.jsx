import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./ProductCard.css";

/**
 * ProductCard Component
 * 
 * Layout Approach: Uses CSS Grid with flexbox for internal layout, featuring a card-based design
 * with image container, content section, and action buttons. The component employs Bootstrap's
 * responsive grid system (col-md-4, col-sm-6, col-xs-8) for different screen sizes.
 * 
 * Responsiveness: Mobile-first design with breakpoints at 768px and 576px. On mobile, buttons
 * stack vertically, text sizes reduce, and padding adjusts. Images scale proportionally while
 * maintaining aspect ratio with object-fit: contain.
 */

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("default");
  const dispatch = useDispatch();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (product && product.id) {
      const getVariants = () => {
        const basePrice = product.price;
        
        switch (product.category) {
          case "men's clothing":
          case "women's clothing":
            return [
              { id: "xs", name: "XS", price: (basePrice * 0.9).toFixed(2) },
              { id: "s", name: "S", price: (basePrice * 0.95).toFixed(2) },
              { id: "m", name: "M", price: basePrice },
              { id: "l", name: "L", price: (basePrice * 1.05).toFixed(2) },
              { id: "xl", name: "XL", price: (basePrice * 1.1).toFixed(2) },
            ];
          case "electronics":
            return [
              { id: "default", name: "Standard", price: basePrice },
              { id: "premium", name: "Premium", price: (basePrice * 1.2).toFixed(2) },
              { id: "budget", name: "Budget", price: (basePrice * 0.8).toFixed(2) },
            ];
          case "jewelery":
            return [
              { id: "silver", name: "Silver", price: basePrice },
              { id: "gold", name: "Gold", price: (basePrice * 1.3).toFixed(2) },
              { id: "platinum", name: "Platinum", price: (basePrice * 1.5).toFixed(2) },
            ];
          default:
            return [
              { id: "default", name: "Standard", price: basePrice },
              { id: "premium", name: "Premium", price: (basePrice * 1.15).toFixed(2) },
            ];
        }
      };
      
      const variants = getVariants();
      if (variants && variants.length > 0) {
        setSelectedVariant(variants[0].id);
      }
    }
  }, [product?.id, product?.category, product?.price]);

  if (!product || !product.id) {
    return <div className="product-card">Invalid product data</div>;
  }

  const getStockStatus = () => {
    const rating = product.rating?.rate || 4.0;
    const ratingFactor = Math.min(rating / 5, 1); // Normalize to 0-1
    
    const categoryStockMap = {
      "electronics": 0.95,
      "men's clothing": 0.90,
      "women's clothing": 0.90,
      "jewelery": 0.85,
    };
    
    const baseProbability = categoryStockMap[product.category] || 0.80;
    const adjustedProbability = baseProbability * (0.7 + 0.3 * ratingFactor);
    
    const isInStock = Math.random() < adjustedProbability;
    const stockQuantity = isInStock ? Math.floor(Math.random() * 150) + 1 : 0;
    
    return { isInStock, stockQuantity };
  };

  const { isInStock, stockQuantity } = getStockStatus();

  // Real variants based on product category
  const getVariants = () => {
    const basePrice = product.price;
    
    switch (product.category) {
      case "men's clothing":
      case "women's clothing":
        return [
          { id: "xs", name: "XS", price: (basePrice * 0.9).toFixed(2) },
          { id: "s", name: "S", price: (basePrice * 0.95).toFixed(2) },
          { id: "m", name: "M", price: basePrice },
          { id: "l", name: "L", price: (basePrice * 1.05).toFixed(2) },
          { id: "xl", name: "XL", price: (basePrice * 1.1).toFixed(2) },
        ];
      case "electronics":
        return [
          { id: "default", name: "Standard", price: basePrice },
          { id: "premium", name: "Premium", price: (basePrice * 1.2).toFixed(2) },
          { id: "budget", name: "Budget", price: (basePrice * 0.8).toFixed(2) },
        ];
      case "jewelery":
        return [
          { id: "silver", name: "Silver", price: basePrice },
          { id: "gold", name: "Gold", price: (basePrice * 1.3).toFixed(2) },
          { id: "platinum", name: "Platinum", price: (basePrice * 1.5).toFixed(2) },
        ];
      default:
        return [
          { id: "default", name: "Standard", price: basePrice },
          { id: "premium", name: "Premium", price: (basePrice * 1.15).toFixed(2) },
        ];
    }
  };

  const variants = getVariants();
  
  if (!variants || variants.length === 0) {
    return <div className="product-card">No variants available for this product</div>;
  }
  
  const selectedVariantData = variants.find(v => v.id === selectedVariant) || variants[0];

  // Debug logging
  console.log('ProductCard Debug:', {
    productId: product.id,
    variants: variants,
    selectedVariant: selectedVariant,
    selectedVariantData: selectedVariantData
  });

  const addProduct = () => {
    if (!selectedVariantData) {
      toast.error("Please select a valid variant");
      return;
    }
    
    const productWithVariant = {
      ...product,
      variant: selectedVariant,
      quantity: quantity,
      variantPrice: selectedVariantData.price,
    };
    dispatch(addCart(productWithVariant));
    toast.success(`Added ${quantity} ${product.title.substring(0, 20)}... to cart`);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= stockQuantity) {
      setQuantity(value);
    }
  };

  return (
    <div className="product-card">
      <div className="product-card__image-container">
        <img
          className="product-card__image"
          src={product.image}
          alt={product.title}
          loading="lazy"
        />
        {!isInStock && (
          <div className="product-card__out-of-stock">
            <span>Out of Stock</span>
          </div>
        )}
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <div className="product-card__low-stock">
            <span>Only {stockQuantity} left!</span>
          </div>
        )}
      </div>

      <div className="product-card__content">
        <div className="product-card__header">
          <div className="product-card__category">
            {product.category}
          </div>
          <h3 className="product-card__title" title={product.title}>
            {product.title.length > 60 
              ? `${product.title.substring(0, 60)}...` 
              : product.title}
          </h3>
          <div className="product-card__rating">
            <span className="product-card__rating-stars">
              {"★".repeat(Math.floor(product.rating?.rate || 4))}
              {"☆".repeat(5 - Math.floor(product.rating?.rate || 4))}
            </span>
            <span className="product-card__rating-count">
              ({product.rating?.count || 0})
            </span>
          </div>
        </div>

        <div className="product-card__price-section">
          <span className="product-card__price">
            ${selectedVariantData?.price || product.price}
          </span>
          {selectedVariant !== variants[0]?.id && selectedVariantData?.price !== product.price && (
            <span className="product-card__original-price">
              ${product.price}
            </span>
          )}
        </div>

        <div className="product-card__variants">
          <label htmlFor={`variant-${product.id}`} className="product-card__variant-label">
            {product.category === "men's clothing" || product.category === "women's clothing" 
              ? "Size:" 
              : product.category === "electronics" 
                ? "Model:" 
                : product.category === "jewelery" 
                  ? "Material:" 
                  : "Option:"}
          </label>
          <select
            id={`variant-${product.id}`}
            className="product-card__variant-select"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            disabled={!isInStock}
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} - ${variant.price}
              </option>
            ))}
          </select>
        </div>

        {isInStock && (
          <div className="product-card__quantity">
            <label htmlFor={`quantity-${product.id}`} className="product-card__quantity-label">
              Quantity:
            </label>
            <input
              id={`quantity-${product.id}`}
              type="number"
              min="1"
              max={stockQuantity}
              value={quantity}
              onChange={handleQuantityChange}
              className="product-card__quantity-input"
            />
          </div>
        )}

        <div className="product-card__actions">
          <Link
            to={`/product/${product.id}`}
            className="product-card__btn product-card__btn--secondary"
          >
            View Details
          </Link>
          
          {isInStock ? (
            <button
              className="product-card__btn product-card__btn--primary"
              onClick={addProduct}
              disabled={stockQuantity === 0}
            >
              Add to Cart
            </button>
          ) : (
            <button
              className="product-card__btn product-card__btn--disabled"
              disabled
            >
              Out of Stock
            </button>
          )}
        </div>

        {stockQuantity > 0 && stockQuantity <= 10 && (
          <div className="product-card__stock-warning">
            <span>Only {stockQuantity} left in stock</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

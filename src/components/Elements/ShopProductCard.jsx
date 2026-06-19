import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Reusable horizontal product card with image slider, thumbnails, title, price, description (2-line clamp), Select & View More.
 * Select toggles to green "✓ Selected"; View More opens product detail modal when onViewMore is provided.
 * @param {Object} product - { id, title, price, description, images[], detailUrl }
 * @param {Function} onAddToCart - (product) => {} – called when user first selects
 * @param {Function} onViewMore - (product) => {} – if set, View More opens modal instead of navigating
 * @param {number[]} selectedIds - optional; when provided, selection is controlled by parent (for Get Quotation)
 * @param {Function} onToggleSelect - (product) => {} – when provided with selectedIds, toggles selection in parent
 */
function ShopProductCard({ product, onAddToCart, onViewMore, selectedIds, onToggleSelect }) {
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSelected, setLocalSelected] = useState(false);
  const isControlled = selectedIds && typeof onToggleSelect === 'function';
  const isSelected = isControlled ? selectedIds.includes(product.id) : localSelected;
  const rawImg = images[currentIndex];
  const currentImage = typeof rawImg === 'string' ? rawImg : (rawImg && rawImg.default) || rawImg;

  const handleSelectClick = () => {
    if (isControlled) {
      onToggleSelect(product);
      if (!selectedIds.includes(product.id) && onAddToCart) onAddToCart(product);
    } else {
      setLocalSelected((prev) => !prev);
      if (!localSelected && onAddToCart) onAddToCart(product);
    }
  };

  const goPrev = (e) => {
    e.preventDefault();
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const goNext = (e) => {
    e.preventDefault();
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const detailUrl = product.detailUrl || '/shop-detail';
  const priceText = product.price != null ? `Rs ${Number(product.price).toLocaleString('en-IN')}` : '';

  return (
    <div className="shop-product-card" style={cardStyle}>
      <div className="shop-product-card__media" style={mediaStyle}>
        <div className="shop-product-card__slider" style={sliderWrapStyle}>
          <img
            src={currentImage || ''}
            alt={product.title}
            style={mainImageStyle}
          />
          {images.length > 1 && (
            <>
              <button type="button" onClick={goPrev} aria-label="Previous image" style={arrowStyle} className="shop-product-card__arrow shop-product-card__arrow--prev">
                ‹
              </button>
              <button type="button" onClick={goNext} aria-label="Next image" style={{ ...arrowStyle, right: 0 }} className="shop-product-card__arrow shop-product-card__arrow--next">
                ›
              </button>
            </>
          )}
        </div>
       
      </div>
      <div className="shop-product-card__body" style={bodyStyle}>
        <h3 className="shop-product-card__title" style={titleStyle}>{product.title}</h3>
        {priceText && <p className="shop-product-card__price" style={priceStyle}>{priceText}</p>}
        {product.description && (
          <p className="shop-product-card__desc shop-product-card__desc--clamp" style={descStyle}>{product.description}</p>
        )}
        <div className="shop-product-card__actions" style={actionsStyle}>
          <button
            type="button"
            onClick={handleSelectClick}
            className="shop-product-card__btn-select"
            style={isSelected ? btnSelectedStyle : btnSelectStyle}
          >
            {isSelected ? '✓ Selected' : '○ Select'}
          </button>
          {onViewMore ? (
            <button type="button" onClick={() => onViewMore(product)} className="shop-product-card__btn-view-more" style={btnSecondaryStyle}>
              View More
            </button>
          ) : (
            <NavLink to={detailUrl} className="shop-product-card__btn-view-more" style={btnSecondaryStyle}>
              View More
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'stretch',
  background: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  marginBottom: 24,
  border: '1px solid #eee'
};

const mediaStyle = {
  flex: '0 0 320px',
  minWidth: 280,
  maxWidth: '100%',
  padding: 16
};

const sliderWrapStyle = {
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
  background: '#f8f8f8',
  aspectRatio: '4/3'
};

const mainImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: 0,
  width: 40,
  height: 40,
  borderRadius: '0 6px 6px 0',
  border: 'none',
  background: 'rgba(0,0,0,0.5)',
  color: '#fff',
  fontSize: 24,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1
};

const thumbStyle = {
  display: 'flex',
  gap: 8,
  marginTop: 10,
  flexWrap: 'wrap',
  justifyContent: 'center'
};

/* Theme: match existing site (style.css .sx-bg-primary / .sx-text-primary) */
const THEME_PRIMARY = '#0f172a';

const thumbItemStyle = {
  width: 56,
  height: 56,
  padding: 0,
  borderRadius: 6,
  border: '2px solid #e0e0e0',
  overflow: 'hidden',
  cursor: 'pointer',
  background: '#fff',
  flexShrink: 0
};

const thumbImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const bodyStyle = {
  flex: '1 1 280px',
  minWidth: 0,
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const titleStyle = {
  margin: '0 0 8px',
  fontSize: '1.35rem',
  fontWeight: 600,
  color: '#1a1a1a',
  lineHeight: 1.3
};

const priceStyle = {
  margin: '0 0 12px',
  fontSize: '1.25rem',
  fontWeight: 700,
  color: THEME_PRIMARY
};

const descStyle = {
  margin: '0 0 20px',
  fontSize: '0.95rem',
  color: '#555',
  lineHeight: 1.6,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12
};

const btnSelectStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: THEME_PRIMARY,
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer'
};

const btnSelectedStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: '#22c55e',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer'
};

const btnSecondaryStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: `2px solid ${THEME_PRIMARY}`,
  color: THEME_PRIMARY,
  fontWeight: 600,
  fontSize: '0.95rem',
  textDecoration: 'none',
  display: 'inline-block'
};

export default ShopProductCard;

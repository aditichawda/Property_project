import React, { useState, useRef, useEffect } from 'react';

const THEME_PRIMARY = '#0f172a';
const WIDE_BREAKPOINT = 769;

/**
 * Quick View modal: two-column layout.
 * Left: main product image, slider arrows, thumbnails (click to update main image).
 * Right: title, price, brand_name, short description, full description, specifications.
 * Close (X) top right. Dimmed background, centered. Close on X or click outside.
 */
function ProductDetailModal({ product, onClose }) {
  const images = product?.images && product.images.length > 0
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbStripRef = useRef(null);
  const leftColRef = useRef(null);
  const [leftColHeight, setLeftColHeight] = useState(null);
  const [isWideLayout, setIsWideLayout] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= WIDE_BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${WIDE_BREAKPOINT}px)`);
    const onMq = () => setIsWideLayout(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    const el = leftColRef.current;
    if (!el || !isWideLayout) {
      setLeftColHeight(null);
      return;
    }
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setLeftColHeight(Math.round(h));
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isWideLayout, product?.id, currentIndex, images.length]);

  if (!product) return null;
  const rawImg = images[currentIndex];
  const currentImage = typeof rawImg === 'string' ? rawImg : (rawImg && rawImg.default) || rawImg;
  const priceText = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : '';

  const shortDesc = product.short_description || product.description || '';
  const fullDesc = product.full_description || product.description || '';
  const specsRaw = product.specification ?? product.product_specification ?? product.specifications ?? [];
  const specs = Array.isArray(specsRaw) ? specsRaw : (typeof specsRaw === 'string' && specsRaw.trim() ? [specsRaw] : []);
  const specHtml = typeof specsRaw === 'string' && specsRaw.trim() ? specsRaw.trim() : null;

  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const goNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const scrollThumbs = (dir) => {
    const el = thumbStripRef.current;
    if (!el) return;
    const step = 66 + 10;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const isSpecKeyValue = (s) => s && typeof s === 'object' && !Array.isArray(s) && (s.label !== undefined || s.name !== undefined || (Object.keys(s).length === 2 && typeof Object.values(s)[0] !== 'object'));
  const specList = Array.isArray(specs)
    ? specs.map((s) => (typeof s === 'string' ? { label: s, value: '' } : isSpecKeyValue(s) ? { label: s.label || s.name || Object.keys(s)[0], value: s.value || Object.values(s)[0] } : { label: s.key || s.label, value: s.value }))
    : specs && typeof specs === 'object' ? Object.entries(specs).map(([k, v]) => ({ label: k, value: v })) : [];
  const specAsString = !specHtml && typeof specsRaw === 'string' && specsRaw.trim() ? specsRaw.trim() : null;

  return (
    <div
      className="product-detail-modal-overlay"
      style={overlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product Quick View"
    >
      <div
        className="product-detail-modal-card product-detail-modal-card--quickview"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={closeBtnStyle}
          className="product-detail-modal-close"
        >
          ✕
        </button>

        <div className="product-detail-modal__two-col" style={twoColWrapStyle}>
          {/* Left: Product images */}
          <div ref={leftColRef} className="product-detail-modal__left" style={leftColStyle}>
            <div className="product-detail-modal__slider-wrap" style={sliderWrapStyle}>
              <img
                src={currentImage || ''}
                alt={product.title}
                style={mainImageStyle}
              />
              {images.length > 1 && (
                <>
                  <button type="button" onClick={goPrev} aria-label="Previous image" style={arrowLeftStyle}>‹</button>
                  <button type="button" onClick={goNext} aria-label="Next image" style={arrowRightStyle}>›</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-detail-modal__thumbnails-wrap" style={thumbOuterWrapStyle}>
                <button type="button" onClick={() => scrollThumbs('left')} aria-label="Scroll thumbnails left" style={thumbScrollBtnLeftStyle}>‹</button>
                <div ref={thumbStripRef} className="product-detail-modal__thumbnails" style={thumbWrapStyle}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      style={{
                        ...thumbBtnStyle,
                        borderColor: i === currentIndex ? THEME_PRIMARY : '#e0e0e0'
                      }}
                    >
                      <img src={typeof img === 'string' ? img : (img && img.default) || img} alt="" style={thumbImgStyle} />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => scrollThumbs('right')} aria-label="Scroll thumbnails right" style={thumbScrollBtnRightStyle}>›</button>
              </div>
            )}
          </div>

          {/* Right: Product details */}
          <div
            className="product-detail-modal__right"
            style={
              isWideLayout && leftColHeight
                ? {
                    ...rightColStyle,
                    height: `${leftColHeight}px`,
                    maxHeight: `${leftColHeight}px`
                  }
                : rightColStyle
            }
          >
            <div style={rightColFixedTopStyle}>
              <h3 className="product-detail-modal__title" style={titleStyle}>{product.title}</h3>
              {priceText && <p className="product-detail-modal__price" style={priceStyle}>{priceText}</p>}
              {(product.brand_name || product.brand) && (
                <p style={brandStyle}><strong>Brand:</strong> {product.brand_name || product.brand}</p>
              )}
              {shortDesc && (
                <p className="product-detail-modal__short-desc" style={shortDescStyle}>{shortDesc}</p>
              )}
            </div>
            {(fullDesc || shortDesc || specList.length > 0 || specAsString || specHtml) && (
              <div className="product-detail-modal__desc-scroll product-detail-modal__desc-scroll--scrollable" style={descScrollWrapStyle}>
                {(fullDesc || shortDesc) && (
                  <>
                    <h6 style={sectionTitleStyle}>Description</h6>
                    <p style={fullDescStyle}>{fullDesc || shortDesc}</p>
                  </>
                )}
                {(specList.length > 0 || specAsString || specHtml) && (
                  <div className="product-detail-modal__specs" style={specsWrapStyle}>
                    <h6 style={sectionTitleStyle}>Product specification</h6>
                    {specHtml ? (
                      <div className="product-detail-modal__spec-html" style={specHtmlWrapStyle} dangerouslySetInnerHTML={{ __html: specHtml }} />
                    ) : specAsString ? (
                      <p style={specParagraphStyle}>{specAsString}</p>
                    ) : (
                      <table style={specTableStyle}>
                        <tbody>
                          {specList.map((row, idx) => (
                            <tr key={idx}>
                              <td style={specLabelStyle}>{row.label}</td>
                              <td style={specValueStyle}>{row.value != null && row.value !== '' ? String(row.value) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
};

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  maxWidth: 920,
  width: '100%',
  height: 'auto',
  maxHeight: '94vh',
  /* overflow: desktop hidden / mobile scroll — set in index.css (inline would override media queries) */
  position: 'relative',
  padding: '24px 24px 28px',
  display: 'flex',
  flexDirection: 'column'
};

const closeBtnStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: '#f0f0f0',
  fontSize: 20,
  cursor: 'pointer',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10
};

const twoColWrapStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 28,
  alignItems: 'start'
};

const leftColStyle = {
  minWidth: 0,
  alignSelf: 'start'
};

const rightColStyle = {
  minWidth: 0,
  paddingRight: 8,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  alignSelf: 'stretch'
};

const rightColFixedTopStyle = {
  flexShrink: 0
};

const descScrollWrapStyle = {
  flex: 1,
  minHeight: 0,
  marginBottom: 0,
  paddingRight: 6,
  overflowX: 'hidden'
};

const sliderWrapStyle = {
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#f8f8f8',
  aspectRatio: '1',
  marginBottom: 14,
  maxHeight: 'min(72vh, 520px)',
  width: '100%'
};

const mainImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const arrowBase = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 44,
  height: 44,
  borderRadius: 8,
  border: 'none',
  background: 'rgba(0,0,0,0.5)',
  color: '#fff',
  fontSize: 26,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
const arrowLeftStyle = { ...arrowBase, left: 12 };
const arrowRightStyle = { ...arrowBase, right: 12 };

const thumbOuterWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 4
};

const thumbScrollBtnLeftStyle = {
  flexShrink: 0,
  width: 32,
  height: 56,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  background: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#555'
};

const thumbScrollBtnRightStyle = {
  ...thumbScrollBtnLeftStyle
};

const thumbWrapStyle = {
  display: 'flex',
  gap: 10,
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
  paddingBottom: 4,
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  flex: 1,
  minWidth: 0
};

const thumbBtnStyle = {
  width: 56,
  height: 56,
  minWidth: 56,
  padding: 0,
  borderRadius: 8,
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

const titleStyle = {
  margin: '0 0 8px',
  fontSize: '1.35rem',
  fontWeight: 700,
  color: '#1a1a1a'
};

const priceStyle = {
  margin: '0 0 12px',
  fontSize: '1.3rem',
  fontWeight: 700,
  color: THEME_PRIMARY
};

const brandStyle = {
  margin: '0 0 12px',
  fontSize: '0.95rem',
  color: '#555'
};

const shortDescStyle = {
  margin: '0 0 16px',
  fontSize: '1rem',
  color: '#444',
  lineHeight: 1.6
};

const sectionTitleStyle = {
  margin: '0 0 10px',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#333'
};

const fullDescStyle = {
  margin: 0,
  fontSize: '0.95rem',
  color: '#444',
  lineHeight: 1.65
};

const specsWrapStyle = { marginTop: 18 };
const specHtmlWrapStyle = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#444',
  lineHeight: 1.6
};
const specParagraphStyle = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#444',
  lineHeight: 1.6
};
const specTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem'
};
const specLabelStyle = {
  padding: '8px 12px 8px 0',
  color: '#555',
  fontWeight: 500,
  verticalAlign: 'top',
  borderBottom: '1px solid #eee'
};
const specValueStyle = {
  padding: '8px 0',
  color: '#222',
  borderBottom: '1px solid #eee'
};

export default ProductDetailModal;

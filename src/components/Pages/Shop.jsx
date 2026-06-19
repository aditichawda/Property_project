import React, { useState, useCallback, useEffect } from 'react';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import Banner from '../Elements/Banner';
import ShopProductCard from '../Elements/ShopProductCard';
import ProductDetailModal from '../Elements/ProductDetailModal';

const bannerImg = require('./../../images/banner/6.jpg');

const API_PRODUCTS_URL = 'https://www.admin.infrioindia.com/api/v2/auth/product-get-all';
const API_PRODUCT_INQUIRY_URL = 'https://www.admin.infrioindia.com/api/v2/auth/product-inquery-store';
const API_PRODUCT_CATEGORIES_URL = 'https://www.admin.infrioindia.com/api/v2/auth/category-list-product';

/** Strip HTML tags for plain-text description */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/** Map API product to ShopProductCard + Quick View format. API: name, description, short_description, specification (HTML), photos, thumbnail_img, category_id, category_name, brand_name, price */
function mapApiProductToCard(item) {
  const photos = item.photos && Array.isArray(item.photos) && item.photos.length > 0
    ? item.photos
    : item.thumbnail_img ? [item.thumbnail_img] : [];
  const shortDesc =
    (item.short_description && item.short_description.trim()) ||
    stripHtml(item.description || '');
  const fullDesc = item.description ? stripHtml(item.description) : shortDesc;
  const specRaw = item.specification ?? item.product_specification ?? item.specifications ?? item.specs ?? null;
  const specs = Array.isArray(specRaw) ? specRaw : (specRaw && typeof specRaw === 'object' && !Array.isArray(specRaw) ? Object.entries(specRaw) : []);
  return {
    id: item.id,
    title: item.name,
    price: item.price != null ? parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0 : null,
    description: shortDesc || '',
    images: photos,
    detailUrl: '/shop-detail',
    category_id: item.category_id || (item.category && item.category.id) || null,
    category_name: item.category_name || (item.category && item.category.name) || '',
    brand_name: item.brand_name || item.brand || '',
    short_description: shortDesc || '',
    full_description: fullDesc || shortDesc || '',
    specifications: specs,
    product_specification: typeof specRaw === 'string' ? specRaw : null,
    specification: typeof specRaw === 'string' ? specRaw : null
  };
}

const THEME_PRIMARY = '#ff6b00';

const stickyWrapStyle = {
  position: 'sticky',
  bottom: 0,
  // marginTop: 24,
  paddingBottom: 24,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  zIndex: 1000,
  minHeight: 0,
};

const fixedBtnStyle = {
  padding: '14px 28px',
  fontSize: '1.05rem',
  fontWeight: 600,
  borderRadius: 10,
  border: 'none',
  background: THEME_PRIMARY,
  color: '#fff',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  cursor: 'pointer',
};

const inquiryErrorStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 16px',
  marginBottom: 12,
  borderRadius: 8,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  fontSize: '0.95rem',
};

const inquiryErrorCloseStyle = {
  background: 'none',
  border: 'none',
  color: '#b91c1c',
  fontSize: 18,
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1,
};

const successCardStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  padding: '36px 32px',
  maxWidth: 400,
  width: '100%',
  textAlign: 'center',
};

const successIconWrapStyle = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: '#dcfce7',
  margin: '0 auto 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const successIconStyle = {
  fontSize: 32,
  color: '#16a34a',
  fontWeight: 700,
  lineHeight: 1,
};

const successTitleStyle = {
  margin: '0 0 10px',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1a1a1a',
};

const successMessageStyle = {
  margin: '0 0 8px',
  fontSize: '1.05rem',
  color: '#166534',
  fontWeight: 500,
};

const successSubStyle = {
  margin: '0 0 24px',
  fontSize: '0.95rem',
  color: '#666',
  lineHeight: 1.5,
};

const successBtnStyle = {
  padding: '12px 32px',
  borderRadius: 10,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
};

const modalStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: 28,
  maxWidth: 480,
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
};

const closeBtnStyle = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: '#f0f0f0',
  fontSize: 18,
  cursor: 'pointer',
  lineHeight: 1
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const submitBtnStyle = {
  padding: '12px 24px',
  borderRadius: 8,
  border: 'none',
  background: THEME_PRIMARY,
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const cancelBtnStyle = {
  padding: '12px 24px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer'
};

function Shop() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quotationForm, setQuotationForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    productInterest: ''
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);
  const [inquiryError, setInquiryError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    setProductsError(null);
    fetch(API_PRODUCTS_URL)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.status && json.data && Array.isArray(json.data)) {
          setProducts(json.data.map(mapApiProductToCard));
        } else {
          setProducts([]);
          setProductsError(json.message || 'Failed to load products');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProducts([]);
          setProductsError(err.message || 'Failed to load products');
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError(null);
    fetch(API_PRODUCT_CATEGORIES_URL)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.status && Array.isArray(json.data)) {
          setCategories(json.data);
        } else {
          setCategories([]);
          setCategoriesError(json.message || 'Failed to load categories');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCategories([]);
          setCategoriesError(err.message || 'Failed to load categories');
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = useCallback((product) => {
    console.log('Add to cart', product);
  }, []);

  const handleToggleSelect = useCallback((product) => {
    setSelectedIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  }, []);

  const handleGetQuotation = useCallback(async () => {
    const authData = localStorage.getItem('infrioAuth');
    let userId = null;
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        userId = auth.userId || auth.id;
      } catch (e) {}
    }
    if (!userId) {
      setInquiryError('Please login to get a quotation.');
      return;
    }
    if (selectedIds.length === 0) {
      setInquiryError('Please select at least one product.');
      return;
    }
    setInquiryError(null);
    setInquiryLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('product_ids', JSON.stringify(selectedIds));
      const res = await fetch(API_PRODUCT_INQUIRY_URL, { method: 'POST', body: formData });
      const json = await res.json();
      if (json.status && json.message) {
        setInquirySuccess(json.message);
        setSelectedIds([]);
      } else {
        setInquiryError(json.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setInquiryError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  }, [selectedIds]);

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuotationSubmit = (e) => {
    e.preventDefault();
    console.log('Quotation request', quotationForm);
    setShowQuotationModal(false);
    setQuotationForm({ name: '', email: '', phone: '', message: '', productInterest: '' });
  };

  const visibleProducts = selectedCategoryId === 'all'
    ? products
    : products.filter((p) => {
        if (!p.category_id) return false;
        const catId = typeof selectedCategoryId === 'string' ? parseInt(selectedCategoryId, 10) : selectedCategoryId;
        return Number(p.category_id) === catId;
      });

  return (
    <>
      <Header2 />
      <div className="page-content">
        <Banner
          title="Our Shop"
          pagename="Shop"
          description="Browse furniture and interior products. Add to cart or request a quotation."
          bgimage={bannerImg}
        />
        <div className="section-full p-t80 p-b80 shop-page-content" style={{ paddingBottom: 24 }}>
          <div className="container">
            <div className="section-head text-center m-b30">
              <h2 className="sep-line-one" style={{ marginBottom: 8 }}>Products</h2>
              <p style={{ color: '#666', maxWidth: 560, margin: '0 auto' }}>
                Select items for your space. Get a custom quotation for bulk or project orders.
              </p>
            </div>

            <div className="m-b30">
              <div className="d-flex flex-wrap align-items-center" style={{ gap: 10 }}>
                <span style={{ fontWeight: 600, marginRight: 4 }}>Filter by category:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('all')}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 999,
                    padding: '6px 14px',
                    border: selectedCategoryId === 'all' ? '1px solid ' + THEME_PRIMARY : '1px solid #ddd',
                    background: selectedCategoryId === 'all' ? 'rgba(215,179,154,0.12)' : '#fff',
                    color: '#333',
                    fontWeight: selectedCategoryId === 'all' ? 600 : 400,
                    fontSize: '0.9rem'
                  }}
                >
                  All
                </button>
                {categoriesLoading && (
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Loading categories...</span>
                )}
                {!categoriesLoading && categoriesError && (
                  <span style={{ fontSize: '0.85rem', color: '#c53030' }}>Categories not available</span>
                )}
                {!categoriesLoading && !categoriesError && categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 999,
                      padding: '6px 14px',
                      border: Number(selectedCategoryId) === Number(cat.id) ? '1px solid ' + THEME_PRIMARY : '1px solid #ddd',
                      background: Number(selectedCategoryId) === Number(cat.id) ? 'rgba(215,179,154,0.12)' : '#fff',
                      color: '#333',
                      fontWeight: Number(selectedCategoryId) === Number(cat.id) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="shop-product-list">
              {productsLoading && (
                <div className="text-center p-t40 p-b40">
                  <p style={{ color: '#666' }}>Loading products...</p>
                </div>
              )}
              {!productsLoading && productsError && (
                <div className="text-center p-t40 p-b40">
                  <p style={{ color: '#c53030' }}>{productsError}</p>
                </div>
              )}
              {!productsLoading && !productsError && products.length === 0 && (
                <div className="text-center p-t40 p-b40">
                  <p style={{ color: '#666' }}>No products available.</p>
                </div>
              )}
              {!productsLoading && !productsError && products.length > 0 && visibleProducts.length === 0 && (
                <div className="text-center p-t40 p-b40">
                  <p style={{ color: '#666' }}>No products in this category.</p>
                </div>
              )}
              {!productsLoading && !productsError && visibleProducts.length > 0 && visibleProducts.map((product) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewMore={(p) => setSelectedProduct(p)}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
            {inquiryError && (
              <div className="shop-inquiry-error" style={inquiryErrorStyle}>
                <span>{inquiryError}</span>
                <button type="button" onClick={() => setInquiryError(null)} aria-label="Dismiss" style={inquiryErrorCloseStyle}>✕</button>
              </div>
            )}
            <div className="shop-quotation-sticky-wrap" style={stickyWrapStyle}>
          <button
            type="button"
            onClick={handleGetQuotation}
            disabled={inquiryLoading}
            className="shop-quotation-fixed-btn"
            style={fixedBtnStyle}
          >
            {inquiryLoading ? 'Submitting...' : 'Get Quotation'}
          </button>
        </div>
          </div>
         
        </div>
        
        <Footer2 />
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {inquirySuccess && (
        <div className="shop-inquiry-success-overlay" style={overlayStyle} onClick={() => setInquirySuccess(null)}>
          <div className="shop-inquiry-success-card" style={successCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={successIconWrapStyle}>
              <span style={successIconStyle}>✓</span>
            </div>
            <h3 style={successTitleStyle}>Success</h3>
            <p style={successMessageStyle}>{inquirySuccess}</p>
            <p style={successSubStyle}>We will get back to you shortly with your quotation.</p>
            <button type="button" onClick={() => setInquirySuccess(null)} style={successBtnStyle}>Done</button>
          </div>
        </div>
      )}

      {showQuotationModal && (
        <div
          className="shop-quotation-modal-overlay"
          style={overlayStyle}
          onClick={() => setShowQuotationModal(false)}
        >
          <div
            className="shop-quotation-modal"
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQuotationModal(false)}
              aria-label="Close"
              style={closeBtnStyle}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Request a Quotation</h3>
            <form onSubmit={handleQuotationSubmit}>
              <div className="form-group m-b15">
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={quotationForm.name}
                  onChange={handleQuotationChange}
                  required
                  style={inputStyle}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group m-b15">
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={quotationForm.email}
                  onChange={handleQuotationChange}
                  required
                  style={inputStyle}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group m-b15">
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={quotationForm.phone}
                  onChange={handleQuotationChange}
                  required
                  style={inputStyle}
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="form-group m-b15">
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Product / category of interest</label>
                <input
                  type="text"
                  name="productInterest"
                  value={quotationForm.productInterest}
                  onChange={handleQuotationChange}
                  style={inputStyle}
                  placeholder="e.g. Sofa, Beds, Full interior"
                />
              </div>
              <div className="form-group m-b20">
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Message</label>
                <textarea
                  name="message"
                  value={quotationForm.message}
                  onChange={handleQuotationChange}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Describe your requirement or project"
                />
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" style={submitBtnStyle}>Submit Request</button>
                <button type="button" onClick={() => setShowQuotationModal(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Shop;

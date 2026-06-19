import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import Banner from '../Elements/Banner';

const bannerImg = require('./../../images/banner/4.jpg');
const bgimg2 = require('./../../images/background/cross-line2.png');

const ArchitectureLayoutLibrary = () => {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // Layout download enquiry form (kept)
  const [showLayoutForm, setShowLayoutForm] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutFormData, setLayoutFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: ""
  });
  const [layoutSubmitting, setLayoutSubmitting] = useState(false);
  const [layoutSuccess, setLayoutSuccess] = useState(false);
  const [layoutSuccessMessage, setLayoutSuccessMessage] = useState('');
  // Custom plan form (replaced with turnkey-style form)
  const [showCustomPlanForm, setShowCustomPlanForm] = useState(false);
  const [customPlanData, setCustomPlanData] = useState({
    propertyType: "Residential",
    plotSize: "",
    plotType: "",
    plotDirection: "",
    constructionType: "",
    constructionStage: "",
    floors: "",
    bedroomsCount: "1",
    drawingLiving: "",
    dining: "",
    kitchen: "",
    toiletsCount: "1",
    kitchenStore: "",
    temple: "",
    washArea: "",
    stairs: "",
    twoWheelerParking: "",
    fourWheelerParking: "",
    commercialType: "",
    requirements: "",
    completionTime: "",
    interiorFurniture: "",
  });
  const [customPlanSubmitting, setCustomPlanSubmitting] = useState(false);
  const [customPlanSuccess, setCustomPlanSuccess] = useState(false);
  const [customPlanSuccessMessage, setCustomPlanSuccessMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('infrioAuth'));
    }
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-design-list', {
        method: 'GET'
      });

      const result = await response.json();

      if (result.status && result.data && result.data.data) {
        setLayouts(result.data.data);
      } else {
        setError(result.message || 'Failed to load layouts');
      }
    } catch (err) {
      console.error('Error fetching layouts:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCustomPlanForm = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirect: '/architecture-layout-library' } });
      return;
    }
    setShowCustomPlanForm(true);
  };

  const closeCustomPlanForm = () => {
    setShowCustomPlanForm(false);
    setCustomPlanData({
      propertyType: "Residential",
      plotSize: "",
      plotType: "",
      plotDirection: "",
      constructionType: "",
      constructionStage: "",
      floors: "",
      bedroomsCount: "1",
      drawingLiving: "",
      dining: "",
      kitchen: "",
      toiletsCount: "1",
      kitchenStore: "",
      temple: "",
      washArea: "",
      stairs: "",
      twoWheelerParking: "",
      fourWheelerParking: "",
      commercialType: "",
      requirements: "",
      completionTime: "",
      interiorFurniture: "",
    });
    setCustomPlanSubmitting(false);
    setCustomPlanSuccess(false);
    setCustomPlanSuccessMessage('');
  };

  const handleCustomPlanChange = (e) => {
    const { name, value } = e.target;
    if (name === 'propertyType') {
      // Reset conditional fields when property type changes
      setCustomPlanData(prev => ({
        ...prev,
        propertyType: value,
        constructionType: "",
        constructionStage: "",
        floors: "",
        bedroomsCount: "1",
        drawingLiving: "",
        dining: "",
        kitchen: "",
        toiletsCount: "1",
        kitchenStore: "",
        temple: "",
        washArea: "",
        stairs: "",
        twoWheelerParking: "",
        fourWheelerParking: "",
        commercialType: "",
        requirements: "",
      }));
      return;
    }

    // Prevent counts less than 1
    if (name === 'bedroomsCount' || name === 'toiletsCount') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1) {
        setCustomPlanData(prev => ({ ...prev, [name]: "1" }));
      } else {
        setCustomPlanData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setCustomPlanData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomPlanSubmit = async (e) => {
    e.preventDefault();
    setCustomPlanSubmitting(true);

    try {
      const authData = localStorage.getItem('infrioAuth');
      const auth = authData ? JSON.parse(authData) : null;
      if (!auth || !auth.userId) {
        alert('Please login to submit custom plan request.');
        setCustomPlanSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('property_type', customPlanData.propertyType);
      formData.append('user_id', auth.userId);
      formData.append('plot_size', customPlanData.plotSize);
      formData.append('plot_type', customPlanData.plotType);
      formData.append('plot_direction', customPlanData.plotDirection);

      if (customPlanData.propertyType === 'Residential') {
        if (customPlanData.constructionType) formData.append('construction_type', customPlanData.constructionType);
        if (customPlanData.constructionStage) formData.append('construction_stage', customPlanData.constructionStage);
        if (customPlanData.floors) formData.append('floors', customPlanData.floors);
        if (customPlanData.bedroomsCount) formData.append('bedrooms_count', customPlanData.bedroomsCount);
        if (customPlanData.drawingLiving) formData.append('drawing_living', customPlanData.drawingLiving);
        if (customPlanData.dining) formData.append('dining', customPlanData.dining);
        if (customPlanData.kitchen) formData.append('kitchen', customPlanData.kitchen);
        if (customPlanData.toiletsCount) formData.append('toilets_count', customPlanData.toiletsCount);
        if (customPlanData.kitchenStore) formData.append('kitchen_store', customPlanData.kitchenStore);
        if (customPlanData.temple) formData.append('temple', customPlanData.temple);
        if (customPlanData.washArea) formData.append('wash_area', customPlanData.washArea);
        if (customPlanData.stairs) formData.append('stairs', customPlanData.stairs);
        if (customPlanData.twoWheelerParking) formData.append('two_wheeler_parking', customPlanData.twoWheelerParking);
        if (customPlanData.fourWheelerParking) formData.append('four_wheeler_parking', customPlanData.fourWheelerParking);
      } else if (customPlanData.propertyType === 'Commercial') {
        if (customPlanData.commercialType) formData.append('commercial_type', customPlanData.commercialType);
        if (customPlanData.constructionType) formData.append('construction_type', customPlanData.constructionType);
      }

      if (customPlanData.requirements) formData.append('requirements', customPlanData.requirements);
      if (customPlanData.completionTime) formData.append('completion_time', customPlanData.completionTime);
      if (customPlanData.interiorFurniture) formData.append('interior_furniture', customPlanData.interiorFurniture);

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-custom-plan-submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        setCustomPlanSubmitting(false);
        setCustomPlanSuccessMessage(result.message || 'Custom plan request submitted successfully');
        setCustomPlanSuccess(true);
        setTimeout(() => {
          closeCustomPlanForm();
        }, 2000);
      } else {
        setCustomPlanSubmitting(false);
        alert(result.message || 'Failed to submit custom plan request. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting custom plan:', err);
      setCustomPlanSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const openGalleryModal = (layout) => {
    const photos = layout.images && layout.images.length > 0 
      ? layout.images 
      : (layout.thumbnail ? [layout.thumbnail] : []);
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(0);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setGalleryPhotos([]);
    setCurrentPhotoIndex(0);
  };

  // Layout download enquiry handlers
  const handleLayoutDownloadClick = (layout) => {
    setSelectedLayout(layout);
    setShowLayoutForm(true);
  };

  const handleLayoutFormChange = (e) => {
    const { name, value } = e.target;
    setLayoutFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeLayoutForm = () => {
    setShowLayoutForm(false);
    setSelectedLayout(null);
    setLayoutFormData({ name: "", phone: "", email: "", city: "" });
    setLayoutSuccess(false);
    setLayoutSuccessMessage('');
  };

  const handleLayoutFormSubmit = async (e) => {
    e.preventDefault();
    setLayoutSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('come_from', 'Architectural');
      formData.append('enquiry_name', selectedLayout?.name || 'Layout Download');
      formData.append('name', layoutFormData.name);
      formData.append('phone', layoutFormData.phone);
      formData.append('email', layoutFormData.email);
      formData.append('city', layoutFormData.city);

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/services-enquiry-submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        setLayoutSubmitting(false);
        setLayoutSuccessMessage(result.message || 'Enquiry submitted successfully');
        setLayoutSuccess(true);
        setTimeout(() => {
          closeLayoutForm();
        }, 2000);
      } else {
        setLayoutSubmitting(false);
        alert(result.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setLayoutSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const goPrevPhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPhotoIndex((idx) => (idx - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const goNextPhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPhotoIndex((idx) => (idx + 1) % galleryPhotos.length);
  };

  // Show only one layout if not authenticated
  const visibleLayouts = layouts

  return (
    <>
      <Header2 />
      <div className="page-content">
        <Banner
          title="Architecture Layout Library"
          pagename="Layout Library"
          description="Browse our collection of architectural layout designs and request custom plans."
          bgimage={bannerImg}
        />

        <div className="section-full p-t80 p-b80 bg-gray mobile-page-padding">
          <div className="container">
            {/* <div className="section-head m-b30">
              <div className="sx-separator-outer separator-left">
                <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                  <h3 className="sep-line-one">Architecture Layout Library</h3>
                </div>
              </div>
            </div> */}

            {!isAuthenticated && (
              <div className="alert alert-warning m-b30" role="alert">
                <i className="fa fa-info-circle m-r10"></i>
                Login to unlock all layout categories. You can currently preview one sample layout.
                <NavLink to="/login" className="alert-link m-l10">Login here</NavLink>
              </div>
            )}

            {loading ? (
              <div className="text-center p-a40">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="m-t20 text-muted">Loading layouts...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">
                <i className="fa fa-exclamation-triangle m-r10"></i>
                {error}
                <button className="btn btn-sm btn-outline-danger m-l20" onClick={fetchLayouts}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="row">
                {/* Custom Layout Request Card */}
                <div className="col-lg-3 col-md-6 col-sm-12 m-b30">
                  <div className="sx-box bg-dark text-white shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div className="p-a20">
                      <h4 className="m-b10 text-white">Request a Custom Layout</h4>
                      <p className="text-white-50 m-b15">
                        Have unique requirements? Share plot size, room needs and preferences for a bespoke plan.
                      </p>
                      <ul className="list-unstyled text-white-50 m-b15">
                        <li><i className="fa fa-check text-success m-r5" /> Tailored layout planning</li>
                        <li><i className="fa fa-check text-success m-r5" /> Concept notes & references</li>
                        <li><i className="fa fa-check text-success m-r5" /> Admin-reviewed delivery</li>
                      </ul>
                    </div>
                    <div className="p-a20">
                      <button className="site-button-secondry btn-block" onClick={openCustomPlanForm}>
                        Request Custom Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Layout Cards */}
                {visibleLayouts.map((layout) => (
                  <div className="col-lg-3 col-md-6 col-sm-12 m-b30" key={layout.id}>
                    <div className="sx-box bg-white shadow-sm h-100 d-flex flex-column">
                      <div 
                        className="sx-thum-bx" 
                        style={{ height: '180px', overflow: 'hidden', borderRadius: '10px 10px 0 0', cursor: 'pointer' }}
                        // onClick={() => openGalleryModal(layout)}
                      >
                        <img 
                          src={layout.thumbnail || (layout.images && layout.images[0])} 
                          alt={layout.name || 'Layout'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          loading="lazy" 
                        />
                      </div>
                      <div className="sx-info p-a20 flex-grow-1 d-flex flex-column">
                        <h4 className="m-b10">{layout.name || 'Layout Design'}</h4>
                        <ul className="list-unstyled text-muted m-b15">
                          {layout.area && <li>Area: {layout.area}</li>}
                          {layout.configuration && <li>Configuration: {layout.configuration}</li>}
                          {layout.structure && <li>Structure: {layout.structure}</li>}
                        </ul>
                        <button
                          className="site-button btn-sm mt-auto"
                          onClick={() => isAuthenticated ? openGalleryModal(layout) : handleLayoutDownloadClick(layout)}
                        >
                          View Layout
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer2 />

      {/* Layout Download Form Modal */}
      {showLayoutForm && selectedLayout && (
        <div
          className="modal-overlay"
          onClick={closeLayoutForm}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 2100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px, 2vw, 20px)'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: 'min(95vw, 520px)',
              padding: 'clamp(16px, 3vw, 32px)',
              position: 'relative'
            }}
          >
            <button
              onClick={closeLayoutForm}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                border: 'none', background: 'transparent',
                fontSize: '20px', cursor: 'pointer'
              }}
            >
              ✖
            </button>
            {layoutSuccess ? (
              <div className="text-center p-t30 p-b30">
                <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }} />
                <h4 className="m-t20">Enquiry Submitted Successfully!</h4>
                <p className="m-t10">{layoutSuccessMessage || 'We have received your enquiry and will get back to you soon.'}</p>
              </div>
            ) : (
              <>
                <h4 className="m-b10">Download {selectedLayout.name || 'Layout'}</h4>
                <p className="text-muted m-b20">
                  Please share your details and we will send the complete layout with specifications.
                </p>
                <form onSubmit={handleLayoutFormSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={layoutFormData.name}
                      onChange={handleLayoutFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={layoutFormData.phone}
                      onChange={handleLayoutFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={layoutFormData.email}
                      onChange={handleLayoutFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={layoutFormData.city}
                      onChange={handleLayoutFormChange}
                      required
                    />
                  </div>
                  <button type="submit" className="site-button btn-block" disabled={layoutSubmitting}>
                    <span>{layoutSubmitting ? 'Submitting...' : 'Send & View'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Plan Form Modal (Turnkey-style) */}
      {showCustomPlanForm && (
        <div
          className="modal-overlay"
          onClick={closeCustomPlanForm}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 2100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px, 2vw, 20px)'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: 'min(95vw, 720px)',
              padding: 'clamp(16px, 3vw, 32px)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* <button
              onClick={closeCustomPlanForm}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                border: 'none', background: 'transparent',
                fontSize: '20px', cursor: 'pointer'
              }}
            >
              ✖
            </button> */}
            <button
                onClick={closeCustomPlanForm}
                style={{ 
                  position: 'absolute', 
                  top: 'clamp(8px, 2vw, 12px)', 
                  right: 'clamp(8px, 2vw, 12px)', 
                  background: 'rgba(0, 0, 0, 0.6)', 
                  color: '#fff', 
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: 'clamp(40px, 8vw, 48px)',
                  height: 'clamp(40px, 8vw, 48px)',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  cursor: 'pointer',
                  lineHeight: 1,
                  zIndex: 1000,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                aria-label="Close"
              >
                ✖
              </button>
            {customPlanSuccess ? (
              <div className="text-center p-t30 p-b30">
                <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }} />
                <h4 className="m-t20">Custom Plan Request Submitted</h4>
                <p className="m-t10">{customPlanSuccessMessage || 'Our team will get in touch with details.'}</p>
              </div>
            ) : (
              <>
                <h4 className="m-b10">Custom Plan Request</h4>
                <p className="text-muted m-b20">
                  Share your plot details and requirements. We will prepare a tailored architectural plan.
                </p>
                <form onSubmit={handleCustomPlanSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label>Property Type *</label>
                      <select name="propertyType" value={customPlanData.propertyType} onChange={handleCustomPlanChange} className="form-control" required>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Size *</label>
                      <input type="text" name="plotSize" value={customPlanData.plotSize} onChange={handleCustomPlanChange} className="form-control" placeholder="e.g., 30x40" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Type *</label>
                      <select name="plotType" value={customPlanData.plotType} onChange={handleCustomPlanChange} className="form-control" required>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Corner">Corner</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Direction *</label>
                      <select name="plotDirection" value={customPlanData.plotDirection} onChange={handleCustomPlanChange} className="form-control" required>
                        <option value="">Select</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="North East Corner">North East Corner</option>
                        <option value="North West Corner">North West Corner</option>
                        <option value="South East Corner">South East Corner</option>
                        <option value="South West Corner">South West Corner</option>
                        <option value="East West Open">East West Open</option>
                        <option value="North South Open">North South Open</option>
                        <option value="Three Side Open">Three Side Open</option>
                      </select>
                    </div>

                    {customPlanData.propertyType === "Residential" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label>Construction Type *</label>
                          <select name="constructionType" value={customPlanData.constructionType} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Simplex">Simplex</option>
                            <option value="Bungalow">Bungalow</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Construction Stage *</label>
                          <select name="constructionStage" value={customPlanData.constructionStage} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Structure">Structure</option>
                            <option value="Complete">Complete</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Floors *</label>
                          <select name="floors" value={customPlanData.floors} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Ground">Ground</option>
                            <option value="G+0.5">G+0.5</option>
                            <option value="G+1">G+1</option>
                            <option value="G+1.5">G+1.5</option>
                            <option value="G+2">G+2</option>
                            <option value="G+3">G+3</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Bedrooms/Rooms Count *</label>
                          <input type="number" name="bedroomsCount" value={customPlanData.bedroomsCount} onChange={handleCustomPlanChange} className="form-control" min="1" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Drawing/Living *</label>
                          <select name="drawingLiving" value={customPlanData.drawingLiving} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Dining *</label>
                          <select name="dining" value={customPlanData.dining} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Kitchen *</label>
                          <select name="kitchen" value={customPlanData.kitchen} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Toilets Count *</label>
                          <input type="number" name="toiletsCount" value={customPlanData.toiletsCount} onChange={handleCustomPlanChange} className="form-control" min="1" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Kitchen Store *</label>
                          <select name="kitchenStore" value={customPlanData.kitchenStore} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Temple *</label>
                          <select name="temple" value={customPlanData.temple} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Wash Area *</label>
                          <select name="washArea" value={customPlanData.washArea} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Stairs *</label>
                          <select name="stairs" value={customPlanData.stairs} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Inside">Inside</option>
                            <option value="Outside">Outside</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Two-wheeler Parking *</label>
                          <input type="text" name="twoWheelerParking" value={customPlanData.twoWheelerParking} onChange={handleCustomPlanChange} className="form-control" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Four Wheeler Parking *</label>
                          <input type="text" name="fourWheelerParking" value={customPlanData.fourWheelerParking} onChange={handleCustomPlanChange} className="form-control" required />
                        </div>
                      </>
                    )}

                    {customPlanData.propertyType === "Commercial" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label>Commercial Type *</label>
                          <select name="commercialType" value={customPlanData.commercialType} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Farm House">Farm House</option>
                            <option value="Resort">Resort</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Office">Office</option>
                            <option value="Showroom">Showroom</option>
                            <option value="Warehouse/Godown">Warehouse/Godown</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Construction Type *</label>
                          <select name="constructionType" value={customPlanData.constructionType} onChange={handleCustomPlanChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Labour">Labour</option>
                            <option value="With Material">With Material</option>
                          </select>
                        </div>
                        <div className="col-md-12 mb-3">
                          <label>Requirements (Describe) *</label>
                          <textarea name="requirements" value={customPlanData.requirements} onChange={handleCustomPlanChange} className="form-control" rows="4" required />
                        </div>
                      </>
                    )}

                    <div className="col-md-6 mb-3">
                      <label>Completion Time *</label>
                      <input type="text" name="completionTime" value={customPlanData.completionTime} onChange={handleCustomPlanChange} className="form-control" placeholder="e.g., 6 months" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Interior/Furniture *</label>
                      <select name="interiorFurniture" value={customPlanData.interiorFurniture} onChange={handleCustomPlanChange} className="form-control" required>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-right m-t20">
                    <button type="button" className="site-button-secondry btn-half m-r10" onClick={closeCustomPlanForm}>Cancel</button>
                    <button type="submit" className="site-button btn-half" disabled={customPlanSubmitting}>
                      {customPlanSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div
          className="modal-overlay"
          onClick={closeGalleryModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(8px, 2vw, 16px)'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(48, 47, 47, 0.9)', borderRadius: 10,
              width: 'min(96vw, 1000px)',
              height: 'min(92vh, 720px)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', position: 'relative',
              padding: 'clamp(12px, 2.5vw, 20px)'
            }}
          >
            {/* <button
              onClick={closeGalleryModal}
              style={{ position: 'absolute', top: 'clamp(6px, 1.5vw, 10px)', right: 'clamp(6px, 1.5vw, 10px)', background: 'transparent', color: '#fff', border: 'none', fontSize: 'clamp(18px, 3.5vw, 22px)', cursor: 'pointer', lineHeight: 1 }}
              aria-label="Close"
            >
              ✖
            </button> */}
            <button
                onClick={closeGalleryModal}
                style={{ 
                  position: 'absolute', 
                  top: 'clamp(8px, 2vw, 12px)', 
                  right: 'clamp(8px, 2vw, 12px)', 
                  background: 'rgba(0, 0, 0, 0.6)', 
                  color: '#fff', 
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: 'clamp(40px, 8vw, 48px)',
                  height: 'clamp(40px, 8vw, 48px)',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  cursor: 'pointer',
                  lineHeight: 1,
                  zIndex: 1000,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                aria-label="Close"
              >
                ✖
              </button>
            {galleryPhotos.length > 0 && (
              <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, background: 'transparent', borderRadius: 8 }}>
                <img
                  src={galleryPhotos[currentPhotoIndex]}
                  alt="gallery"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {galleryPhotos.length > 1 && (
                  <>
                    <button onClick={goPrevPhoto} style={{ position: 'absolute', top: '50%', left: 'clamp(6px, 1.5vw, 12px)', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}>&lt;</button>
                    <button onClick={goNextPhoto} style={{ position: 'absolute', top: '50%', right: 'clamp(6px, 1.5vw, 12px)', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}>&gt;</button>
                  </>
                )}
              </div>
            )}

            {galleryPhotos.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 1.5vw, 10px)', marginTop: 'clamp(8px, 2vw, 14px)', background: 'transparent', flexShrink: 0 }}>
                <button
                  onClick={goPrevPhoto}
                  aria-label="Previous"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  ‹
                </button>
                <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 10px)', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '80vw', padding: '4px 2px' }}>
                  {galleryPhotos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhotoIndex(i)}
                      style={{
                        border: i === currentPhotoIndex ? '2px solid #0f172a' : '1px solid #333',
                        padding: 0, background: 'transparent', cursor: 'pointer', borderRadius: 6, flex: '0 0 auto'
                      }}
                      aria-label={`Photo ${i + 1}`}
                    >
                      <img src={p} alt="thumb" style={{ width: 'clamp(48px, 9vw, 72px)', height: 'clamp(48px, 9vw, 72px)', objectFit: 'cover', display: 'block', borderRadius: 6 }} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={goNextPhoto}
                  aria-label="Next"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ArchitectureLayoutLibrary;


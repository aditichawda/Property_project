import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import Banner from '../Elements/Banner';
import SEO from '../Common/SEO';

const bannerImg = require('./../../images/banner/4.jpg');
const bgimg2 = require('./../../images/background/cross-line2.png');

const TurnkeyConstructionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanEnquiryModal, setShowPlanEnquiryModal] = useState(false);
  const [showPlanViewer, setShowPlanViewer] = useState(false);
  const [planToViewUrl, setPlanToViewUrl] = useState(null);
  const [planEnquiryData, setPlanEnquiryData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    propertyType: "Residential",
    plotSize: "",
    plotType: "",
    plotDirection: "",
    constructionType: "",
    constructionStage: "",
    floors: "",
    commercialType: "",
    requirements: "",
    completionTime: "",
    interiorFurniture: "",
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
  });
  const [planEnquirySubmitting, setPlanEnquirySubmitting] = useState(false);
  const [planEnquirySuccess, setPlanEnquirySuccess] = useState(false);
  const [planEnquirySuccessMessage, setPlanEnquirySuccessMessage] = useState('');
  
  const [showCustomPlanForm, setShowCustomPlanForm] = useState(false);
  const [customPlanData, setCustomPlanData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    plotSize: "",
    requirements: "",
    comments: ""
  });
  const [customPlanSubmitting, setCustomPlanSubmitting] = useState(false);
  const [customPlanSuccess, setCustomPlanSuccess] = useState(false);
  const [customPlanSuccessMessage, setCustomPlanSuccessMessage] = useState('');
  
  // Simple enquiry form for "View Plan Details" button
  const [showSimpleEnquiryModal, setShowSimpleEnquiryModal] = useState(false);
  const [simpleEnquiryData, setSimpleEnquiryData] = useState({
    name: "",
    phone: "",
    email: "",
    city: ""
  });
  const [simpleEnquirySubmitting, setSimpleEnquirySubmitting] = useState(false);
  const [simpleEnquirySuccess, setSimpleEnquirySuccess] = useState(false);
  const [simpleEnquirySuccessMessage, setSimpleEnquirySuccessMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('infrioAuth'));
    }
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/turnkey-design-list', {
        method: 'GET'
      });

      const result = await response.json();

      if (result.status && result.data && result.data.data) {
        setPlans(result.data.data);
      } else {
        setError(result.message || 'Failed to load plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = (plan) => {
    // if (!isAuthenticated) {
    //   if (window.confirm('Please login or register to view plan details. Redirect to login?')) {
    //     navigate('/login', { state: { redirect: '/turnkey-construction-plans' } });
    //   }
    //   return;
    // }
    setSelectedPlan(plan);
    setShowSimpleEnquiryModal(true);
  };

  const handleCustomPlanClick = () => {
    if (!isAuthenticated) {
      // if (window.confirm('Please login to request a custom plan. Redirect to login?')) {
        navigate('/login', { state: { redirect: '/turnkey-construction-plans' } });
      
    }
    setSelectedPlan({ name: 'Custom Turnkey Plan', id: 'custom' });
    setShowPlanEnquiryModal(true);
  };

  const resetPlanEnquiryForm = () => {
    setPlanEnquiryData({
      name: "",
      phone: "",
      email: "",
      city: "",
      propertyType: "Residential",
      plotSize: "",
      plotType: "",
      plotDirection: "",
      constructionType: "",
      constructionStage: "",
      floors: "",
      commercialType: "",
      requirements: "",
      completionTime: "",
      interiorFurniture: "",
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
    });
    setPlanEnquirySuccess(false);
    setPlanEnquirySuccessMessage('');
  };

  const closePlanEnquiryModal = () => {
    setShowPlanEnquiryModal(false);
    resetPlanEnquiryForm();
  };

  const closeSimpleEnquiryModal = () => {
    setShowSimpleEnquiryModal(false);
    setSimpleEnquiryData({
      name: "",
      phone: "",
      email: "",
      city: ""
    });
    setSimpleEnquirySuccess(false);
    setSimpleEnquirySuccessMessage('');
  };

  const handleSimpleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setSimpleEnquiryData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSimpleEnquirySubmitting(true);

    try {
      const formData = new FormData();
      formData.append('come_from', 'Turnkey');
      formData.append('enquiry_name', selectedPlan?.name || 'Turnkey Construction Plan');
      formData.append('name', simpleEnquiryData.name);
      formData.append('phone', simpleEnquiryData.phone);
      formData.append('email', simpleEnquiryData.email);
      formData.append('city', simpleEnquiryData.city);

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/services-enquiry-submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status) {
        setSimpleEnquirySuccessMessage(result.message || 'Enquiry submitted successfully');
        setSimpleEnquirySuccess(true);
      } else {
        alert(result.message || 'Failed to submit enquiry.');
      }
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSimpleEnquirySubmitting(false);
      setTimeout(() => {
        closeSimpleEnquiryModal();
        // Open plan viewer after successful submission
        if (selectedPlan) {
          setPlanToViewUrl(selectedPlan?.pdf || selectedPlan?.image);
          setShowPlanViewer(true);
        }
      }, 2000);
    }
  };

  const handlePlanEnquiryChange = (e) => {
    const { name, value } = e.target;
    
    // If property type changes, clear all conditional fields
    if (name === 'propertyType') {
      setPlanEnquiryData(prev => {
        const baseFields = {
          name: prev.name,
          phone: prev.phone,
          email: prev.email,
          city: prev.city,
          propertyType: value,
          plotSize: prev.plotSize,
          plotType: prev.plotType,
          plotDirection: prev.plotDirection,
          requirements: prev.requirements,
          completionTime: prev.completionTime,
          interiorFurniture: prev.interiorFurniture,
        };
        
        // Clear all conditional fields
        if (value === 'Residential') {
          return {
            ...baseFields,
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
          };
        } else if (value === 'Commercial') {
          return {
            ...baseFields,
            commercialType: "",
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
          };
        }
        
        return { ...prev, [name]: value };
      });
    } else {
      // Validate count fields - must be at least 1
      if (name === 'bedroomsCount' || name === 'toiletsCount') {
        if (value === '' || value === null || value === undefined) {
          // Keep default value of 1 if empty
          setPlanEnquiryData(prev => ({ ...prev, [name]: "1" }));
          return;
        }
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          // Set to 1 if value is invalid (less than 1 or not a number)
          setPlanEnquiryData(prev => ({ ...prev, [name]: "1" }));
          return;
        }
        // Valid value, update normally
        setPlanEnquiryData(prev => ({ ...prev, [name]: value }));
      } else {
        setPlanEnquiryData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handlePlanEnquirySubmit = async (e) => {
    e.preventDefault();
    setPlanEnquirySubmitting(true);
    
    try {
      // Check if it's a custom plan request
      const isCustomPlan = selectedPlan?.id === 'custom';
      
      if (isCustomPlan) {
        // Use turnkey-custom-plan-submit API for custom plans
        const authData = localStorage.getItem('infrioAuth');
        const auth = authData ? JSON.parse(authData) : null;
        
        if (!auth || !auth.userId) {
          alert('Please login to submit custom plan request.');
          setPlanEnquirySubmitting(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('property_type', planEnquiryData.propertyType);
        formData.append('user_id', auth.userId);
        formData.append('plot_size', planEnquiryData.plotSize);
        formData.append('plot_type', planEnquiryData.plotType);
        formData.append('plot_direction', planEnquiryData.plotDirection);
        
        if (planEnquiryData.propertyType === 'Residential') {
          // Residential specific fields
          if (planEnquiryData.constructionType) {
            formData.append('construction_type', planEnquiryData.constructionType);
          }
          if (planEnquiryData.constructionStage) {
            formData.append('construction_stage', planEnquiryData.constructionStage);
          }
          if (planEnquiryData.floors) {
            formData.append('floors', planEnquiryData.floors);
          }
          if (planEnquiryData.bedroomsCount) {
            formData.append('bedrooms_count', planEnquiryData.bedroomsCount);
          }
          if (planEnquiryData.drawingLiving) {
            formData.append('drawing_living', planEnquiryData.drawingLiving);
          }
          if (planEnquiryData.dining) {
            formData.append('dining', planEnquiryData.dining);
          }
          if (planEnquiryData.kitchen) {
            formData.append('kitchen', planEnquiryData.kitchen);
          }
          if (planEnquiryData.toiletsCount) {
            formData.append('toilets_count', planEnquiryData.toiletsCount);
          }
          if (planEnquiryData.kitchenStore) {
            formData.append('kitchen_store', planEnquiryData.kitchenStore);
          }
          if (planEnquiryData.temple) {
            formData.append('temple', planEnquiryData.temple);
          }
          if (planEnquiryData.washArea) {
            formData.append('wash_area', planEnquiryData.washArea);
          }
          if (planEnquiryData.stairs) {
            formData.append('stairs', planEnquiryData.stairs);
          }
          if (planEnquiryData.twoWheelerParking) {
            formData.append('two_wheeler_parking', planEnquiryData.twoWheelerParking);
          }
          if (planEnquiryData.fourWheelerParking) {
            formData.append('four_wheeler_parking', planEnquiryData.fourWheelerParking);
          }
        } else if (planEnquiryData.propertyType === 'Commercial') {
          // Commercial specific fields
          if (planEnquiryData.commercialType) {
            formData.append('commercial_type', planEnquiryData.commercialType);
          }
          if (planEnquiryData.constructionType) {
            formData.append('construction_type', planEnquiryData.constructionType);
          }
        }
        
        // Common fields for both types
        if (planEnquiryData.requirements) {
          formData.append('requirements', planEnquiryData.requirements);
        }
        if (planEnquiryData.completionTime) {
          formData.append('completion_time', planEnquiryData.completionTime);
        }
        if (planEnquiryData.interiorFurniture) {
          formData.append('interior_furniture', planEnquiryData.interiorFurniture);
        }

        const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/turnkey-custom-plan-submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status) {
          setPlanEnquirySubmitting(false);
          setPlanEnquirySuccessMessage(result.message || 'Custom plan request submitted successfully');
          setPlanEnquirySuccess(true);
          
          setTimeout(() => {
            closePlanEnquiryModal();
          }, 2000);
        } else {
          setPlanEnquirySubmitting(false);
          alert(result.message || 'Failed to submit custom plan request. Please try again.');
        }
      } else {
        // Use services-enquiry-submit API for regular plan enquiries
        const formData = new FormData();
        formData.append('come_from', 'Turnkey Construction');
        formData.append('enquiry_name', selectedPlan?.name || 'Turnkey Construction Plan');
        formData.append('name', planEnquiryData.name);
        formData.append('phone', planEnquiryData.phone);
        formData.append('email', planEnquiryData.email);
        formData.append('city', planEnquiryData.city);
        // Add all other enquiry form fields
        Object.keys(planEnquiryData).forEach(key => {
          if (key !== 'name' && key !== 'phone' && key !== 'email' && key !== 'city' && planEnquiryData[key]) {
            formData.append(key, planEnquiryData[key]);
          }
        });

        const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/services-enquiry-submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status) {
          setPlanEnquirySubmitting(false);
          setPlanEnquirySuccessMessage(result.message || 'Enquiry submitted successfully');
          setPlanEnquirySuccess(true);
          
          setTimeout(() => {
            setShowPlanEnquiryModal(false);
            resetPlanEnquiryForm();
            // Open plan viewer
            setPlanToViewUrl(selectedPlan?.pdf || selectedPlan?.image);
            setShowPlanViewer(true);
          }, 2000);
        } else {
          setPlanEnquirySubmitting(false);
          alert(result.message || 'Failed to submit enquiry. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error submitting plan enquiry:', err);
      setPlanEnquirySubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  };

 

  return (
    <>
      <SEO
        titleExact
        title="Design and Build Services – Infrio India Turnkey Projects"
        description="Explore Infrio India’s design and build services for complete project execution from concept to construction. We handle planning, coordination, and delivery with creative design, quality craftsmanship, and seamless project management."
        keywords="Design and build services, turnkey architecture projects India, project planning and execution, construction design solutions, build management experts, residential build services, commercial design and construction, end-to-end project support, Infrio design-build"
        canonicalPath="/turnkey-construction"
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Turnkey Construction Plans"
          pagename="Construction Plans"
          description="Browse our collection of turnkey construction plans and request custom designs."
          bgimage={bannerImg}
        />

        <div className="section-full p-t80 p-b80 bg-gray mobile-page-padding">
          <div className="container">
            {/* <div className="section-head m-b30">
              <div className="sx-separator-outer separator-left">
                <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                  <h3 className="sep-line-one">Available Construction Plans</h3>
                </div>
              </div>
            </div> */}

            {!isAuthenticated && (
              <div className="alert alert-warning m-b30" role="alert">
                <i className="fa fa-info-circle m-r10"></i>
                Please login to view plan details and submit enquiries.
                <NavLink to="/login" className="alert-link m-l10">Login here</NavLink>
              </div>
            )}

            {loading ? (
              <div className="text-center p-a40">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="m-t20 text-muted">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">
                <i className="fa fa-exclamation-triangle m-r10"></i>
                {error}
                <button className="btn btn-sm btn-outline-danger m-l20" onClick={fetchPlans}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="row">
                {/* Custom Plan Request Card */}
                <div className="col-lg-3 col-md-6 col-sm-12 m-b30">
                  <div className="sx-box bg-dark text-white shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div className="p-a20">
                      <h4 className="m-b10 text-white">Request a Custom Plan</h4>
                      <p className="text-white-50 m-b15">
                        Have unique construction requirements? Share plot size, property type, and preferences for a bespoke turnkey plan.
                      </p>
                      <ul className="list-unstyled text-white-50 m-b15">
                        <li><i className="fa fa-check text-success m-r5" /> Tailored construction planning</li>
                        <li><i className="fa fa-check text-success m-r5" /> Complete project specifications</li>
                        <li><i className="fa fa-check text-success m-r5" /> Admin-reviewed delivery</li>
                      </ul>
                    </div>
                    <div className="p-a20">
                      <button 
                        className="site-button-secondry btn-block"
                        onClick={handleCustomPlanClick}
                      >
                        Request Custom Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Cards */}
                {plans.map((plan) => (
                  <div key={plan.id} className="col-lg-3 col-md-6 col-sm-12 m-b30">
                    <div className="sx-box bg-white shadow-sm border-radius-10 overflow-hidden h-100 d-flex flex-column">
                      <div className="sx-thum-bx" style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                        <img 
                          src={plan.image || plan.thumbnail} 
                          alt={plan.name || 'Plan'}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          loading="lazy"
                        />
                      </div>
                      <div className="sx-info p-a20 flex-grow-1 d-flex flex-column">
                        <h4 className="sx-tilte m-b10">{plan.name || 'Construction Plan'}</h4>
                        <p className="text-muted m-b15" style={{ fontSize: '14px' }}>
                          {plan.short_description || plan.description || 'View details and submit enquiry to access plan.'}
                        </p>
                        <button
                          className="site-button btn-sm mt-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanClick(plan);
                          }}
                        >
                          View Plan Details
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

      {/* Plan Enquiry Form Modal */}
      {showPlanEnquiryModal && selectedPlan && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div className="modal-content bg-white" style={{ borderRadius: '10px', width: 'min(95vw, 800px)', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={closePlanEnquiryModal}
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
            {planEnquirySuccess ? (
              <div className="text-center p-t30 p-b30">
                <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }} />
                <h4 className="m-t20">Enquiry Submitted Successfully!</h4>
                <p className="m-t10">{planEnquirySuccessMessage || 'You can now view the plan details.'}</p>
              </div>
            ) : (
              <>
                <h3 className="m-b20">
                  {selectedPlan?.id === 'custom' 
                    ? 'Custom Turnkey Plan Request Form' 
                    : `Project Enquiry Form - ${selectedPlan?.name || 'Construction Plan'}`}
                </h3>
                {selectedPlan?.id === 'custom' && (
                  <p className="text-muted m-b20">
                    Please fill in your construction requirements. Our team will create a custom plan based on your specifications.
                  </p>
                )}
                <form onSubmit={handlePlanEnquirySubmit}>
                  <div className="row">
                    
                    <div className="col-md-6 mb-3">
                      <label>Property Type *</label>
                      <select name="propertyType" value={planEnquiryData.propertyType} onChange={handlePlanEnquiryChange} className="form-control" required>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Size *</label>
                      <input type="text" name="plotSize" value={planEnquiryData.plotSize} onChange={handlePlanEnquiryChange} className="form-control" placeholder="e.g., 30x40" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Type *</label>
                      <select name="plotType" value={planEnquiryData.plotType} onChange={handlePlanEnquiryChange} className="form-control" required>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Corner">Corner</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Plot Direction *</label>
                      <select name="plotDirection" value={planEnquiryData.plotDirection} onChange={handlePlanEnquiryChange} className="form-control" required>
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
                    {planEnquiryData.propertyType === "Residential" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label>Construction Type *</label>
                          <select name="constructionType" value={planEnquiryData.constructionType} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Simplex">Simplex</option>
                            <option value="Bungalow">Bungalow</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Construction Stage *</label>
                          <select name="constructionStage" value={planEnquiryData.constructionStage} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Structure">Structure</option>
                            <option value="Complete">Complete</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Floors *</label>
                          <select name="floors" value={planEnquiryData.floors} onChange={handlePlanEnquiryChange} className="form-control" required>
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
                          <input type="number" name="bedroomsCount" value={planEnquiryData.bedroomsCount} onChange={handlePlanEnquiryChange} className="form-control" min="1" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Drawing/Living *</label>
                          <select name="drawingLiving" value={planEnquiryData.drawingLiving} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Dining *</label>
                          <select name="dining" value={planEnquiryData.dining} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Kitchen *</label>
                          <select name="kitchen" value={planEnquiryData.kitchen} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Toilets Count *</label>
                          <input type="number" name="toiletsCount" value={planEnquiryData.toiletsCount} onChange={handlePlanEnquiryChange} className="form-control" min="1" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Kitchen Store *</label>
                          <select name="kitchenStore" value={planEnquiryData.kitchenStore} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Temple *</label>
                          <select name="temple" value={planEnquiryData.temple} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Wash Area *</label>
                          <select name="washArea" value={planEnquiryData.washArea} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Stairs *</label>
                          <select name="stairs" value={planEnquiryData.stairs} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Inside">Inside</option>
                            <option value="Outside">Outside</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Two-wheeler Parking *</label>
                          <input type="text" name="twoWheelerParking" value={planEnquiryData.twoWheelerParking} onChange={handlePlanEnquiryChange} className="form-control" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Four Wheeler Parking *</label>
                          <input type="text" name="fourWheelerParking" value={planEnquiryData.fourWheelerParking} onChange={handlePlanEnquiryChange} className="form-control" required />
                        </div>
                      </>
                    )}
                    {planEnquiryData.propertyType === "Commercial" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label>Commercial Type *</label>
                          <select name="commercialType" value={planEnquiryData.commercialType} onChange={handlePlanEnquiryChange} className="form-control" required>
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
                          <select name="constructionType" value={planEnquiryData.constructionType} onChange={handlePlanEnquiryChange} className="form-control" required>
                            <option value="">Select</option>
                            <option value="Labour">Labour</option>
                            <option value="With Material">With Material</option>
                          </select>
                        </div>
                        <div className="col-md-12 mb-3">
                          <label>Requirements (Describe) *</label>
                          <textarea name="requirements" value={planEnquiryData.requirements} onChange={handlePlanEnquiryChange} className="form-control" rows="4" required />
                        </div>
                      </>
                    )}
                    <div className="col-md-6 mb-3">
                      <label>Completion Time *</label>
                      <input type="text" name="completionTime" value={planEnquiryData.completionTime} onChange={handlePlanEnquiryChange} className="form-control" placeholder="e.g., 6 months" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Interior/Furniture *</label>
                      <select name="interiorFurniture" value={planEnquiryData.interiorFurniture} onChange={handlePlanEnquiryChange} className="form-control" required>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-right m-t20">
                    <button type="button" className="site-button-secondry btn-half m-r10" onClick={closePlanEnquiryModal}>Cancel</button>
                    <button type="submit" className="site-button btn-half" disabled={planEnquirySubmitting}>
                      {planEnquirySubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Simple Enquiry Modal */}
      {showSimpleEnquiryModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={closeSimpleEnquiryModal}
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
                onClick={closeSimpleEnquiryModal}
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
            {simpleEnquirySuccess ? (
              <div className="text-center p-t30 p-b30">
                <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }} />
                <h4 className="m-t20">Enquiry Submitted Successfully!</h4>
                <p className="m-t10">{simpleEnquirySuccessMessage || 'We have received your enquiry and will get back to you soon.'}</p>
              </div>
            ) : (
              <>
                <h4 className="m-b10">View {selectedPlan.name || 'Plan Details'}</h4>
                <p className="text-muted m-b20">
                  Please share your details and we will send the complete plan with specifications.
                </p>
                <form onSubmit={handleSimpleEnquirySubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={simpleEnquiryData.name}
                      onChange={handleSimpleEnquiryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={simpleEnquiryData.phone}
                      onChange={handleSimpleEnquiryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={simpleEnquiryData.email}
                      onChange={handleSimpleEnquiryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={simpleEnquiryData.city}
                      onChange={handleSimpleEnquiryChange}
                      required
                    />
                  </div>
                  <button type="submit" className="site-button btn-block" disabled={simpleEnquirySubmitting}>
                    <span>{simpleEnquirySubmitting ? 'Submitting...' : 'Submit & View Plan'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plan Viewer Modal */}
      {showPlanViewer && planToViewUrl && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPlanViewer(false)}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: '10px', width: 'min(95vw, 1200px)', height: 'min(90vh, 800px)', position: 'relative', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPlanViewer(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}>✖</button>
            <h3 className="m-b20">{selectedPlan?.name || 'Construction Plan'}</h3>
            <div style={{ height: 'calc(100% - 80px)', overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
              {planToViewUrl && planToViewUrl.endsWith('.pdf') ? (
                <iframe src={planToViewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Plan PDF" />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <img src={planToViewUrl} alt={selectedPlan?.name || 'Plan'} style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
              )}
            </div>
            <p className="m-t10 text-center text-muted" style={{ fontSize: '12px' }}>Note: Plans can only be viewed online. Download option is not available.</p>
          </div>
        </div>
      )}

     

    </>
  );
};

export default TurnkeyConstructionPlans;


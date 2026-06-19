import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import Header2 from './../Common/Header2';
import Footer from './../Common/Footer';
import SEO from './../Common/SEO';
import Banner from './../Elements/Banner';
import ReactPlayer from 'react-player';
import { useLocation } from "react-router-dom";
import { withRouter } from '../with';
import Projects1 from './../Elements/Projects1';
import Projects2 from '../Elements/Projects2';
import Projects3 from '../Elements/Projects3';
import Projects4 from '../Elements/Projects4';
import ShowcaseGrid5 from '../Elements/Showcase';
import Services7 from '../Elements/Services7';
import ConsultationModal from './../Elements/ConsultationModal';
import Footer2 from '../Common/Footer2';
import CWUS from '../Elements/CwUS';

const filters = [
  { 
    label: "Architectural", 
    filter: ".cat-1", 
    subCategories: [
      "Sample Layout Plans", 
      "Elevations"
    ] 
  },
  { 
    label: "Interior", 
    filter: ".cat-2", 
    subCategories: [
      "Bedroom", 
      "Washroom"
    ] 
  },
  { 
    label: "Turnkey Construction", 
    filter: ".cat-4", 
    subCategories: [] // koi sub-category nahi hai
  }
];

var bnrimg = require('./../../images/banner/4.jpg');
var bgimg1 = require('./../../images/background/cross-line2.png');
var bgimg2 = require('./../../images/background/cross-line2.png');



function ServiceDetail(props) {
      const [label_id, setLabelId] = useState(5);
    const [data, setData] = useState({});
    const [apiData, setApiData] = useState([]);
    const [apiData2, setApiData2] = useState([]);
      const [apiData3, setApiData3] = useState([]);
    const [loading, setLoading] = useState(true);
     const [flag, setFlag] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
     const [showGalleryModal, setShowGalleryModal] = useState(false);
          const [galleryPhotos, setGalleryPhotos] = useState([]);
          const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
          const [currentPagePhotoIndex, setCurrentPagePhotoIndex] = useState(0);
          const [currentSubCategoryName, setCurrentSubCategoryName] = useState('');
          const [currentMainCategoryName, setCurrentMainCategoryName] = useState('');
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        service: [],
        city: "",
        message: "",
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showCustomLayoutForm, setShowCustomLayoutForm] = useState(false);
    const [customLayoutData, setCustomLayoutData] = useState({
        name: "",
        phone: "",
        email: "",
        city: "",
        plotSize: "",
        requirements: "",
        comments: ""
    });
    const [customLayoutSubmitting, setCustomLayoutSubmitting] = useState(false);
    const [customLayoutSuccess, setCustomLayoutSuccess] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsAuthenticated(!!localStorage.getItem('infrioAuth'));
        }
    }, []);

    // Load external scripts
    useEffect(() => {
        function loadScript(src) {
            return new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                script.src = src;
                script.addEventListener('load', function () {
                    resolve();
                });
                script.addEventListener('error', function (e) {
                    reject(e);
                });
                document.body.appendChild(script);
                document.body.removeChild(script);
            });
        }

        loadScript('./assets/js/custom.js');
    }, []);

    // Initial API call
    useEffect(() => {
       
       
        const requestOptions = {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: 5 }),
        };
        console.log("API data data:", requestOptions);

        fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log("API Result:p;p;p", result.data);
                
                setApiData(result.data.subCategories);
                setLoading(false);
            })
            .catch((error) => {
                console.error("API Error: details", error);
                setError(error);
                setLoading(false);
            });
             const requestOptions2 = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 5 }),
    };

    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", requestOptions2)
      .then((response) => response.json())
      .then((result) => {
        console.log("l,la,la,la,al",result.data.allSubCategories)
         setData(result.data);
         setApiData2(result.data.allSubCategories); 
         setLoading(false); 
         setFlag(true);
         setCurrentSubCategoryName('');
         ; })
      .catch((err) => { setError(err); setLoading(false); });
    }, []);
 
    

    const handleAllClick = () => {
        console.log("All button clicked - TESTING");
        // alert("All button clicked!");
        setLabelId(5);
        
        const formdata = new FormData();
        formdata.append("id", 5);

        fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
            method: "POST",
            body: formdata,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("All click response:", data);
                if (data.data.allSubCategories && data.data.allSubCategories.length == 0) {
                    if (data.data.photos && data.data.photos.length > 0) {
                        setApiData3(data.data.photos);
                        setFlag(false);
                        setCurrentSubCategoryName(data.data.category_name || '');
                    } else {
                        setApiData3([]);
                        setFlag(false);
                        setCurrentSubCategoryName('');
                    }
                } else {
                    setData(data.data);
                    setApiData2(data.data.allSubCategories);
                    setLoading(false);
                    setFlag(true);
                    setCurrentSubCategoryName('');
                }
            })
            .catch((error) => console.error("All click error:", error));
    }

    // Form handling functions
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleServiceCheckbox = useCallback((e) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            let services = [...prev.service];
            if (checked) {
                if (!services.includes(value)) {
                    services.push(value);
                }
            } else {
                services = services.filter((s) => s !== value);
            }
            return { ...prev, service: services };
        });
    }, []);

    const toggleModal = useCallback(() => {
        setShowModal(!showModal);
    }, [showModal]);

    const resetForm = useCallback(() => {
        setFormData({ name: "", phone: "", email: "", service: [], city: "", message: "" });
    }, []);


    const openCustomLayoutForm = () => {
        setShowCustomLayoutForm(true);
    };

    const closeCustomLayoutForm = () => {
        setShowCustomLayoutForm(false);
        setCustomLayoutData({
            name: "",
            phone: "",
            email: "",
            city: "",
            plotSize: "",
            requirements: "",
            comments: ""
        });
        setCustomLayoutSubmitting(false);
        setCustomLayoutSuccess(false);
    };

    const handleCustomLayoutChange = (e) => {
        const { name, value } = e.target;
        setCustomLayoutData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCustomLayoutSubmit = (e) => {
        e.preventDefault();
        setCustomLayoutSubmitting(true);
        setTimeout(() => {
            setCustomLayoutSubmitting(false);
            setCustomLayoutSuccess(true);
            setTimeout(() => {
                closeCustomLayoutForm();
            }, 1200);
        }, 1200);
    };

    // Isotope reflow effect
   useEffect(() => {
       if (typeof window !== 'undefined' && window.jQuery) {
         const $ = window.jQuery;
         const $container = $('.masonry-outer');
         try {
           const isMobile = window.innerWidth <= 991;
           if ($container.length && typeof $container.isotope === 'function') {
             $container.isotope('destroy');
             if (!isMobile) {
               $container.isotope({ itemSelector: '.masonry-item', transitionDuration: '0.4s', originLeft: true });
               $container.imagesLoaded(function () {
                 $container.isotope('layout');
               });
             }
           }
           if (typeof $.fn.magnificPopup === 'function') {
             $('.mfp-gallery').magnificPopup({ delegate: '.mfp-link', type: 'image', gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] } });
           }
         } catch (e) {
           // no-op
         }
       }
     }, [apiData2, apiData3, flag]);

    const handleClick2 = (id) => {
          setLabelId(id);
        console.log("[[[[[aaaaa",id)
    const formdata = new FormData();
    formdata.append("id", id);
     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Service API Response:", data);
                if (data.data.allSubCategories && data.data.allSubCategories.length == 0) {
                    if (data.data.photos && data.data.photos.length > 0) {
                        setApiData3(data.data.photos);
                        setFlag(false);
                        setCurrentSubCategoryName(data.data.category_name || '');
                        const mainCategory = apiData.find(item => item.id === id);
                        if (mainCategory) {
                            setCurrentMainCategoryName(mainCategory.name);
                        }
                    } else {
                        setApiData2([{
                            id: data.data.id,
                            name: data.data.category_name,
                            thumbnail_img: data.data.thumbnail_img,
                            photos: data.data.photos
                        }]);
                        setFlag(true);
                        setCurrentSubCategoryName('');
                    }
                } else {
                    setApiData2(data.data.allSubCategories);
                    setLoading(false);
                    setFlag(true);
                    setCurrentSubCategoryName('');
                    const mainCategory = apiData.find(item => item.id === id);
                    if (mainCategory) {
                        setCurrentMainCategoryName(mainCategory.name);
                    }
                }
      })
      .catch((error) => console.error("Service API Error:", error));
  };

     const renderSubCategories = (subCategories, parentId) => {
        return (
          <ul className="submenu">
            {subCategories.map((sub, i) => {
              const hasChildren = sub.subCategories.length > 0;
    
              return (
                <li key={i} className={hasChildren ? "has-submenu" : ""}>
                  <NavLink to={"#"} onClick={(e) => {
                    e.preventDefault();
                    handleClick2(sub.id);
                  }} data-filter={parentId || sub.id}>
                    {sub.name}{" "}
                    {hasChildren && <span className="arrow">›</span>}
                  </NavLink>
    
                  {hasChildren &&
                    renderSubCategories(sub.subCategories, sub.id)}
                </li>
              );
            })}
          </ul>
        );
      };
    console.log("Rendering ServiceDetail");
    console.log("apiData:", apiData);
    console.log("apiData2:", apiData2);
    console.log("handleAllClick function:", typeof handleAllClick);

  const openGalleryModal = (item) => {
    const photosArray = Array.isArray(item?.photos) && item.photos.length > 0
      ? item.photos
      : (item?.thumbnail_img ? [item.thumbnail_img] : []);
    setGalleryPhotos(photosArray);
    setCurrentPhotoIndex(0);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setGalleryPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const goPrevPhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPhotoIndex((idx) => (idx - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const goNextPhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPhotoIndex((idx) => (idx + 1) % galleryPhotos.length);
  };

  const goPrevPagePhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPagePhotoIndex((idx) => (idx - 1 + apiData3.length) % apiData3.length);
  };

  const goNextPagePhoto = (e) => {
    e?.stopPropagation?.();
    setCurrentPagePhotoIndex((idx) => (idx + 1) % apiData3.length);
  };

  // Reset page photo index when apiData3 changes
  useEffect(() => {
    if (apiData3.length > 0) {
      setCurrentPagePhotoIndex(0);
    }
  }, [apiData3]);

  // Update main category name when label_id or apiData changes
  useEffect(() => {
    if (apiData.length > 0 && label_id) {
      const mainCategory = apiData.find(item => item.id === label_id);
      if (mainCategory) {
        setCurrentMainCategoryName(mainCategory.name);
      }
    }
  }, [label_id, apiData]);
        return (
            <>
                <SEO
                  titleExact
                  title="Property Listing Services - Infrio Properties"
                  description="Explore Infrio Properties services for real estate sellers, including listing management, buyer enquiries, lead tracking and property marketplace visibility."
                  keywords="property listing services, real estate seller services, property enquiry management, seller dashboard, property marketplace services"
                  canonicalPath="/architecture-design"
                />
                <Header2 />
                <div className="page-content">
                <Banner title={"Architecture Design & Planning"} pagename="Service Detail" description="Our Love for Architecture
We are A Passionate Team Dedicated To Creating Stunning Architecture." bgimage={bnrimg}/>
                    {/* SECTION CONTENT START */}
                    
                    <div className="section-full p-t80 mobile-page-padding">
                        <div className="container">
                           

                            <div className="row">
                                                <div className="col-lg-6 col-md-12">
                                                    <div className="sx-media">
                                                        <img 
                                                            src={require('./../../images//services/service-projects/1.jpg')} 
                                                            alt="" 
                                                            style={{
                                                                width: "100%", 
                                                                height: "clamp(300px, 50vw, 500px)", 
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                        </div>
                                        </div>
                                                <div className="col-lg-6 col-md-12" >
                                                    <div className="sx-post-title" style={{ paddingLeft: 'clamp(0px, 2vw, 30px)' }}>
                                                        <h3 className="sx-tilte" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 'clamp(15px, 2vw, 25px)' }}>
                                                            {"Architecture Design & Planning"}
                                                        </h3>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', marginBottom: '15px',textAlign:"justify" }}>
                                                            At Infrio, we believe great design is the foundation of every successful project. Our architecture planning service goes beyond just drawings — it's about creating spaces that are functional, aesthetic, and future-ready.
                                                        </p>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333',textAlign:"justify" }}>
                                                            We start by understanding your requirements, lifestyle, and vision for the space. Every plan is carefully crafted to balance structural integrity, practical usability, and creative design. From the first sketch to the final approved layout, we ensure every detail aligns with your needs and budget.
                                                        </p>
                                        </div>
                                        </div>
                                    </div>
                
                            <div className="row">
                                <div className="col-lg-10 col-md-12">
                                    <div className="section-content">
                                        <div className="service-single-block m-b30">
                                            
                                            <h4 className="m-t30 sx-tilte" style={{ fontSize: '1rem', color: '#333' }}>Our architecture planning includes:</h4>
                                            <div className="single-service-list">
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                           
                                                            <li>3D Elevations – bringing your design to life visually</li>
                                                            <li>Working Drawings – precise details for on-site execution</li>
                                                             <li>Conceptual & Floor Plans – optimizing space with smart layouts</li>
                                                            <li>Structural & Services Layouts – ensuring safety, efficiency, and compliance</li>
                                                            {/* <li> Renovations Benefit of Service</li> */}
                                                        </ul>
                                                    </div>
                                                    <div className="col-lg-6 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                            <li>{"Plumbing & Electrical Layouts \n  "}</li>
                                                            <li>On-Site Supervision & Quality Checks</li>
                                                            <li>Technical Guidance & Problem Solving</li>
                                                            {/* <li><NavLink > Historic Renovations and Restorations.</NavLink></li> */}
                                                            {/* <li><NavLink >Project on time and Latest Design</NavLink></li> */}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <p>From structural designs to on-site execution, our team monitors every detail with precision. We work closely with contractors, engineers, and clients to avoid errors, maintain timelines, and deliver results that last.</p>
                                            </div>
                                       
                                    </div>
                                </div>
                              
                            </div>
                            
                            {/* Banner Image */}
                            <div className="banner-section m-t30 m-b30" onClick={toggleModal} style={{ cursor: 'pointer', padding: '0 clamp(10px, 2vw, 0px)' }}>
                                <img 
                                    src={require('./../../images/main-slider/slider2/Banner_1.jpg')} 
                                    alt="Banner" 
                                    style={{
                                        width: "100%", 
                                        height: "clamp(200px, 40vw, 400px)", 
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        display: 'block'
                                    }}
                                />
                            </div>
                            
                            <div className="row">
                                <div className="col-lg-10 col-md-12">
                                    <div className="section-content">
                                        <div className="service-single-block m-b30">
                                              <div className="section-head">
                                                                                     <div className="sx-separator-outer separator-left">
                                                                                                                                                 <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                                                                                                                                                     
                                                                                                                                                     <h3 onClick={toggleModal} className="sep-line-one">Consult With Us</h3>
                                                                                                                                                 </div>
                                                                                                                                             </div>
                                                                                                                                             </div>
                                                                                 <div className="col-lg-10 col-md-12">
                                                                                                 <ul className="anchor-line">
                                                                                                    
                                                                                                     <li>If you are interested in any of our services, Leave your enquiry or Contact Us.</li>
                                                                                                     <li>We will discuss the requirement and start working on your plan. This is going to be your first landscape view in 2D.</li>
                                                                                                      <li>There will be an advance amount applicable for any work to start. No Money No Honey Bro!!!</li>
                                                                                                     <li>The fee may vary as per plot sizes.</li>
                                                                                                     <li>Once the layout plan is finalized and approved by you, We can further discuss the detailed drawings.</li>
                                                                                                     <li>The detailed drawings include Footing, Column, Plinth, Working with Doors & Windows, Stairs, Electrical, Plumbing, Slab, Elevation 2D working along with 3D and many more as per requirements.</li>
                                                                                                     <li>You can also Check our <NavLink to={"/turnkey-construction"} state={{ id: 8}}>Turnkey Construction Packages</NavLink> for complete peace of mind</li>
                                                                                                 </ul>
                                                                                             </div>
                                                </div>
                                       
                                    </div>
                                </div>
                              
                            </div>
                            {/* GALLERY CONTENT END */}
                        </div>
                    </div>
                    <CWUS />
                     {/* Architecture Layout Library Section */}
                            <div className="section-full">
                                <div className="container p-0">
                                    <div className="section-head">
                                        <div className="sx-separator-outer separator-left">
                                            <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                                                <h3 className="sep-line-one">Architecture Layout Library</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12 text-center p-a40">
                                            <p className="m-b30" style={{ fontSize: '1.1rem', color: '#666' }}>
                                                Explore our comprehensive collection of architectural layout designs. Browse through various plot sizes, configurations, and structures.
                                            </p>
                                            <NavLink to="/architecture-layout-library" className="site-button btn-half">
                                                <span>View All Layouts</span>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
 <div className="section-full p-b80 column-grid-4 inner-page-padding">
                        <div className="container">
                            {/* Filter Nav START */}
                            <div className="filter-wrap p-b30 text-center">
                              
                                <ul className="filter-navigation masonry-filter clearfix">
                                    {/* <li className="active"><NavLink to={"#"} onClick={(e) => {
                                                              e.preventDefault();
                                                              handleAllClick();
                                                            }} className="btn from-top" data-filter={5} >All</NavLink></li> */}
                                                               <button className="btn from-top" onClick={(e) => {
                                                              e.preventDefault();
                                                              handleAllClick();
                                                            }}style={{color: label_id == 5 ? "#0f172a" : ""}}>
                                    All
                                </button>
                                      {apiData.map((item, index) => {
                                                        const hasChildren = item.subCategories.length > 0;
                                      
                                                        return (
                                                          <li key={index} className={hasChildren ? "has-submenu" : ""}>
                                                            <NavLink to={"#"} onClick={(e) => {
                                                              e.preventDefault();
                                                              handleClick2(item.id);
                                                            }} className="btn from-top" data-filter={item.id} style={{ color: item.id == label_id ? "#0f172a" : "" }}>
                                                              {item.name}{" "}
                                      
                                          </NavLink>
                                      
                                                            {hasChildren &&
                                                              renderSubCategories(item.subCategories, item.id)}
                                        </li>
                                                        );
                                                      })}
                                </ul>
                            </div>
                            {/* Filter Nav END */}
                            {/* GALLERY CONTENT START */}
                                {flag === true ? (
                <div className="masonry-outer mfp-gallery row work-grid clearfix list-unstyled grid-4">
                                {apiData2.map((item, index) => (
               
    <div key={index} className="masonry-item col-lg-4 col-md-6 col-sm-12 m-b30">
                  <div className="sx-box bg-white border-radius-10 shadow-sm" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="sx-thum-bx" style={{ width: "100%", height: "250px", overflow: "hidden" }}>
          <img 
            src={item.thumbnail_img || (item.photos && item.photos[0])} 
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div className="p-a20" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 className="sx-tilte m-b15" style={{ color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>{item.name}</h4>
          <button 
            className="site-button btn-block" 
            onClick={() => openGalleryModal(item)}
            style={{ marginTop: 'auto' }}
          >
            <span>Click to Preview</span>
          </button>
        </div>
      </div>
    </div>
                            ))}
               </div>
             ) : (
                 <div style={{
                   background: '#fff',
                   borderRadius: 10,
                   width: '100%',
                   height: 'auto',
                   display: 'flex',
                   flexDirection: 'column',
                   overflow: 'visible',
                   position: 'relative',
                   padding: 'clamp(12px, 2.5vw, 20px)',
                   marginBottom: 'clamp(15px, 3vw, 30px)',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                 }}>
                   {/* Category/Subcategory Name */}
                   {(() => {
                     const mainCategoryName = currentMainCategoryName || apiData.find(item => item.id === label_id)?.name || data?.category_name || '';
                     const subCategoryName = currentSubCategoryName;
                     
                     if (mainCategoryName && subCategoryName) {
                       return (
                         <div className="m-b20" style={{ textAlign: 'center', padding: 'clamp(8px, 2vw, 16px) 0' }}>
                           <h6 className="sx-tilte" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', color: '#333', margin: 0, fontWeight: 500 }}>
                             {"Architecture Design & Planning"} → {subCategoryName}
                           </h6>
                         </div>
                       );
                     } else if (mainCategoryName) {
                       return (
                         <div className="m-b20" style={{ textAlign: 'center', padding: 'clamp(8px, 2vw, 16px) 0' }}>
                           <h6 className="sx-tilte" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', color: '#333', margin: 0, fontWeight: 500 }}>
                             {mainCategoryName}
                           </h6>
                         </div>
                       );
                     }
                     return null;
                   })()}
                   {/* Main image */}
                   {apiData3.length > 0 && (
                     <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 'clamp(300px, 50vh, 500px)', maxHeight: 'clamp(300px, 50vh, 500px)', background: '#f5f5f5', borderRadius: 8, marginBottom: 'clamp(8px, 2vw, 14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                       <img
                         src={apiData3[currentPagePhotoIndex]}
                         alt="gallery"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                       />
                       {/* Nav arrows */}
                       {apiData3.length > 1 && (
                         <>
                           <button
                             onClick={goPrevPagePhoto}
                             style={{
                               position: 'absolute',
                               top: '50%',
                               left: 'clamp(8px, 1.5vw, 12px)',
                               transform: 'translateY(-50%)',
                               background: '#333',
                               color: '#fff',
                               border: 'none',
                               padding: 'clamp(10px, 2vw, 14px)',
                               borderRadius: 4,
                               cursor: 'pointer',
                               fontSize: 'clamp(16px, 3vw, 20px)',
                               zIndex: 10,
                               width: 'clamp(36px, 7vw, 44px)',
                               height: 'clamp(36px, 7vw, 44px)',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                             }}
                           >
                             ‹
                           </button>
                           <button
                             onClick={goNextPagePhoto}
                             style={{
                               position: 'absolute',
                               top: '50%',
                               right: 'clamp(8px, 1.5vw, 12px)',
                               transform: 'translateY(-50%)',
                               background: '#333',
                               color: '#fff',
                               border: 'none',
                               padding: 'clamp(10px, 2vw, 14px)',
                               borderRadius: 4,
                               cursor: 'pointer',
                               fontSize: 'clamp(16px, 3vw, 20px)',
                               zIndex: 10,
                               width: 'clamp(36px, 7vw, 44px)',
                               height: 'clamp(36px, 7vw, 44px)',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                             }}
                           >
                             ›
                           </button>
                         </>
                       )}
                     </div>
                   )}

                   {/* Thumbnails row with side arrows */}
                   {apiData3.length > 1 && (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 1.5vw, 10px)', marginTop: 'clamp(8px, 2vw, 14px)' ,background:'transparent', flexShrink: 0 }}>
                  <button
                    onClick={goPrevPagePhoto}
                    aria-label="Previous"
                    style={{ background: '#333', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    ‹
                  </button>
                  <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 10px)', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '80vw', padding: '4px 2px' }}>
                    {apiData3.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPagePhotoIndex(i)}
                        style={{
                          border: i === currentPagePhotoIndex ? '2px solid #0f172a' : '1px solid #333',
                          padding: 0, background: 'transparent', cursor: 'pointer', borderRadius: 6, flex: '0 0 auto'
                        }}
                        aria-label={`Photo ${i + 1}`}
                      >
                        <img src={p} alt="thumb" style={{ width: 'clamp(48px, 9vw, 72px)', height: 'clamp(48px, 9vw, 72px)', objectFit: 'cover', display: 'block', borderRadius: 6 }} />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={goNextPagePhoto}
                    aria-label="Next"
                    style={{ background: '#333', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}
                  >
                    ›
                  </button>
                </div>
                   )}
                 </div>
             )}
                            {/* GALLERY CONTENT END */}
                            <div className="text-center load-more-btn-outer" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                                <button 
                                    className="site-button btn-half" 
                                    onClick={toggleModal}
                                >
                                    <span>Get a Free Consultation</span>
                                </button>
                            </div>
                            </div>
                        </div>
                                    {/* SECTION CONTENT END  */}
                </div>
                <div className="modal fade" id="myModal6" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <ReactPlayer url='https://www.youtube.com/watch?v=Oy2QIiSQT2U' />
                        </div>
                    </div>
                </div>

                <Footer2 />
                
                {/* Consultation Modal */}
                <ConsultationModal 
                    show={showModal} 
                    toggleModal={toggleModal}
                    formData={formData}
                    handleChange={handleChange}
                    handleServiceCheckbox={handleServiceCheckbox}
                    onResetForm={resetForm}
                />
                {showCustomLayoutForm && (
                    <div
                        className="modal-overlay"
                        onClick={closeCustomLayoutForm}
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
                                width: 'min(95vw, 560px)',
                                padding: 'clamp(16px, 3vw, 32px)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={closeCustomLayoutForm}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    border: 'none', background: 'transparent',
                                    fontSize: '20px', cursor: 'pointer'
                                }}
                            >
                                ✖
                            </button>
                            {customLayoutSuccess ? (
                                <div className="text-center p-t30 p-b30">
                                    <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }} />
                                    <h4 className="m-t20">Request received!</h4>
                                    <p>Our team will get in touch with a custom proposal shortly.</p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="m-b10">Request a Custom Layout Plan</h4>
                                    <p className="text-muted m-b20">
                                        Share your plot details and layout requirements to receive tailored concepts.
                                    </p>
                                    <form onSubmit={handleCustomLayoutSubmit}>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={customLayoutData.name}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                className="form-control"
                                                value={customLayoutData.phone}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={customLayoutData.email}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                className="form-control"
                                                value={customLayoutData.city}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Plot Size</label>
                                            <input
                                                type="text"
                                                name="plotSize"
                                                className="form-control"
                                                placeholder="e.g., 30x40"
                                                value={customLayoutData.plotSize}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Layout Requirements</label>
                                            <textarea
                                                name="requirements"
                                                className="form-control"
                                                rows="4"
                                                placeholder="Number of rooms, floors, design preferences..."
                                                value={customLayoutData.requirements}
                                                onChange={handleCustomLayoutChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Additional Comments / Notes</label>
                                            <textarea
                                                name="comments"
                                                className="form-control"
                                                rows="3"
                                                placeholder="Any special instructions or references"
                                                value={customLayoutData.comments}
                                                onChange={handleCustomLayoutChange}
                                            />
                                        </div>
                                        <button type="submit" className="site-button btn-block" disabled={customLayoutSubmitting}>
                                            <span>{customLayoutSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
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
              {/* Close */}
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

              {/* Main image */}
              {galleryPhotos.length > 0 && (
                <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, background:'transparent', borderRadius: 8 }}>
                  <img
                    src={galleryPhotos[currentPhotoIndex]}
                    alt="gallery"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  {/* Nav arrows */}
                  {galleryPhotos.length > 1 && (
                    <>
                      <button onClick={goPrevPhoto} style={{ position: 'absolute', top: '50%', left: 'clamp(6px, 1.5vw, 12px)', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}>&lt;</button>
                      <button onClick={goNextPhoto} style={{ position: 'absolute', top: '50%', right: 'clamp(6px, 1.5vw, 12px)', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)', borderRadius: 6, cursor: 'pointer', fontSize: 'clamp(16px, 3vw, 20px)' }}>&gt;</button>
                    </>
                  )}
                </div>
              )}

              {/* Thumbnails row with side arrows (as per sketch) */}
              {galleryPhotos.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 1.5vw, 10px)', marginTop: 'clamp(8px, 2vw, 14px)' ,background:'transparent', flexShrink: 0 }}>
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

export default withRouter(ServiceDetail);






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


function ServiceDetailT(props) {
       const [label_id, setLabelId] = useState(8);
        const [data, setData] = useState({});
        const [apiData, setApiData] = useState([]);
        const [apiData2, setApiData2] = useState([]);
          const [apiData3, setApiData3] = useState([]);
        const [loading, setLoading] = useState(true);
         const [flag, setFlag] = useState(true);
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
            body: JSON.stringify({ id: 8 }),
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
      body: JSON.stringify({ id: 8 }),
    };

    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", requestOptions2)
      .then((response) => response.json())
      .then((result) => {
        console.log("l,la,la,la,al",result.data.allSubCategories)
         if (result.data.allSubCategories && result.data.allSubCategories.length == 0) {
                     setApiData2([{
    id: result.data.id,
    name: result.data.category_name,
    thumbnail_img: result.data.thumbnail_img,
    photos: result.data.photos
  }]);
  setApiData3(result.data.photos);
  setFlag(false);
  setCurrentSubCategoryName('');
                } else {
                    setApiData2(result.data.allSubCategories);
                    setLoading(false);
                    setFlag(true);
                    setCurrentSubCategoryName('');
                }
         ; })
      .catch((err) => { setError(err); setLoading(false); });
    }, []);
 
    

    const handleAllClick = () => {
        console.log("All button clicked - TESTING");
        // alert("All button clicked!");
        setLabelId(8);
        
        const formdata = new FormData();
        formdata.append("id", 8);

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
    

    // Isotope reflow effect
     useEffect(() => {
           if (typeof window !== 'undefined' && window.jQuery) {
             const $ = window.jQuery;
             const $container = $('.masonry-outer');
             try {
               if ($container.length && typeof $container.isotope === 'function') {
                 // Destroy existing isotope instance first
                 $container.isotope('destroy');
                 // Reinitialize with fresh data
                 $container.isotope({ itemSelector: '.masonry-item', transitionDuration: '0.4s', originLeft: true });
                 $container.imagesLoaded(function () {
                   $container.isotope('layout');
                 });
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
                    setData(data.data);
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
                  title="Property Seller Tools - Infrio Properties"
                  description="Use Infrio Properties seller tools to manage listings, buyer enquiries, follow-ups, staff access and property lead workflows from one dashboard."
                  keywords="property seller tools, seller dashboard, property lead management, buyer enquiries, real estate CRM, Infrio Properties"
                  canonicalPath="/turnkey-construction"
                />
                <Header2 />
                <div className="page-content">
                <Banner title={"Turnkey Construction Projects"} pagename="Service Detail" description="Our Love for Architecture We are A Passionate Team Dedicated To Creating Stunning Architecture." bgimage={bnrimg}/>
                    {/* SECTION CONTENT START */}
                    <div className="section-full p-t80 mobile-page-padding">
                        <div className="container">
                            {/* GALLERY CONTENT START */}
                            <div className="row">
                                                <div className="col-lg-6 col-md-12">
                                                    <div className="sx-media">
                                                        <img 
                                                            src={require('./../../images//services/service-projects/3.jpg')} 
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
                                                            {"Turnkey Construction Projects"}
                                                        </h3>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', marginBottom: '15px',textAlign:"justify"  }}>
                                                           When you want a hassle-free building experience, our turnkey construction service is the answer. At Infrio, we take complete ownership of your project — from the first design to the final handover.
                                                        </p>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', textAlign:"justify"  }}>
                                                            With our turnkey model, you don't have to juggle multiple contractors or vendors. We handle planning, design, material procurement, construction, interiors, and finishing, all under one roof. The result? A seamless process, timely delivery, and complete peace of mind.
                                                        </p>
                                                          <div className="text-center m-t40 m-b40">
                                                <button 
                                                    className="site-button btn-half"
                                                    onClick={toggleModal}
                                                    style={{
                                                        padding: '15px 40px',
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 15px rgba(215, 179, 154, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 6px 20px rgba(215, 179, 154, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 15px rgba(215, 179, 154, 0.3)';
                                                    }}
                                                >
                                                    <span>Get an Quote for With Material Construction</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        </div>
                                    </div>
                             
                            <div className="row">
                               
                                <div className="col-lg-10 col-md-12">
                                    <div className="section-content">
                                        <div className="service-single-block m-b30">
                                         
                                            <h4 className="m-t30 sx-tilte">Our turnkey solutions offer:</h4>
                                            <div className="single-service-list">
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                           
                                                            <li>End-to-End Project Management</li>
                                                            <li>Single Point of Contact for all requirements</li>
                                                             <li>Transparency in Costing & Timelines</li>
                                                            <li>Quality Assurance at Every Step</li>
                                                            <li>Timely Project Completion</li>
                                                        </ul>
                                                    </div>
                                                    {/* <div className="col-lg-6 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                            <li><NavLink >{"Plumbing & Electrical Layouts \n  "}</NavLink></li>
                                                            <li><NavLink >On-Site Supervision & Quality Checks</NavLink></li>
                                                            <li><NavLink >Technical Guidance & Problem Solving</NavLink></li>
                                                            <li><NavLink > Historic Renovations and Restorations.</NavLink></li>
                                                            <li><NavLink >Project on time and Latest Design</NavLink></li>
                                                        </ul>
                                                    </div> */}
                                                </div>
                                            </div>
                                            <p>We don't just build — we deliver ready-to-use spaces that reflect your vision with zero stress.</p>
                                            
                                            {/* CTA Button */}
                                          
                                             
                                                 <div className="section-head">
                                                                                        <div className="sx-separator-outer separator-left">
                                                                                                                                                    <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                                                                                                                                                        <h3 onClick={toggleModal} className="sep-line-one">Consult With Us</h3>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                          
                                            {/* <div className="sx-media sx-img-effect zoom-slow">
                                                <div className="sx-thum-bx sx-img-overlay1 sx-img-effect yt-thum-box">
                                                    <img src="https://img.youtube.com/vi/Oy2QIiSQT2U/0.jpg" alt=""/>
                                                    <NavLink to={"#"} className="play-now" data-toggle="modal" data-target="#myModal6">
                                                        <i className="icon fa fa-play" />
                                                        <span className="ripple" />
                                                    </NavLink>
                                                </div>
                                            </div> */}
                                        </div>
                                        {/* <div className="sx-accordion acc-bg-gray m-b30" id="accordion5">
                                            <div className="panel sx-panel">
                                                <div className="acod-head acc-actives">
                                                    <h6 className="acod-title">
                                                        <a data-toggle="collapse" href="#collapseOne5" data-parent="#accordion5">
                                                            Choose between rates or instant payment
                                                            <span className="indicator"><i className="fa" /></span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div id="collapseOne5" className="acod-body collapse show">
                                                    <div className="acod-content p-a15"><p> Motivate others and change the way we feel about ourselves. This is why I find them so interesting and crucial on our paths to success mauris accumsan eros eget libero posuere vulputate. Etiam elit elit, elementum sed varius at, adipiscing vitae est.
                                                        Sed nec felis pellentesque.</p></div>
                                                </div>
                                            </div>
                                            <div className="panel sx-panel">
                                                <div className="acod-head">
                                                    <h6 className="acod-title">
                                                        <a data-toggle="collapse" href="#collapseTwo5" className="collapsed" data-parent="#accordion5">
                                                            Come to see a live preview
                                                            <span className="indicator"><i className="fa" /></span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div id="collapseTwo5" className="acod-body collapse">
                                                    <div className="acod-content p-a15"><p>Inspirational quotes have an amazing ability to motivate others and change the way we feel about ourselves. This is why I find them so interesting and crucial on our paths to success.</p></div>
                                                </div>
                                            </div>
                                            <div className="panel sx-panel">
                                                <div className="acod-head">
                                                    <h6 className="acod-title">
                                                        <a data-toggle="collapse" href="#collapseThree5" className="collapsed" data-parent="#accordion5">
                                                            Choose the correct service
                                                            <span className="indicator"><i className="fa" /></span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div id="collapseThree5" className="acod-body collapse">
                                                    <div className="acod-content p-a15"><p>The leap into electronic typesetting, remaining essentially unchanged. It was popularised sheets containing Lorem Ipsum passagese.</p></div>
                                                </div>
                                            </div>
                                        </div> */}
                                        {/* <div className="row">
                                            <div className="col-md-6 m-b30">
                                                <div className="sx-icon-box-wraper p-a30  center bg-white shadow">
                                                    <div className="sx-icon-box-lg inline-icon text-primary  m-b20 radius bg-secondry  scale-in-center">
                                                        <span className="icon-cell sx-text-primary"><i className="flaticon-door" /></span>
                                                    </div>
                                                    <div className="icon-content">
                                                        <h4 className="sx-tilte">Decoration</h4>
                                                        <p>Lorem Ipsum is simply dummy text of the printing and setting as Planning.</p>
                                                        <NavLink to={"/services-1"} className="site-button-link">Read More</NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 m-b30">
                                                <div className="sx-icon-box-wraper p-a30  center bg-white shadow">
                                                    <div className="sx-icon-box-lg inline-icon text-primary  m-b20 radius bg-secondry  scale-in-center">
                                                        <span className="icon-cell sx-text-primary"><i className="flaticon-ruler-1" /></span>
                                                    </div>
                                                    <div className="icon-content">
                                                        <h4 className="sx-tilte">Solution</h4>
                                                        <p>Lorem Ipsum is simply dummy text of the printing and setting as Planning.</p>
                                                        <NavLink to={"/services-1"} className="site-button-link">Read More</NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

                                    </div>
                                </div>
                              
                            </div>
                            {/* GALLERY CONTENT END */}
                        </div>
                    </div>
                    <CWUS />
                    
                    {/* Turnkey Construction Plans Section */}
                    <div className="section-full bg-white">
                        <div className="container">
                            <div className="section-head m-t50">
                                <div className="sx-separator-outer separator-left">
                                    <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                                        <h3 className="sep-line-one">Available Construction Plans</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row m-t30">
                                <div className="col-lg-12 text-center p-a40">
                                    <p className="m-b30" style={{ fontSize: '1.1rem', color: '#666' }}>
                                        Explore our comprehensive collection of turnkey construction plans. Browse through various property types, plot sizes, and construction specifications.
                                    </p>
                                    <NavLink to="/turnkey-construction-plans" className="site-button btn-half">
                                        <span>View All Construction Plans</span>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    
 <div className="section-full p-b80 column-grid-4 inner-page-padding">
                        <div className="container">
                            {/* Filter Nav START */}
                            
                            {/* <div className="filter-wrap p-b30 text-center">
                               
                                <ul className="filter-navigation masonry-filter clearfix">
                                  
                                     {/* <li className="active"><NavLink to={"#"} onClick={(e) => {
                                                               e.preventDefault();
                                                               handleAllClick();
                                                             }} className="btn from-top" data-filter={5} >All</NavLink></li> 
                                                             {apiData.length == 0 ? "" :   <button className="btn from-top" onClick={(e) => {
                                                               e.preventDefault();
                                                               handleAllClick();
                                                             }}style={{color: label_id == 8 ? "#0f172a" : ""}}>
                                     All
                                 </button>}
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
                            </div> */}
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
                  
                         <div className="m-b20" style={{ textAlign: 'center', padding: 'clamp(8px, 2vw, 16px) 0' }}>
                           <h6 className="sx-tilte" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', color: '#333', margin: 0, fontWeight: 500 }}>
                             {"Turnkey Construction Projects Gallery"}
                           </h6>
                         </div>
                     
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
                     </div>                      {/* SECTION CONTENT END  */}
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
                          border: i === currentPhotoIndex ? '2px solid #ff6b00' : '1px solid #333',
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

export default withRouter(ServiceDetailT);

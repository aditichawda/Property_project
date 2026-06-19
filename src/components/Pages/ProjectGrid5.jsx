import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import Header2 from './../Common/Header2';
import Footer from './../Common/Footer';
import Banner from './../Elements/Banner';
import ConsultationModal from './../Elements/ConsultationModal';
import { ModalPrintLayout, triggerModalPrint } from './../Elements/ModalPrintLayout';
import Footer2 from '../Common/Footer2';
import SEO from './../Common/SEO';
const filters = [
  { 
    label: "Architectural", 
    filter: ".cat-1", 
    id:5,
    subCategories: [
      "Sample Layout Plans", 
      "Elevations"
    ] 
  },
  { 
    label: "Interior", 
    filter: ".cat-2", 
    id:6,
    subCategories: [
      "Bedroom", 
      "Washroom"
    ] 
  },
  { 
    label: "Turnkey Construction", 
    filter: ".cat-4", 
    id:8,
    subCategories: [] // koi sub-category nahi hai
  }
];

const projects = [
    {
        image: require('./../../images/projects/portrait/pic1.jpg'),
        title: 'Interior Work Avroko',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-1'
    },
    {
        image: require('./../../images/projects/portrait/pic2.jpg'),
        title: 'Vilters',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-2'
    },
    {
        image: require('./../../images/projects/portrait/pic3.jpg'),
        title: 'Industrial Design',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-3'
    },
    {
        image: require('./../../images/projects/portrait/pic4.jpg'),
        title: 'House Bluprint',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-4'
    },
    {
        image: require('./../../images/projects/portrait/pic5.jpg'),
        title: 'Modern Bathroom',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-5'
    },
    {
        image: require('./../../images/projects/portrait/pic6.jpg'),
        title: 'Bellevue Project',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-4'
    },
    {
        image: require('./../../images/projects/portrait/pic7.jpg'),
        title: 'Qatar Pavilion',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-3'
    },
    {
        image: require('./../../images/projects/portrait/pic8.jpg'),
        title: 'Museum',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-2'
    },
    {
        image: require('./../../images/projects/portrait/pic9.jpg'),
        title: 'Modern house',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-1'
    },
    {
        image: require('./../../images/projects/portrait/pic7.jpg'),
        title: 'Qatar Pavilion',
        address: 'Muscat, Sultanate of Oman',
        filter: 'cat-3'
    }
]

var bnrimg = require('./../../images/banner/7.jpg');
var bgimg1 = require('./../../images/background/cross-line.png');

function ProjectGrid5() {
    const [labelId, setLabelId] = useState(5);
    const [data, setData] = useState({});
    const [apiData, setApiData] = useState([]);
    const [apiData2, setApiData2] = useState([]);
    const [apiData3, setApiData3] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flag, setFlag] = useState(true);
    const [currentSubCategoryName, setCurrentSubCategoryName] = useState('');
    /** Top-level category name for breadcrumb; labelId can be a subcategory id, so we can't derive this from apiData.find(id === labelId) alone */
    const [currentMainCategoryName, setCurrentMainCategoryName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
      const [galleryPhotos, setGalleryPhotos] = useState([]);
      const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
      const [currentPagePhotoIndex, setCurrentPagePhotoIndex] = useState(0);
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

    // Initial API calls
    useEffect(() => {
     const requestOptions1 = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-get-subcategory-get", requestOptions1)
    .then((response) => response.json())
    .then((result) => {
      console.log("API 1 Result:", result.data);
                setApiData(result.data.reverse());
                setLoading(false);
    })
    .catch((error) => {
      console.error("API 1 Error:", error);
                setError(error);
                setLoading(false);
    });

  // Second API call (POST)
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
      console.log("API 2 Result:", result.data);
                const d = result?.data;
                if (!d) {
                  setLoading(false);
                  return;
                }
                setData(d);
                setApiData2(Array.isArray(d.allSubCategories) ? d.allSubCategories : []);
                setLoading(false);
                setFlag(true);
                setCurrentSubCategoryName('');
                if (d.category_name) setCurrentMainCategoryName(d.category_name);
    })
    .catch((error) => {
      console.error("API 2 Error:", error);
                setError(error);
                setLoading(false);
            });
    }, []);
 
    const handleClick = useCallback((id) => {
    console.log("Clicked category id:", id);
        setLabelId(id);

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
                    // If no subcategories, check if there are photos and show them directly on page
                    if (data.data.photos && data.data.photos.length > 0) {
                        setApiData3(data.data.photos);
                        setFlag(false);
                        setCurrentSubCategoryName(data.data.category_name || '');
                    } else {
                        // Fallback: show as single item if no direct photos
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
      .catch((error) => console.error("Service API Error:", error));
    }, []);

    const handleClick2 = useCallback((id) => {
        console.log("Clicked category id:", id);

    const formdata = new FormData();
    formdata.append("id", id);

    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Service API Response:", data.data.subCategories);
                if (data.data.subCategories && data.data.subCategories.length == 0) {
                    // If no subcategories, check if there are photos and show them directly on page
                    if (data.data.photos && data.data.photos.length > 0) {
                    setApiData3(data.data.photos);
                    setFlag(false);
                    setCurrentSubCategoryName(data.data.category_name || '');
                    } else {
                        // Fallback: show as single item if no direct photos
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
                    setApiData2(data.data.subCategories);
                    setFlag(true);
                    setCurrentSubCategoryName('');
                }
      })
      .catch((error) => console.error("Service API Error:", error));
    }, []);

    /** parentName = top-level (main) category name, passed through nested submenus */
    const renderSubCategories = useCallback((subCategories, parentId, parentName) => {
      if (!Array.isArray(subCategories) || subCategories.length === 0) return null;

      return (
        <ul className="submenu">
          {subCategories.map((sub, i) => {
            const hasChildren = Array.isArray(sub.subCategories) && sub.subCategories.length > 0;

            return (
              <li key={sub.id ?? i} className={hasChildren ? 'has-submenu' : ''}>
                <NavLink
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentMainCategoryName(parentName || '');
                    setCurrentSubCategoryName(sub.name || '');
                    handleClick(sub.id);
                  }}
                  data-filter={parentId || sub.id}
                >
                  {sub.name}{' '}
                  {hasChildren && <span className="arrow">›</span>}
                </NavLink>

                {hasChildren && renderSubCategories(sub.subCategories, sub.id, parentName)}
              </li>
            );
          })}
        </ul>
      );
    }, [handleClick]);

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

        return (
            <>
                <SEO
                  titleExact
                  title="Infrio Projects – Architecture and Interior Portfolio"
                  description="Explore Infrio India's portfolio: stunning residential, commercial and bespoke design projects. See how innovation, sustainability and thoughtful planning come together to transform spaces with aesthetics and function."
                  keywords="Infrio project showcase, architecture portfolio India, interior design examples, completed design projects, residential portfolio Indore, commercial spaces design, sustainable architecture case studies"
                  canonicalPath="/project-grid-5-columns"
                />
                <Header2 />
                <div className="page-content">
                    <Banner title="Showcase" pagename="Showcase" description="Our Love for Architecture
We are A Passionate Team Dedicated To Creating Stunning Architecture." bgimage={bnrimg}/>
                    
                    {/* SECTION CONTENT START */}
                    <div className="section-full p-tb80 column-grid-4 inner-page-padding">
                        <div className="container">
                            {/* Filter Nav START */}
                            <div className="filter-wrap p-b30 text-center">
                                <ul className="filter-navigation masonry-filter clearfix">
                                    {/* <li className="active"><NavLink to={"#"} className="btn from-top" data-filter="*" data-hover="All">All</NavLink></li> */}
                                    {apiData.map((item, index) => {
                                              const hasChildren = Array.isArray(item.subCategories) && item.subCategories.length > 0;
                                  
                                              return (
                                                <li key={index} className={hasChildren ? "has-submenu" : ""}>
                                                  <NavLink to={"#"} onClick={(e) => {e.preventDefault();
                                                    setCurrentMainCategoryName(item.name || '');
                                                    setCurrentSubCategoryName('');
                                                    handleClick(item.id);}} className={item.id == labelId ? "active" :"btn from-top"} data-filter={item.id} style={{color:item.id == labelId ? "#0f172a" :""}}>
                                                    {item.name}{" "}
                                                   
                                                  </NavLink>
                                  
                                                  {hasChildren &&
                                                    renderSubCategories(item.subCategories, item.id,item.name)}
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
                     const mainCategory = apiData.find((item) => item.id === labelId);
                     const mainCategoryName =
                       currentMainCategoryName ||
                       mainCategory?.name ||
                       data?.category_name ||
                       '';
                     const subCategoryName = currentSubCategoryName;
                     
                     if (mainCategoryName && subCategoryName) {
                       return (
                         <div className="m-b20" style={{ textAlign: 'center', padding: 'clamp(8px, 2vw, 16px) 0' }}>
                           <h6 className="sx-tilte" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', color: '#333', margin: 0, fontWeight: 500 }}>
                             {mainCategoryName} → {subCategoryName}
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
                     <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 'clamp(400px, 60vh, 700px)', background: '#f5f5f5', borderRadius: 8, marginBottom: 'clamp(8px, 2vw, 14px)' }}>
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
                               left: 'clamp(4px, 1vw, 8px)',
                               transform: 'translateY(-50%)',
                               background: 'rgba(0,0,0,0.5)',
                               color: '#fff',
                               border: 'none',
                               padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 14px)',
                               borderRadius: 6,
                               cursor: 'pointer',
                               fontSize: 'clamp(14px, 3vw, 18px)',
                               zIndex: 10
                             }}
                           >
                             &lt;
                           </button>
                           <button
                             onClick={goNextPagePhoto}
                             style={{
                               position: 'absolute',
                               top: '50%',
                               right: 'clamp(4px, 1vw, 8px)',
                               transform: 'translateY(-50%)',
                               background: 'rgba(0,0,0,0.5)',
                               color: '#fff',
                               border: 'none',
                               padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 14px)',
                               borderRadius: 6,
                               cursor: 'pointer',
                               fontSize: 'clamp(14px, 3vw, 18px)',
                               zIndex: 10
                             }}
                           >
                             &gt;
                           </button>
                         </>
                       )}
                     </div>
                   )}

                   {/* Thumbnails row with side arrows */}
                   {apiData3.length > 1 && (
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: 'clamp(4px, 1.5vw, 8px)',
                       marginTop: 'clamp(4px, 1.5vw, 10px)',
                       background: 'transparent',
                       flexShrink: 0,
                       padding: '0 clamp(4px, 1vw, 8px)'
                     }}>
                       <button
                         onClick={goPrevPagePhoto}
                         aria-label="Previous"
                         style={{
                           background: 'rgba(0,0,0,0.1)',
                           color: '#333',
                           border: '1px solid #ddd',
                           padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)',
                           borderRadius: 6,
                           cursor: 'pointer',
                           fontSize: 'clamp(14px, 3vw, 18px)',
                           flexShrink: 0
                         }}
                       >
                         ‹
                       </button>
                       <div style={{
                         display: 'flex',
                         gap: 'clamp(6px, 2vw, 12px)',
                         flexWrap: 'nowrap',
                         overflowX: 'auto',
                         maxWidth: 'calc(100% - 100px)',
                         padding: '4px 2px',
                         WebkitOverflowScrolling: 'touch',
                         scrollbarWidth: 'thin'
                       }}>
                         {apiData3.map((p, i) => (
                           <button
                             key={i}
                             onClick={() => setCurrentPagePhotoIndex(i)}
                             style={{
                               border: i === currentPagePhotoIndex ? '2px solid #0f172a' : '1px solid #ddd',
                               padding: 0,
                               background: 'transparent',
                               cursor: 'pointer',
                               borderRadius: 6,
                               flex: '0 0 auto',
                               transition: 'border-color 0.2s'
                             }}
                             aria-label={`Photo ${i + 1}`}
                           >
                             <img
                               src={p}
                               alt="thumb"
                               style={{
                                //  width: 'clamp(60px, 12vw, 100px)',
                                //  height: 'clamp(60px, 12vw, 100px)',
                                //  objectFit: 'cover',
                                //  display: 'block',
                                //  borderRadius: 5,
                                 width: 'clamp(48px, 9vw, 72px)', height: 'clamp(48px, 9vw, 72px)', objectFit: 'cover', display: 'block', borderRadius: 6
                               }}
                             />
                           </button>
                         ))}
                       </div>
                       <button
                         onClick={goNextPagePhoto}
                         aria-label="Next"
                         style={{
                           background: 'rgba(0,0,0,0.1)',
                           color: '#333',
                           border: '1px solid #ddd',
                           padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 12px)',
                           borderRadius: 6,
                           cursor: 'pointer',
                           fontSize: 'clamp(14px, 3vw, 18px)',
                           flexShrink: 0
                         }}
                       >
                         ›
                       </button>
                     </div>
                   )}
               </div>
             )}
                            {/* <div style={{ }}>
                            <ul className="masonry-outer mfp-gallery row work-grid clearfix list-unstyled grid-5">
                               {flag === true ? apiData2.map((item, index) => (
                             
                                     <div key={index} className={`${item.id} masonry-item col-xl-3  col-lg-4 col-md-6 col-sm-12 m-b30`}>
      <div className="sx-box image-hover-block">
        <div className="sx-thum-bx">
          <img 
            src={item.thumbnail_img || (item.photos && item.photos[0])} 
            alt={item.name} style={{width:"100%", height:"100%",objectFit:"contain"}}
          />
        </div>
        <div className="sx-info p-t20 text-white">
          <h4 className="sx-tilte">{item.name}</h4>
        </div>

        
        <a 
          className="mfp-link" 
          href={item.photos && item.photos[0]} 
          rel={`gallery-${item.id}`}  // ✅ unique per category
        >
          <i className="fa fa-arrows-alt" />
        </a>

        
        {item.photos && item.photos.slice(1).map((photo, i) => (
          <a 
            key={i} 
            className="mfp-link d-none" 
            href={photo} 
            rel={`gallery-${item.id}`} // ✅ same rel per category
          />
        ))}
      </div>
    </div>
                                )) : apiData3.map((item, index) => (
                                    <div key={index} className={`${item} masonry-item col-xl-3  col-lg-4 col-md-6 col-sm-12 m-b30`}>
                                        <div className="sx-box image-hover-block">
                                            <div className="sx-thum-bx">
                                                <img src={item}  style={{width:"100%", height:"100%",objectFit:"contain"}} alt="" />
                                            </div>
                                            
                                            <a className="mfp-link" href={item}>
                                                <i className="fa fa-arrows-alt" />
                                            </a>
                                        </div>
                                    </div>
               
                                ))}
                             </ul>
                             </div> */}
                            {/* GALLERY CONTENT END */}
                            {/* Get a Free Consultation Button */}
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

export default ProjectGrid5;
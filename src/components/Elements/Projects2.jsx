import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ConsultationModal from './ConsultationModal';

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

const projects = [
  {
    image: require('./../../images/projects/portrait/pic1.jpg'),
    title: 'Interior Work Avroko',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-1'
  },
  {
    image: require('./../../images/projects/portrait/pic2.jpg'),
    title: 'Vilters',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-2'
  },
  {
    image: require('./../../images/projects/portrait/pic3.jpg'),
    title: 'Industrial Design',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-3'
  },
  {
    image: require('./../../images/projects/portrait/pic4.jpg'),
    title: 'House Bluprint',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-4'
  },
  {
    image: require('./../../images/projects/portrait/pic5.jpg'),
    title: 'Modern Bathroom',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-5'
  },
  {
    image: require('./../../images/projects/portrait/pic6.jpg'),
    title: 'Bellevue Project',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-4'
  },
  {
    image: require('./../../images/projects/portrait/pic7.jpg'),
    title: 'Qatar Pavilion',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-3'
  },
  {
    image: require('./../../images/projects/portrait/pic8.jpg'),
    title: 'Museum',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-2'
  },
  {
    image: require('./../../images/projects/portrait/pic9.jpg'),
    title: 'Modern house',
    address: 'Muscat, Sultanate of Oman',
    id: 'cat-1'
  },
    {
        image: require('./../../images/projects/portrait/pic1.jpg'),
        title: 'Interior Work Avroko',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-1'
    },
    {
        image: require('./../../images/projects/portrait/pic2.jpg'),
        title: 'Vilters',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-2'
    },
    {
        image: require('./../../images/projects/portrait/pic3.jpg'),
        title: 'Industrial Design',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-3'
    },
    {
        image: require('./../../images/projects/portrait/pic4.jpg'),
        title: 'House Bluprint',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-4'
    },
    {
        image: require('./../../images/projects/portrait/pic5.jpg'),
        title: 'Modern Bathroom',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-5'
    },
    {
        image: require('./../../images/projects/portrait/pic6.jpg'),
        title: 'Bellevue Project',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-4'
    },
    {
        image: require('./../../images/projects/portrait/pic7.jpg'),
        title: 'Qatar Pavilion',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-3'
    },
    {
        image: require('./../../images/projects/portrait/pic8.jpg'),
        title: 'Museum',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-2'
    },
    {
        image: require('./../../images/projects/portrait/pic9.jpg'),
        title: 'Modern house',
        address: 'Muscat, Sultanate of Oman',
        id: 'cat-1'
    }
]

var bgimg1 = require('./../../images/background/cross-line2.png');
var bgimg2 = require('./../../images/background/cross-line.png');

function Projects2() {
   
  const [label_id, setLabelId] = useState(5);
  const [data, setData] = useState({});
  const [apiData2, setApiData2] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [apiData3, setApiData3] = useState([]);
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

  const resetForm = useCallback(() => {
    setFormData({ name: "", phone: "", email: "", service: [], city: "", message: "" });
  }, []);

  const toggleModal = useCallback(() => setShowModal((s) => !s), []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleServiceCheckbox = useCallback((e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let services = [...prev.service];
      if (checked) {
        if (!services.includes(value)) services.push(value);
      } else {
        services = services.filter((s) => s !== value);
      }
      return { ...prev, service: services };
    });
  }, []);

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
            })
        };

        loadScript('./assets/js/custom.js');
  // First API call (GET)
  const requestOptions1 = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-get-subcategory-get", requestOptions1)
    .then((response) => response.json())
    .then((result) => {
         const list = Array.isArray(result?.data) ? result.data : [];
         setApiData([...list].reverse());
         setLoading(false);
    })
      .catch((err) => { setError(err); setLoading(false); });

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
      .catch((err) => { setError(err); setLoading(false); });
  }, []);

  const handleClick = (id) => {
    setLabelId(id);
    const formdata = new FormData();
    formdata.append("id", id);

    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.json())
      .then((res) => {
        const d = res?.data;
        if (!d) return;

        const subs = d.allSubCategories;
        if (Array.isArray(subs) && subs.length === 0) {
          // If no subcategories, check if there are photos and show them directly on page
          if (d.photos && d.photos.length > 0) {
            setApiData3(d.photos);
            setFlag(false);
            setCurrentSubCategoryName(d.category_name || '');
            // Main name is set by top-level / submenu click (label_id may be a subcategory id)
          } else {
            // Fallback: show as single item if no direct photos
            setApiData2([{
              id: d.id,
              name: d.category_name,
              thumbnail_img: d.thumbnail_img,
              photos: d.photos
            }]);
            setFlag(true);
            setCurrentSubCategoryName('');
          }
        } else {
          setData(d);
          setApiData2(Array.isArray(subs) ? subs : []);
          setLoading(false);
          setFlag(true);
          setCurrentSubCategoryName('');
        }
      })
      .catch((error) => console.error("Service API Error:", error));
  };

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
    const formdata = new FormData();
    formdata.append("id", id);
    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", { method: "POST", body: formdata })
      .then((res) => res.json())
      .then((res) => {
        const d = res?.data;
        if (!d) return;
        const subs = d.subCategories;
        if (Array.isArray(subs) && subs.length === 0) {
          // If no subcategories, check if there are photos and show them directly on page
          if (d.photos && d.photos.length > 0) {
            setApiData3(d.photos);
            setFlag(false);
            setCurrentSubCategoryName(d.category_name || '');
          } else {
            setApiData3([]);
            setFlag(false);
            setCurrentSubCategoryName('');
          }
        } else {
          setApiData2(Array.isArray(subs) ? subs : []);
          setFlag(true);
          setCurrentSubCategoryName('');
        }
      })
      .catch((error) => console.error("Service API Error:", error));
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

  /** parentName = top-level category name, passed through nested submenus */
  const renderSubCategories = (subCategories, parentId, parentName) => {
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
  };

        return (
            <div>
                <div className="section-full  mobile-page-padding bg-white  p-t30 p-b80">
                    <div className="container">
                        {/* TITLE START */}
                        <div className="section-head">
                            <div className="sx-separator-outer separator-center">
                                <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                                    <h3 className="sep-line-one"><NavLink to={"/project-grid-5-columns"}>Showcase</NavLink></h3>
                                </div>
                            </div>
                        </div>
                        {/* TITLE END */}
                        {/* Filter Nav START */}
      <div className="filter-wrap p-b30 text-center">
        <ul className="filter-navigation masonry-filter clearfix">
          {/* All Option */}
          {/* <li className="active">
            <NavLink to={"#"} className="btn from-top" data-filter="*">
              All
            </NavLink>
          </li> */}

          {/* Dynamic Categories */}
          {apiData.map((item, index) => {
            const hasChildren = Array.isArray(item.subCategories) && item.subCategories.length > 0;

            return (
              <li key={index} className={hasChildren ? "has-submenu" : ""}>
                      <NavLink to={"#"} onClick={(e) => {
                        e.preventDefault();
                        setCurrentMainCategoryName(item.name || '');
                        setCurrentSubCategoryName('');
                        handleClick(item.id);
                      }} className={item.id == label_id ? "active" :"btn from-top"} data-filter={item.id} style={{ color: item.id == label_id ? "#0f172a" : "" }}>
                  {item.name}{" "}
                 
                </NavLink>

                {hasChildren &&
                        renderSubCategories(item.subCategories, item.id, item.name)}
              </li>
            );
          })}
        </ul>
      </div>
                        {/* Filter Nav END */}
                        {/* GALLERY CONTENT START */}
                    
             {flag === true ? (
                <div className="masonry-outer work-grid row clearfix list-unstyled m-b0">
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
                     const mainCategoryName =
                       currentMainCategoryName ||
                       apiData.find((item) => item.id === label_id)?.name ||
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
                     <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 'clamp(400px, 60vh, 700px)', background: '#f5f5f5', borderRadius: 8, marginBottom: 'clamp(8px, 2vw, 14px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {/* //  <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, background:'transparent', borderRadius: 8 }}> */}

                       <img
                         src={apiData3[currentPagePhotoIndex]}
                         alt="gallery"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}

                        // style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
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
                      
            {/* Force layout clear to avoid overlap with next section */}
            <div style={{ clear: 'both' }} />
                        {/* GALLERY CONTENT END */}
                        <div className="text-center load-more-btn-outer" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
              <button className="site-button btn-half" onClick={() => setShowModal(true)}><span>Get a Free Consultation</span></button>
                        </div>
                    </div>
                </div>
           <ConsultationModal
          show={showModal}
          toggleModal={toggleModal}
          formData={formData}
          onResetForm={resetForm}
          handleChange={handleChange}
          handleServiceCheckbox={handleServiceCheckbox}
          handleSubmit={(e) => { e.preventDefault(); toggleModal(); }}
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

            </div>
        );
    }

export default Projects2;
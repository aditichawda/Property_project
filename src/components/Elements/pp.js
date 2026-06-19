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
         setApiData(result.data.reverse()); 
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
        console.log("l,la,la,la,al",result.data.allSubCategories)
         setData(result.data);
         setApiData2(result.data.allSubCategories); 
         setLoading(false); 
         setFlag(true)
         ; })
      .catch((err) => { setError(err); setLoading(false); });
  }, []);

  const handleClick = (id) => {
    setLabelId(id);
    const formdata = new FormData();
    formdata.append("id", id);
    console.log(",l,l,l,lxlxlxlx",id)

    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.json())
      .then((data) => {
        let finalArray = [];
        if (data.data.allSubCategories && data.data.allSubCategories.length == 0) {
          // setApiData3(data.data.photos); 
            setApiData2([{
    id: data.data.id,
    name: data.data.category_name,
    thumbnail_img: data.data.thumbnail_img,
    photos: data.data.photos
  }]);
  console.log("[][][][][][][][][]",apiData2)
    setFlag(true);
        } else {
          setData(data.data); setApiData2(data.data.allSubCategories); setLoading(false); setFlag(true);
    }
         })
      .catch((error) => console.error("Service API Error:", error));
  }

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
    const formdata = new FormData();
    formdata.append("id", id);
    fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", { method: "POST", body: formdata })
      .then((res) => res.json())
      .then((data) => {
        if (data.data.subCategories && data.data.subCategories.length == 0) { setApiData3(data.data.photos); setFlag(false); }
        else { setApiData2(data.data.subCategories); setFlag(true); }
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
  const renderSubCategories = (subCategories, parentId) => {
    return (
      <ul className="submenu">
        {subCategories.map((sub, i) => {
          const hasChildren = sub.subCategories.length > 0;

          return (
            <li key={i} className={hasChildren ? "has-submenu" : ""}>
              <NavLink to={"#"} onClick={(e) => {
                e.preventDefault();
                handleClick(sub.id);
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

        return (
            <div>
                <div className="section-full  mobile-page-padding bg-white  p-t30 p-b80">
                    <div className="container">
                        {/* TITLE START */}
                        <div className="section-head">
                            <div className="sx-separator-outer separator-center">
                                <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                                    <h3 className="sep-line-one">Showcase</h3>
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
            const hasChildren = item.subCategories.length > 0;

            return (
              <li key={index} className={hasChildren ? "has-submenu" : ""}>
                      <NavLink to={"#"} onClick={(e) => {
                        e.preventDefault();
                        handleClick(item.id);
                      }} className={item.id == label_id ? "active" :"btn from-top"} data-filter={item.id} style={{ color: item.id == label_id ? "#0f172a" : "" }}>
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
                <div className="masonry-outer work-grid row clearfix list-unstyled m-b0">
                            {apiData2.map((item, index) => (
               

    <div key={index} className="masonry-item col-lg-4 col-md-6 col-sm-12 m-b30">
                  <div className="sx-box image-hover-block" onClick={() => openGalleryModal(item)} style={{ cursor: 'pointer' }}>
                    <div className="sx-thum-bx" style={{ width: "100%" }}>
          <img 
            src={item.thumbnail_img || (item.photos && item.photos[0])} 
                        alt={item.name}
                        style={{ display: "block", objectFit: "cover" }}
          />
        </div>
        <div className="sx-info p-t20 text-white">
          <h4 className="sx-tilte">{item.name}</h4>
        </div>

                    {/* Click handled at card level to open modal */}
      </div>
    </div>
                            ))}
               </div>
             ) : (
                <div className="masonry-outer work-grid row clearfix list-unstyled m-b0">
                            {apiData3.map((item, index) => (
                                <div key={index} className={`masonry-item col-lg-4 col-md-6 col-sm-12 m-b30`}>
                      <div className="sx-box image-hover-block" onClick={() => openGalleryModal({ photos: [item] })} style={{ cursor: 'pointer' }}>
                       <div className="sx-thum-bx" style={{ width: '100%' }}>
                         <img src={item} alt='' style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                                        </div>
                       {/* Click handled at card level to open modal */}
                                    </div>
                                </div>
                            ))}
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
                style={{ position: 'absolute', top: 'clamp(6px, 1.5vw, 10px)', right: 'clamp(6px, 1.5vw, 10px)', background: 'transparent', color: '#fff', border: 'none', fontSize: 'clamp(18px, 3.5vw, 22px)', cursor: 'pointer', lineHeight: 1 }}
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
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import ConsultationModal from './ConsultationModal';

// const filters = [
//   {
//     label: "Architectural",
//     filter: ".cat-1",
//     subCategories: [
//       "Sample Layout Plans",
//       "Elevations"
//     ]
//   },
//   {
//     label: "Interior",
//     filter: ".cat-2",
//     subCategories: [
//       "Bedroom",
//       "Washroom"
//     ]
//   },
//   {
//     label: "Turnkey Construction",
//     filter: ".cat-4",
//     subCategories: [] // koi sub-category nahi hai
//   }
// ];

// const projects = [
//   {
//     image: require('./../../images/projects/portrait/pic1.jpg'),
//     title: 'Interior Work Avroko',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic2.jpg'),
//     title: 'Vilters',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic3.jpg'),
//     title: 'Industrial Design',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic4.jpg'),
//     title: 'House Bluprint',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic5.jpg'),
//     title: 'Modern Bathroom',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-5'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic6.jpg'),
//     title: 'Bellevue Project',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic7.jpg'),
//     title: 'Qatar Pavilion',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic8.jpg'),
//     title: 'Museum',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic9.jpg'),
//     title: 'Modern house',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//     {
//     image: require('./../../images/projects/portrait/pic1.jpg'),
//     title: 'Interior Work Avroko',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic2.jpg'),
//     title: 'Vilters',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic3.jpg'),
//     title: 'Industrial Design',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic4.jpg'),
//     title: 'House Bluprint',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic5.jpg'),
//     title: 'Modern Bathroom',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-5'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic6.jpg'),
//     title: 'Bellevue Project',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic7.jpg'),
//     title: 'Qatar Pavilion',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic8.jpg'),
//     title: 'Museum',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic9.jpg'),
//     title: 'Modern house',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   }
// ]

// var bgimg1 = require('./../../images/background/cross-line2.png');
// var bgimg2 = require('./../../images/background/cross-line.png');

// class Projects2 extends React.Component {
//   // componentDidMount() {
//   //     function loadScript(src) {

//   //         return new Promise(function (resolve, reject) {
//   //             var script = document.createElement('script');
//   //             script.src = src;
//   //             script.addEventListener('load', function () {
//   //                 resolve();
//   //             });
//   //             script.addEventListener('error', function (e) {
//   //                 reject(e);
//   //             });
//   //             document.body.appendChild(script);
//   //             document.body.removeChild(script);
//   //         })
//   //     };

//   //     loadScript('./assets/js/custom.js');

//   // };

//   constructor(props) {
//     super(props);
//     this.state = {
//       label_id: 5,
//       data: {},
//       apiData2: [],
//       apiData: [],   // API ka data save karne ke liye
//       loading: true, // loading state
//       error: null,    // error handle karne ke liye
//       flag: true,
//       showModal: false,
//       formData: {
//         name: "",
//         phone: "",
//         email: "",
//         service: [],
//         city: "",
//         message: "",
//       }
//     };
//   }

//   componentDidMount() {
//     function loadScript(src) {

//       return new Promise(function (resolve, reject) {
//         var script = document.createElement('script');
//         script.src = src;
//         script.addEventListener('load', function () {
//           resolve();
//         });
//         script.addEventListener('error', function (e) {
//           reject(e);
//         });
//         document.body.appendChild(script);
//         document.body.removeChild(script);
//       })
//     };

//     loadScript('./assets/js/custom.js');
//     // First API call (GET)
//     const requestOptions1 = {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-get-subcategory-get", requestOptions1)
//       .then((response) => response.json())
//       .then((result) => {
//         console.log("API 1 Result:", result.data);
//         this.setState({ apiData: result.data.reverse(), loading: false });
//       })
//       .catch((error) => {
//         console.error("API 1 Error:", error);
//         this.setState({ error: error, loading: false });
//       });

//     // Second API call (POST)
//     const requestOptions2 = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id: 5 }),
//     };

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", requestOptions2)
//       .then((response) => response.json())
//       .then((result) => {
//         console.log("API 2 Result:", result.data);
//         this.setState({
//           data: result.data,
//           apiData2: result.data.allSubCategories,
//           loading: false, flag: true
//         });
//       })
//       .catch((error) => {
//         console.error("API 2 Error:", error);
//         this.setState({ error: error, loading: false });
//       });
//   }

//   handleClick = (id) => {
//     console.log("Clicked category id:", id);
//     this.setState({ label_id: id })
//     const formdata = new FormData();
//     formdata.append("id", id);

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
//       method: "POST",
//       body: formdata,
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Service API Response:", data);
//         if (data.data.allSubCategories && data.data.allSubCategories.length == 0) {

//           this.setState({ apiData3: data.data.photos, flag: false, }); // update state
//         } else {
//           this.setState({
//             data: data.data,
//             apiData2: data.data.allSubCategories,
//             loading: false, flag: true
//           });
//         }
//       })
//       .catch((error) => console.error("Service API Error:", error));
//   };

//   handleClick2 = (id) => {
//     console.log("Clicked category id:]]]]]]]", id);

//     const formdata = new FormData();
//     formdata.append("id", id);

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", {
//       method: "POST",
//       body: formdata,
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Service API Response:", data.data.subCategories);
//         if (data.data.subCategories && data.data.subCategories.length == 0) {

//           this.setState({ apiData3: data.data.photos, flag: false, }); // update state
//         } else {
//           this.setState({ apiData2: data.data.subCategories, flag: true }); // update state
//         }

//       })
//       .catch((error) => console.error("Service API Error:", error));
//   };
//   renderSubCategories(subCategories, parentId) {
//     return (
//       <ul className="submenu">
//         {subCategories.map((sub, i) => {
//           const hasChildren = sub.subCategories.length > 0;

//           return (
//             <li key={i} className={hasChildren ? "has-submenu" : ""}>
//               <NavLink to={"#"} onClick={(e) => {
//                 e.preventDefault();
//                 this.handleClick2(sub.id);
//               }} data-filter={parentId || sub.id}>
//                 {sub.name}{" "}
//                 {hasChildren && <span className="arrow">›</span>}
//               </NavLink>

//               {hasChildren &&
//                 this.renderSubCategories(sub.subCategories, sub.id)}
//             </li>
//           );
//         })}
//       </ul>
//     );
//   }
//   toggleModal = () => {
//     this.setState({ showModal: !this.state.showModal });
//   };

//   handleChange = (e) => {
//     const { name, value } = e.target;
//     this.setState((prev) => ({
//       formData: { ...prev.formData, [name]: value }
//     }));
//   };

//   handleServiceCheckbox = (e) => {
//     const { value, checked } = e.target;
//     this.setState((prev) => {
//       let services = [...prev.formData.service];
//       if (checked) {
//         services.push(value);
//       } else {
//         services = services.filter((s) => s !== value);
//       }
//       return { formData: { ...prev.formData, service: services } };
//     });
//   };

//   handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Submitted:", this.state.formData);
//     this.toggleModal();
//   };
//   render() {
//     const { data, apiData, apiData2, loading, error, label_id, apiData3, flag } = this.state;

//     return (
//       <div>
//         <div className="section-full  mobile-page-padding bg-white  p-t80 p-b80">
//           <div className="container">
//             {/* TITLE START */}
//             <div className="section-head">
//               <div className="sx-separator-outer separator-center">
//                 <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
//                   <h3 className="sep-line-one">Showcase</h3>
//                 </div>
//               </div>
//             </div>
//             {/* TITLE END */}
//             {/* Filter Nav START */}


//             <div className="filter-wrap p-b30 text-center">
//               <ul className="filter-navigation masonry-filter clearfix">
//                 {/* All Option */}
//                 {/* <li className="active">
//             <NavLink to={"#"} className="btn from-top" data-filter="*">
//               All
//             </NavLink>
//           </li> */}

//                 {/* Dynamic Categories */}
//                 {apiData.map((item, index) => {
//                   const hasChildren = item.subCategories.length > 0;

//                   return (
//                     <li key={index} className={hasChildren ? "has-submenu" : ""}>
//                       <NavLink to={"#"} onClick={(e) => {
//                         e.preventDefault();
//                         this.handleClick(item.id);
//                       }} className="btn from-top" data-filter={item.id} style={{ color: item.id == label_id ? "#0f172a" : "" }}>
//                         {item.name}{" "}

//                       </NavLink>

//                       {hasChildren &&
//                         this.renderSubCategories(item.subCategories, item.id)}
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//             {/* Filter Nav END */}
//             {/* GALLERY CONTENT START */}

//             {/* {flag === true ? */}
//              <div className="masonry-outer mfp-gallery work-grid row clearfix list-unstyled m-b0">
//               {projects.map((item, index) => (
//                 <div key={index} className={`masonry-item col-lg-4 col-md-6 col-sm-12 m-b30`}>
//                     <div className="sx-box image-hover-block">
//                         <div className="sx-thum-bx">
//                             <img src={item.image} alt="" />
//                         </div>
//                         <div className="sx-info  p-t20 text-white">
//                             <h4 className="sx-tilte">{item.title}</h4>
//                             {/* <p className="m-b0">{item.address}</p> */}
//                         </div>
//                         <a className="mfp-link" href={item.image} data-group="gallery1">
//                             <i className="fa fa-arrows-alt" />
//                         </a>
//                     </div>
//                 </div>
//                 //                              <div key={index} className="masonry-item col-lg-4 col-md-6 col-sm-12 m-b30">
//                 //   <div className="sx-box image-hover-block">
//                 //     <div className="sx-thum-bx">
//                 //       <img 
//                 //         src={item.thumbnail_img || (item.photos && item.photos[0])} 
//                 //         alt={item.name} 
//                 //       />
//                 //     </div>
//                 //     <div className="sx-info p-t20 text-white">
//                 //       <h4 className="sx-tilte">{item.name}</h4>
//                 //     </div>

//                 //     {/* Thumbnail (first image visible) */}
//                 //     <a 
//                 //       className="mfp-link" 
//                 //       href={item.photos && item.photos[0]} 
//                 //       rel={`gallery-${index}`}   // ✅ group attribute
//                 //     >
//                 //       <i className="fa fa-arrows-alt" />
//                 //     </a>

//                 //     {/* Baaki saare images hidden links me */}
//                 //     {item.photos && item.photos.slice(1).map((photo, i) => (
//                 //       <a 
//                 //         key={i} 
//                 //         className="mfp-link d-none" 
//                 //         href={photo} 
//                 //         rel={`gallery-${index}`}   // ✅ same rel as thumbnail
//                 //       />
//                 //     ))}
//                 //   </div>
//                 // </div>
//                 // <div key={index} className="masonry-item col-lg-4 col-md-6 col-sm-12 m-b30">
//                 //   <div className="sx-box image-hover-block">
//                 //     <div className="sx-thum-bx" style={{ width: "100%" }}>
//                 //       <img
//                 //         src={item.thumbnail_img || (item.photos && item.photos[0])}
//                 //         alt={item.name}
//                 //         style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
//                 //       />
//                 //     </div>
//                 //     <div className="sx-info p-t20 text-white">
//                 //       <h4 className="sx-tilte">{item.name}</h4>
//                 //     </div>

//                 //     {/* First image visible */}
//                 //     <a
//                 //       className="mfp-link"
//                 //       href={item.photos && item.photos[0]}
//                 //       rel={`gallery-${item.id}`}  // ✅ unique per category
//                 //     >
//                 //       <i className="fa fa-arrows-alt" />
//                 //     </a>

//                 //     {/* Rest of images hidden */}
//                 //     {item.photos && item.photos.slice(1).map((photo, i) => (
//                 //       <a
//                 //         key={i}
//                 //         className="mfp-link d-none"
//                 //         href={photo}
//                 //         rel={`gallery-${item.id}`} // ✅ same rel per category
//                 //       />
//                 //     ))}
//                 //   </div>
//                 // </div>
//               ))}
//             </div> 
//             {/* :
//               <div className="masonry-outer mfp-gallery work-grid row clearfix list-unstyled m-b0" style={{ display: 'flex', flexWrap: 'wrap' }}>
//                 {apiData3.map((item, index) => (
//                   <div key={index} className={`masonry-item col-lg-4 col-md-6 col-sm-12 m-b30`}>
//                     <div className="sx-box image-hover-block">
//                       <div className="sx-thum-bx" style={{ width: "100%" }}>
//                         <img src={item} alt='' style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} />
//                       </div>
//                       {/* <div className="sx-info  p-t20 text-white">
//                                             <h4 className="sx-tilte">{item.name}</h4>
//                                             {/* <p className="m-b0">{item.address}</p>
//                                         </div> 
//                       <a className="mfp-link" href={item} data-group="gallery1">
//                         <i className="fa fa-arrows-alt" />
//                       </a>
//                     </div>
//                   </div>

//                 ))}
//               </div> */}

//             {/* Force layout clear to avoid overlap with next section */}
//             <div style={{ clear: 'both' }} />
//             {/* GALLERY CONTENT END */}
//             <div className="text-center load-more-btn-outer" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
//               <button className="site-button btn-half" onClick={this.toggleModal}><span>Get a Free Consultation</span></button>
//             </div>
//           </div>
//         </div>
//         <ConsultationModal
//           show={this.state.showModal}
//           toggleModal={this.toggleModal}
//           formData={this.state.formData}
//           handleChange={this.handleChange}
//           handleServiceCheckbox={this.handleServiceCheckbox}
//           handleSubmit={this.handleSubmit}
//         />

//       </div>
//     );
//   }
// };

// export default Projects2;




//   <div style={{ minHeight: "500px" }}>
//                             <ul className="masonry-outer mfp-gallery row work-grid clearfix list-unstyled grid-5">
//                                {flag === true ?  apiData2.map((item, index) => (
//                                     // <div key={index} className={`${item.id} masonry-item col-xl-3  col-lg-4 col-md-6 col-sm-12 m-b30`}>
//                                     //     <div className="sx-box image-hover-block">
//                                     //         <div className="sx-thum-bx">
//                                     //             <img src={item.thumbnail_img} alt="" />
//                                     //         </div>
//                                     //         <div className="sx-info  p-t20 text-white">
//                                     //             <h4 className="sx-tilte">{item.name}</h4>
//                                     //             {/* <p className="m-b0">{item.address}</p> */}
//                                     //         </div>
//                                     //         <a className="mfp-link" href={item.thumbnail_img}>
//                                     //             <i className="fa fa-arrows-alt" />
//                                     //         </a>
//                                     //     </div>
//                                     // </div>
//                                      <div key={index} className={`${item.id} masonry-item col-xl-3  col-lg-4 col-md-6 col-sm-12 m-b30`}>
//       <div className="sx-box image-hover-block">
//         <div className="sx-thum-bx">
//           <img 
//             src={item.thumbnail_img || (item.photos && item.photos[0])} 
//             alt={item.name} style={{width:"100%", height:"100%",objectFit:"contain"}}
//           />
//         </div>
//         <div className="sx-info p-t20 text-white">
//           <h4 className="sx-tilte">{item.name}</h4>
//         </div>

//         {/* First image visible */}
//         <a 
//           className="mfp-link" 
//           href={item.photos && item.photos[0]} 
//           rel={`gallery-${item.id}`}  // ✅ unique per category
//         >
//           <i className="fa fa-arrows-alt" />
//         </a>

//         {/* Rest of images hidden */}
//         {item.photos && item.photos.slice(1).map((photo, i) => (
//           <a 
//             key={i} 
//             className="mfp-link d-none" 
//             href={photo} 
//             rel={`gallery-${item.id}`} // ✅ same rel per category
//           />
//         ))}
//       </div>
//     </div>
//                                 )) : apiData3.map((item, index) => (
//                                     <div key={index} className={`${item} masonry-item col-xl-3  col-lg-4 col-md-6 col-sm-12 m-b30`}>
//                                         <div className="sx-box image-hover-block">
//                                             <div className="sx-thum-bx">
//                                                 <img src={item}  style={{width:"100%", height:"100%",objectFit:"contain"}} alt="" />
//                                             </div>
                                            
//                                             <a className="mfp-link" href={item}>
//                                                 <i className="fa fa-arrows-alt" />
//                                             </a>
//                                         </div>
//                                     </div>
               
//                                 ))}
//                              </ul>
//                              </div>







// import React, { useCallback, useEffect, useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import ConsultationModal from './ConsultationModal';

// const filters = [
//   {
//     label: "Architectural",
//     filter: ".cat-1",
//     subCategories: [
//       "Sample Layout Plans",
//       "Elevations"
//     ]
//   },
//   {
//     label: "Interior",
//     filter: ".cat-2",
//     subCategories: [
//       "Bedroom",
//       "Washroom"
//     ]
//   },
//   {
//     label: "Turnkey Construction",
//     filter: ".cat-4",
//     subCategories: [] // koi sub-category nahi hai
//   }
// ];

// const projects = [
//   {
//     image: require('./../../images/projects/portrait/pic1.jpg'),
//     title: 'Interior Work Avroko',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic2.jpg'),
//     title: 'Vilters',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic3.jpg'),
//     title: 'Industrial Design',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic4.jpg'),
//     title: 'House Bluprint',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic5.jpg'),
//     title: 'Modern Bathroom',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-5'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic6.jpg'),
//     title: 'Bellevue Project',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic7.jpg'),
//     title: 'Qatar Pavilion',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic8.jpg'),
//     title: 'Museum',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic9.jpg'),
//     title: 'Modern house',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//     {
//     image: require('./../../images/projects/portrait/pic1.jpg'),
//     title: 'Interior Work Avroko',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic2.jpg'),
//     title: 'Vilters',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic3.jpg'),
//     title: 'Industrial Design',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic4.jpg'),
//     title: 'House Bluprint',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic5.jpg'),
//     title: 'Modern Bathroom',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-5'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic6.jpg'),
//     title: 'Bellevue Project',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-4'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic7.jpg'),
//     title: 'Qatar Pavilion',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-3'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic8.jpg'),
//     title: 'Museum',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-2'
//   },
//   {
//     image: require('./../../images/projects/portrait/pic9.jpg'),
//     title: 'Modern house',
//     address: 'Muscat, Sultanate of Oman',
//     id: 'cat-1'
//   }
// ]

// var bgimg1 = require('./../../images/background/cross-line2.png');
// var bgimg2 = require('./../../images/background/cross-line.png');

// function Projects2() {
 

//   const [label_id, setLabelId] = useState(5);
//   const [data, setData] = useState({});
//   const [apiData2, setApiData2] = useState([]);
//   const [apiData, setApiData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [flag, setFlag] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [apiData3, setApiData3] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     service: [],
//     city: "",
//     message: "",
//   });

//   const resetForm = useCallback(() => {
//     setFormData({ name: "", phone: "", email: "", service: [], city: "", message: "" });
//   }, []);

//   const toggleModal = useCallback(() => setShowModal((s) => !s), []);

//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleServiceCheckbox = useCallback((e) => {
//     const { value, checked } = e.target;
//     setFormData((prev) => {
//       let services = [...prev.service];
//       if (checked) {
//         if (!services.includes(value)) services.push(value);
//       } else {
//         services = services.filter((s) => s !== value);
//       }
//       return { ...prev, service: services };
//     });
//   }, []);

//   useEffect(() => {
//     function loadScript(src) {

//       return new Promise(function (resolve, reject) {
//         var script = document.createElement('script');
//         script.src = src;
//         script.addEventListener('load', function () {
//           resolve();
//         });
//         script.addEventListener('error', function (e) {
//           reject(e);
//         });
//         document.body.appendChild(script);
//         document.body.removeChild(script);
//       })
//     };

//     loadScript('./assets/js/custom.js');
//     // First API call (GET)
//     const requestOptions1 = {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-get-subcategory-get", requestOptions1)
//       .then((response) => response.json())
//       .then((result) => {
//          setApiData(result.data.reverse()); 
//          setLoading(false);
//          })
//       .catch((err) => { setError(err); setLoading(false); });

//     // Second API call (POST)
//     const requestOptions2 = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id: 5 }),
//     };

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", requestOptions2)
//       .then((response) => response.json())
//       .then((result) => {
//         console.log("l,la,la,la,al",result.data.allSubCategories)
//          setData(result.data);
//          setApiData2(result.data.allSubCategories); 
//          setLoading(false); 
//          setFlag(true)
//          ; })
//       .catch((err) => { setError(err); setLoading(false); });
//   }, []);

//   const handleClick = (id) => {
//     setLabelId(id);
//     const formdata = new FormData();
//     formdata.append("id", id);
//     console.log(",l,l,l,lxlxlxlx",id)

//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get-main-category", {
//       method: "POST",
//       body: formdata,
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         let finalArray = [];
//         if (data.data.allSubCategories && data.data.allSubCategories.length == 0) {
//           // setApiData3(data.data.photos); 
//             setApiData2([{
//     id: data.data.id,
//     name: data.data.category_name,
//     thumbnail_img: data.data.thumbnail_img,
//     photos: data.data.photos
//   }]);
//   console.log("[][][][][][][][][]",apiData2)
//     setFlag(true);
//         } else {
//           setData(data.data); setApiData2(data.data.allSubCategories); setLoading(false); setFlag(true);
//         }
//       })
//       .catch((error) => console.error("Service API Error:", error));
//   }

//   useEffect(() => {
//     if (typeof window !== 'undefined' && window.jQuery) {
//       const $ = window.jQuery;
//       const $container = $('.masonry-outer');
//       try {
//         if ($container.length && typeof $container.isotope === 'function') {
//           // Destroy existing isotope instance first
//           $container.isotope('destroy');
//           // Reinitialize with fresh data
//           $container.isotope({ itemSelector: '.masonry-item', transitionDuration: '0.4s', originLeft: true });
//           $container.imagesLoaded(function () {
//             $container.isotope('layout');
//           });
//         }
//         if (typeof $.fn.magnificPopup === 'function') {
//           $('.mfp-gallery').magnificPopup({ delegate: '.mfp-link', type: 'image', gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] } });
//         }
//       } catch (e) {
//         // no-op
//       }
//     }
//   }, [apiData2, apiData3, flag]);

//   const handleClick2 = (id) => {
//     const formdata = new FormData();
//     formdata.append("id", id);
//     fetch("https://www.admin.infrioindia.com/api/v2/auth/project-category-services-details-get", { method: "POST", body: formdata })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.data.subCategories && data.data.subCategories.length == 0) { setApiData3(data.data.photos); setFlag(false); }
//         else { setApiData2(data.data.subCategories); setFlag(true); }
//       })
//       .catch((error) => console.error("Service API Error:", error));
//   };
//   const renderSubCategories = (subCategories, parentId) => {
//     return (
//       <ul className="submenu">
//         {subCategories.map((sub, i) => {
//           const hasChildren = sub.subCategories.length > 0;

//           return (
//             <li key={i} className={hasChildren ? "has-submenu" : ""}>
//               <NavLink to={"#"} onClick={(e) => {
//                 e.preventDefault();
//                 handleClick(sub.id);
//               }} data-filter={parentId || sub.id}>
//                 {sub.name}{" "}
//                 {hasChildren && <span className="arrow">›</span>}
//               </NavLink>

//               {hasChildren &&
//                 renderSubCategories(sub.subCategories, sub.id)}
//             </li>
//           );
//         })}
//       </ul>
//     );
//   };

//     return (
//       <div>
//         <div className="section-full  mobile-page-padding bg-white  p-t80 p-b80">
//           <div className="container">
//             {/* TITLE START */}
//             <div className="section-head">
//               <div className="sx-separator-outer separator-center">
//                 <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
//                   <h3 className="sep-line-one">Showcase</h3>
//                 </div>
//               </div>
//             </div>
//             {/* TITLE END */}
//             {/* Filter Nav START */}


//             <div className="filter-wrap p-b30 text-center">
//               <ul className="filter-navigation masonry-filter clearfix">
//                 {/* All Option */}
//                 {/* <li className="active">
//             <NavLink to={"#"} className="btn from-top" data-filter="*">
//               All
//             </NavLink>
//           </li> */}

//                 {/* Dynamic Categories */}
//                 {apiData.map((item, index) => {
//                   const hasChildren = item.subCategories.length > 0;

//                   return (
//                     <li key={index} className={hasChildren ? "has-submenu" : ""}>
//                       <NavLink to={"#"} onClick={(e) => {
//                         e.preventDefault();
//                         handleClick(item.id);
//                       }} className={item.id == label_id ? "active" :"btn from-top"} data-filter={item.id} style={{ color: item.id == label_id ? "#0f172a" : "" }}>
//                         {item.name}{" "}

//                       </NavLink>

//                       {hasChildren &&
//                         renderSubCategories(item.subCategories, item.id)}
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//             {/* Filter Nav END */}
//             {/* GALLERY CONTENT START */}

//              {flag === true ? (
//                 <div className="masonry-outer work-grid row clearfix list-unstyled m-b0">
//                  {apiData2.map((item, index) => (
//                     <div key={index} className="masonry-item col-lg-4 col-md-6 col-sm-12 m-b30">
//                   <div className="sx-box image-hover-block mfp-gallery"  style={{ cursor: 'pointer' }}>
//                     <div className="sx-thum-bx" style={{ width: "100%" }}>
//                       <img
//                         src={item.thumbnail_img}
//                         alt={item.name}
//                         style={{ display: "block", objectFit: "cover" }}
//                       />
//                     </div>
//                     <div className="sx-info p-t20 text-white">
//                       <h4 className="sx-tilte">{item.name}</h4>
//                     </div>
//                   </div>
//                 </div>
//                  ))}
//                </div>
//              ) : (
//                 <div className="masonry-outer work-grid row clearfix list-unstyled m-b0">
//                  {apiData3.map((item, index) => (
//                    <div key={index} className={`masonry-item col-lg-4 col-md-6 col-sm-12 m-b30`}>
//                       <div className="sx-box image-hover-block mfp-gallery">
//                        <div className="sx-thum-bx" style={{ width: '100%' }}>
//                          <img src={item} alt='' style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
//                        </div>
                      
//                      </div>
//                    </div>
//                  ))}
//                </div>
//              )}
           
//             <div style={{ clear: 'both' }} />
//             {/* GALLERY CONTENT END */}
//             <div className="text-center load-more-btn-outer" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
//               <button className="site-button btn-half" onClick={() => setShowModal(true)}><span>Get a Free Consultation</span></button>
//             </div>
//           </div>
//         </div>
//         <ConsultationModal
//           show={showModal}
//           toggleModal={toggleModal}
//           formData={formData}
//           onResetForm={resetForm}
//           handleChange={handleChange}
//           handleServiceCheckbox={handleServiceCheckbox}
//           handleSubmit={(e) => { e.preventDefault(); toggleModal(); }}
//         />

//       </div>
//     );
// }

// export default Projects2;
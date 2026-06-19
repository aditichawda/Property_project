import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

const interiorPackages = [
    {
        id: 'single-bhk',
        name: 'Single BHK',
        price: '₹3.5 Lacs',
        tagline: 'Complete interior solution for single bedroom homes',
        features: [
            'One Wardrobe',
            'Modular Kitchen',
            'Single Bed',
            'One TV Panel',
            '4-Seater Sofa',
            '200 sqft Wallpaper',
            '200 sqft Bidding',
            '5 decorative lights upto ₹20,000'
        ]
    },
    {
        id: '2-bhk',
        name: '2 BHK',
        price: '₹5 Lacs',
        tagline: 'Comprehensive interior package for 2 bedroom homes',
        features: [
            '2 Wardrobes',
            'Modular Kitchen',
            '2 Beds',
            'One TV Panel',
            '6-Seater Sofa',
            '250 sqft Wallpaper',
            '300 sqft Bidding',
            '5 decorative lights upto ₹25,000'
        ]
    },
    {
        id: '3-bhk',
        name: '3 BHK',
        price: '₹8 Lacs',
        tagline: 'Premium interior package for 3 bedroom homes',
        features: [
            '3 Wardrobes',
            'Modular Kitchen',
            '3 Beds',
            'Two TV Panel',
            '7-Seater Sofa',
            '300 sqft Wallpaper',
            '300 sqft Bidding',
            '7 decorative lights upto ₹35,000'
        ]
    },
];

const propertyFieldConfig = {
    Flat: [
        { name: 'carpetArea', label: 'Carpet Area (sq.ft)' },
        { name: 'rooms', label: 'Number of Rooms' },
        { name: 'avgRoomSize', label: 'Average Room Size' },
        { name: 'drawingDining', label: 'Drawing + Dining Size' },
        { name: 'kitchen', label: 'Kitchen Required (Yes / No)' },
        { name: 'kitchenSize', label: 'Kitchen Size' },
        { name: 'toilets', label: 'Toilets Count' },
        { name: 'toiletInterior', label: 'Toilets Interior Required' },
        { name: 'fallCeiling', label: 'Fall Ceiling Requirement' },
    ],
    'Individual Villa/Bungalow': [
        { name: 'plotSize', label: 'Plot Size' },
        { name: 'villaRooms', label: 'Number of Rooms' },
        { name: 'villaAvgRoomSize', label: 'Average Room Size' },
        { name: 'livingDining', label: 'Living + Dining Size' },
        { name: 'villaKitchen', label: 'Kitchen Required (Yes / No)' },
        { name: 'villaKitchenSize', label: 'Kitchen Size' },
        { name: 'villaToilets', label: 'Toilets Count' },
        { name: 'villaToiletInterior', label: 'Toilets Interior Required' },
        { name: 'stairsDesign', label: 'Stairs Design (Simplex/Duplex)' },
        { name: 'villaFallCeiling', label: 'Fall Ceiling Requirement' },
    ],
    Office: [
        { name: 'officeSize', label: 'Total Size' },
        { name: 'closedCabins', label: 'Closed Cabins' },
        { name: 'avgCabinSize', label: 'Average Cabin Size' },
        { name: 'reception', label: 'Reception Requirement' },
        { name: 'receptionSize', label: 'Reception Size' },
        { name: 'officeToilets', label: 'Toilets Count' },
        { name: 'officeToiletInterior', label: 'Toilets Interior Required' },
        { name: 'officeFallCeiling', label: 'Fall Ceiling Requirement' },
    ],
    Hotel: [
        { name: 'hotelArea', label: 'Total Area' },
        { name: 'hotelRooms', label: 'Total Rooms' },
        { name: 'hotelAvgRoom', label: 'Average Room Size' },
        { name: 'hotelReception', label: 'Reception Requirement' },
        { name: 'hotelReceptionSize', label: 'Reception Size' },
        { name: 'hotelToilets', label: 'Toilets Count' },
        { name: 'hotelToiletInterior', label: 'Toilets Interior Required' },
        { name: 'hotelFallCeiling', label: 'Fall Ceiling Requirement' },
    ],
    Restaurant: [
        { name: 'restaurantArea', label: 'Total Area' },
        { name: 'restaurantRooms', label: 'Total Rooms / Seating Sections' },
        { name: 'restaurantReception', label: 'Reception / Host Desk Size' },
        { name: 'restaurantToilets', label: 'Toilets Count' },
        { name: 'restaurantToiletInterior', label: 'Toilets Interior Required' },
        { name: 'restaurantFallCeiling', label: 'Fall Ceiling Requirement' },
    ],
    Other: [
        { name: 'otherArea', label: 'Total Area' },
        { name: 'otherRequirements', label: 'Describe Your Requirements' },
        { name: 'otherFallCeiling', label: 'Fall Ceiling Requirement' },
    ],
};

function ServiceDetailInte(props) {
     const navigate = useNavigate();
     const [label_id, setLabelId] = useState(6);
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [packageFormData, setPackageFormData] = useState({ name: "", phone: "", email: "", city: "" });
    const [packageSubmitting, setPackageSubmitting] = useState(false);
    const [packageSuccess, setPackageSuccess] = useState(false);
    const [packageSuccessMessage, setPackageSuccessMessage] = useState('');

    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customFormData, setCustomFormData] = useState({
        customName: '',
        customPhone: '',
        customEmail: '',
        customCity: '',
        propertyType: 'Flat',
        budget: '',
        furnitureScope: '',
        designPreferences: '',
        message: '',
        // Flat fields
        carpetArea: '',
        rooms: '',
        avgRoomSize: '',
        drawingDining: '',
        kitchen: '',
        kitchenSize: '',
        toilets: '',
        toiletInterior: '',
        fallCeiling: '',
        // Villa/Bungalow fields
        plotSize: '',
        villaRooms: '',
        villaAvgRoomSize: '',
        livingDining: '',
        villaKitchen: '',
        villaKitchenSize: '',
        villaToilets: '',
        villaToiletInterior: '',
        stairsDesign: '',
        villaFallCeiling: '',
        // Office fields
        officeSize: '',
        closedCabins: '',
        avgCabinSize: '',
        reception: '',
        receptionSize: '',
        officeToilets: '',
        officeToiletInterior: '',
        officeFallCeiling: '',
        // Hotel fields
        hotelArea: '',
        hotelRooms: '',
        hotelAvgRoom: '',
        hotelReception: '',
        hotelReceptionSize: '',
        hotelToilets: '',
        hotelToiletInterior: '',
        hotelFallCeiling: '',
        // Restaurant fields
        restaurantArea: '',
        restaurantRooms: '',
        restaurantReception: '',
        restaurantToilets: '',
        restaurantToiletInterior: '',
        restaurantFallCeiling: '',
        // Other fields
        otherArea: '',
        otherRequirements: '',
        otherFallCeiling: '',
        // Common fields
        average_room_size: '',
        toilets_count: '',
        toilets_interior_required: '',
        fall_ceiling_requirement: '',
    });
    const [customSubmitting, setCustomSubmitting] = useState(false);
    const [customSuccess, setCustomSuccess] = useState(false);

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
             body: JSON.stringify({ id: 6 }),
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
       body: JSON.stringify({ id: 6 }),
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
  setFlag(true);
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
         setLabelId(6);
         
         const formdata = new FormData();
         formdata.append("id", 6);
 
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

    const requireAuth = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { redirect: '/interior-design' } });
            return true;
        }
        return false;
    };

    const handlePackageClick = (pkg) => {
        // if (requireAuth()) return;
        setSelectedPackage(pkg);
        setShowPackageModal(true);
    };

    const handlePackageFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 15);
            setPackageFormData((prev) => ({ ...prev, [name]: digitsOnly }));
            return;
        }
        setPackageFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closePackageModal = () => {
        setShowPackageModal(false);
        setSelectedPackage(null);
        setPackageFormData({ name: "", phone: "", email: "", city: "" });
        setPackageSuccess(false);
        setPackageSuccessMessage('');
    };

    const submitPackageForm = async (e) => {
        e.preventDefault();
        setPackageSubmitting(true);
        setPackageSuccessMessage('');

        try {
            const formData = new FormData();
            formData.append('come_from', 'Interior');
            formData.append('enquiry_name', selectedPackage?.name || 'Interior Package');
            formData.append('name', packageFormData.name);
            formData.append('phone', packageFormData.phone);
            formData.append('email', packageFormData.email);
            formData.append('city', packageFormData.city);

            const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/services-enquiry-submit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status) {
                setPackageSuccessMessage(result.message || 'Enquiry submitted successfully');
                setPackageSuccess(true);
                setPackageSubmitting(false);
                setTimeout(() => {
                    closePackageModal();
                }, 2000);
            } else {
                setPackageSubmitting(false);
                alert(result.message || 'Failed to submit enquiry. Please try again.');
            }
        } catch (err) {
            console.error('Error submitting package enquiry:', err);
            setPackageSubmitting(false);
            alert('Something went wrong. Please try again.');
        }
    };

    const handleCustomClick = () => {
        if (requireAuth()) return;
        setShowCustomModal(true);
    };

    const handleCustomFormChange = (e) => {
        const { name, value } = e.target;
        setCustomFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closeCustomModal = () => {
        setShowCustomModal(false);
        setCustomFormData({
            customName: '',
            customPhone: '',
            customEmail: '',
            customCity: '',
            propertyType: 'Flat',
            budget: '',
            furnitureScope: '',
            designPreferences: '',
            message: '',
            // Flat fields
            carpetArea: '',
            rooms: '',
            avgRoomSize: '',
            drawingDining: '',
            kitchen: '',
            kitchenSize: '',
            toilets: '',
            toiletInterior: '',
            fallCeiling: '',
            // Villa/Bungalow fields
            plotSize: '',
            villaRooms: '',
            villaAvgRoomSize: '',
            livingDining: '',
            villaKitchen: '',
            villaKitchenSize: '',
            villaToilets: '',
            villaToiletInterior: '',
            stairsDesign: '',
            villaFallCeiling: '',
            // Office fields
            officeSize: '',
            closedCabins: '',
            avgCabinSize: '',
            reception: '',
            receptionSize: '',
            officeToilets: '',
            officeToiletInterior: '',
            officeFallCeiling: '',
            // Hotel fields
            hotelArea: '',
            hotelRooms: '',
            hotelAvgRoom: '',
            hotelReception: '',
            hotelReceptionSize: '',
            hotelToilets: '',
            hotelToiletInterior: '',
            hotelFallCeiling: '',
            // Restaurant fields
            restaurantArea: '',
            restaurantRooms: '',
            restaurantReception: '',
            restaurantToilets: '',
            restaurantToiletInterior: '',
            restaurantFallCeiling: '',
            // Other fields
            otherArea: '',
            otherRequirements: '',
            otherFallCeiling: '',
            // Common fields
            average_room_size: '',
            toilets_count: '',
            toilets_interior_required: '',
            fall_ceiling_requirement: '',
        });
        setCustomSuccess(false);
    };

    const submitCustomForm = async (e) => {
        e.preventDefault();
        setCustomSubmitting(true);

        try {
            const authData = localStorage.getItem('infrioAuth');
            const auth = authData ? JSON.parse(authData) : null;
            
            if (!auth || !auth.userId) {
                alert('Please login to submit custom interior request.');
                setCustomSubmitting(false);
                return;
            }

            const formData = new FormData();
            
            // Normalize property type
            let propertyType = customFormData.propertyType;
            const propertyTypeLower = propertyType.toLowerCase().trim();
            
            if (propertyTypeLower === 'flat') {
                propertyType = 'Flat';
            } else if (propertyTypeLower.includes('individual villa') || propertyTypeLower.includes('bungalow')) {
                propertyType = 'Individual villa/bungalow';
            } else if (propertyTypeLower === 'office') {
                propertyType = 'Office';
            } else if (propertyTypeLower === 'hotel') {
                propertyType = 'Hotel';
            } else if (propertyTypeLower === 'restaurant') {
                // Map Restaurant to Hotel as closest match
                propertyType = 'Hotel';
            } else if (propertyTypeLower === 'other') {
                // Map Other to Flat as default
                propertyType = 'Flat';
            } else {
                alert('Property type must be Flat, Individual Villa/Bungalow, Office, or Hotel. Please select a valid option.');
                setCustomSubmitting(false);
                return;
            }

            formData.append('property_type', propertyType);
            formData.append('user_id', auth.userId);
            
            // Handle Restaurant -> Hotel field mapping
            if (propertyType === 'Hotel' && customFormData.propertyType === 'Restaurant') {
                if (customFormData.restaurantArea) {
                    formData.append('total_area', customFormData.restaurantArea);
                }
                if (customFormData.restaurantRooms) {
                    formData.append('total_rooms', customFormData.restaurantRooms);
                }
                if (customFormData.restaurantReception) {
                    formData.append('reception_requirement', customFormData.restaurantReception);
                }
                // Note: Restaurant form doesn't have receptionSize field, so we skip it
                if (customFormData.restaurantToilets) {
                    formData.append('toilets_count', customFormData.restaurantToilets);
                }
                if (customFormData.restaurantToiletInterior) {
                    formData.append('toilets_interior_required', customFormData.restaurantToiletInterior);
                }
                if (customFormData.restaurantFallCeiling) {
                    formData.append('fall_ceiling_requirement', customFormData.restaurantFallCeiling);
                }
            }
            
            // Handle Other -> Flat field mapping
            if (propertyType === 'Flat' && customFormData.propertyType === 'Other') {
                if (customFormData.otherArea) {
                    formData.append('carpet_area', customFormData.otherArea);
                }
                if (customFormData.otherFallCeiling) {
                    formData.append('fall_ceiling_requirement', customFormData.otherFallCeiling);
                }
            }

            // Common fields - map from form field names to API field names
            // For Flat (exclude Other as it's handled separately)
            if (propertyType === 'Flat' && customFormData.propertyType !== 'Other' && customFormData.avgRoomSize) {
                formData.append('average_room_size', customFormData.avgRoomSize);
            }
            if (propertyType === 'Flat' && customFormData.propertyType !== 'Other' && customFormData.toilets) {
                formData.append('toilets_count', customFormData.toilets);
            }
            if (propertyType === 'Flat' && customFormData.propertyType !== 'Other' && customFormData.toiletInterior) {
                formData.append('toilets_interior_required', customFormData.toiletInterior);
            }
            if (propertyType === 'Flat' && customFormData.propertyType !== 'Other' && customFormData.fallCeiling) {
                formData.append('fall_ceiling_requirement', customFormData.fallCeiling);
            }
            
            // For Villa/Bungalow
            if (propertyType === 'Individual villa/bungalow' && customFormData.villaAvgRoomSize) {
                formData.append('average_room_size', customFormData.villaAvgRoomSize);
            }
            if (propertyType === 'Individual villa/bungalow' && customFormData.villaToilets) {
                formData.append('toilets_count', customFormData.villaToilets);
            }
            if (propertyType === 'Individual villa/bungalow' && customFormData.villaToiletInterior) {
                formData.append('toilets_interior_required', customFormData.villaToiletInterior);
            }
            if (propertyType === 'Individual villa/bungalow' && customFormData.villaFallCeiling) {
                formData.append('fall_ceiling_requirement', customFormData.villaFallCeiling);
            }
            
            // For Office
            if (propertyType === 'Office' && customFormData.officeToilets) {
                formData.append('toilets_count', customFormData.officeToilets);
            }
            if (propertyType === 'Office' && customFormData.officeToiletInterior) {
                formData.append('toilets_interior_required', customFormData.officeToiletInterior);
            }
            if (propertyType === 'Office' && customFormData.officeFallCeiling) {
                formData.append('fall_ceiling_requirement', customFormData.officeFallCeiling);
            }
            
            // For Hotel (exclude Restaurant as it's handled separately)
            if (propertyType === 'Hotel' && customFormData.propertyType !== 'Restaurant' && customFormData.hotelAvgRoom) {
                formData.append('average_room_size', customFormData.hotelAvgRoom);
            }
            if (propertyType === 'Hotel' && customFormData.propertyType !== 'Restaurant' && customFormData.hotelToilets) {
                formData.append('toilets_count', customFormData.hotelToilets);
            }
            if (propertyType === 'Hotel' && customFormData.propertyType !== 'Restaurant' && customFormData.hotelToiletInterior) {
                formData.append('toilets_interior_required', customFormData.hotelToiletInterior);
            }
            if (propertyType === 'Hotel' && customFormData.propertyType !== 'Restaurant' && customFormData.hotelFallCeiling) {
                formData.append('fall_ceiling_requirement', customFormData.hotelFallCeiling);
            }
            if (customFormData.furnitureScope) {
                formData.append('furniture_scope', customFormData.furnitureScope);
            }
            if (customFormData.designPreferences) {
                formData.append('design_preferences', customFormData.designPreferences);
            }
            if (customFormData.budget) {
                formData.append('budget', customFormData.budget);
            }
            if (customFormData.message) {
                formData.append('additional_notes', customFormData.message);
            }

            // Property-specific fields
            if (propertyType === 'Flat' && customFormData.propertyType !== 'Other') {
                // Only use flat fields if original property type was Flat (not Other)
                if (customFormData.carpetArea) {
                    formData.append('carpet_area', customFormData.carpetArea);
                }
                if (customFormData.rooms) {
                    formData.append('number_of_rooms', customFormData.rooms);
                }
                if (customFormData.drawingDining) {
                    formData.append('drawing_dining_size', customFormData.drawingDining);
                }
                if (customFormData.kitchen) {
                    formData.append('kitchen_required', customFormData.kitchen);
                }
                if (customFormData.kitchenSize) {
                    formData.append('kitchen_size', customFormData.kitchenSize);
                }
            } else if (propertyType === 'Individual villa/bungalow') {
                if (customFormData.plotSize) {
                    formData.append('plot_size', customFormData.plotSize);
                }
                if (customFormData.villaRooms) {
                    formData.append('number_of_rooms', customFormData.villaRooms);
                }
                if (customFormData.livingDining) {
                    formData.append('living_dining_size', customFormData.livingDining);
                }
                if (customFormData.villaKitchen) {
                    formData.append('kitchen_required', customFormData.villaKitchen);
                }
                if (customFormData.villaKitchenSize) {
                    formData.append('kitchen_size', customFormData.villaKitchenSize);
                }
                if (customFormData.stairsDesign) {
                    formData.append('stairs_design', customFormData.stairsDesign);
                }
            } else if (propertyType === 'Office') {
                if (customFormData.officeSize) {
                    formData.append('total_size', customFormData.officeSize);
                }
                if (customFormData.closedCabins) {
                    formData.append('closed_cabins', customFormData.closedCabins);
                }
                if (customFormData.reception) {
                    formData.append('reception_requirement', customFormData.reception);
                }
                if (customFormData.receptionSize) {
                    formData.append('reception_size', customFormData.receptionSize);
                }
            } else if (propertyType === 'Hotel' && customFormData.propertyType !== 'Restaurant') {
                // Only use hotel fields if original property type was Hotel (not Restaurant)
                if (customFormData.hotelArea) {
                    formData.append('total_area', customFormData.hotelArea);
                }
                if (customFormData.hotelRooms) {
                    formData.append('total_rooms', customFormData.hotelRooms);
                }
                if (customFormData.hotelReception) {
                    formData.append('reception_requirement', customFormData.hotelReception);
                }
                if (customFormData.hotelReceptionSize) {
                    formData.append('reception_size', customFormData.hotelReceptionSize);
                }
            }

            const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/interior-custom-plan-submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status) {
                setCustomSubmitting(false);
                setCustomSuccess(true);
                setTimeout(() => {
                    closeCustomModal();
                }, 2000);
            } else {
                setCustomSubmitting(false);
                const errorMsg = result.message?.property_type?.[0] || result.message || 'Failed to submit request. Please try again.';
                alert(errorMsg);
            }
        } catch (err) {
            console.error('Error submitting custom interior form:', err);
            setCustomSubmitting(false);
            alert('Something went wrong. Please try again.');
        }
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

        const renderPropertySpecificFields = () => {
            const config = propertyFieldConfig[customFormData.propertyType] || [];
            return config.map((field) => (
                <div className="form-group" key={field.name}>
                    <label>{field.label}</label>
                    <input
                        type="text"
                        name={field.name}
                        className="form-control"
                        value={customFormData[field.name] || ''}
                        onChange={handleCustomFormChange}
                        required
                    />
                </div>
            ));
        };

        return (
            <>
                <SEO
                  titleExact
                  title="Buyer Enquiry Management - Infrio Properties"
                  description="Infrio Properties helps sellers manage buyer enquiries, follow-ups, enquiry status updates and property lead details in one real estate dashboard."
                  keywords="buyer enquiry management, property enquiry dashboard, real estate leads, property follow-ups, seller enquiry tools"
                  canonicalPath="/interior-design"
                />
                <Header2 />
                <div className="page-content">
                <Banner title={"Interior Design & Execution"} pagename="Service Detail" description="Our Love for Architecture
We are A Passionate Team Dedicated To Creating Stunning Architecture." bgimage={bnrimg}/>
                    {/* SECTION CONTENT START */}
                    <div className="section-full p-t80 mobile-page-padding">
                        <div className="container">
                            {/* GALLERY CONTENT START */}
                            <div className="row">
                                                <div className="col-lg-6 col-md-12">
                                                    <div className="sx-media">
                                                        <img 
                                                            src={require('./../../images//services/service-projects/2.jpg')} 
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
                                                        <h3 className="sx-tilte" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: 'clamp(15px, 2vw, 25px)' }}>
                                                            {"Interior Design & Execution"}
                                                        </h3>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', marginBottom: '15px',textAlign:"justify"  }}>
                                                            At Infrio, we design interiors that are not just beautiful to look at but also a joy to live and work in. Our approach to interior designing blends aesthetics, functionality, and comfort to create spaces that truly reflect your personality and purpose.
                                                        </p>
                                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333',textAlign:"justify"  }}>
                                                            From homes to offices, every design is tailored to the client's taste, lifestyle, and requirements. We focus on smart space utilization, innovative concepts, and practical detailing, ensuring every corner adds value.
                                                        </p>
                                                        <div
                                                            className="m-t20"
                                                            style={{
                                                                width: '100%',
                                                                display: 'block'
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="site-button btn-block"
                                                                onClick={toggleModal}
                                                                style={{
                                                                    padding: 'clamp(10px, 2.5vw, 14px) clamp(20px, 5vw, 32px)',
                                                                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                                                                    fontWeight: 600,
                                                                    borderRadius: 8,
                                                                    width: '100%',
                                                                    display: 'block',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    background: '#0f172a',
                                                                    color: '#fff',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                                                }}
                                                            >
                                                                Free Consultation
                                                            </button>
                                                        </div>
                                        </div>
                                        </div>
                                    </div>
                            

                            <div className="row">
                                <div className="col-lg-10 col-md-12">
                                    <div className="section-content">
                                        <div className="service-single-block m-b30">
                                         
                                            <h4 className="m-t30 sx-tilte">Our interior design services include:</h4>
                                            <div className="single-service-list">
                                                <div className="row">
                                                    <div className="col-lg-10 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                           
                                                            <li>3D Visualizations & Concepts – so you can see your space before it’s built</li>
                                                            <li>Detailed 2D Drawings – precise carpentry, furniture, and layout plans</li>
                                                             <li>Material & Color Selection – curated combinations for timeless appeal</li>
                                                            <li>Execution Support – ensuring designs are implemented as planned, Carpentry & Fitout Support</li>
                                                            {/* <li> Renovations Benefit of Service</li> */}
                                                        </ul>
                                                    </div>
                                                    {/* <div className="col-lg-6 col-md-12">
                                                        <ul className="list-angle-right anchor-line">
                                                            <li>{"Plumbing & Electrical Layouts \n  "}</li>
                                                            <li>On-Site Supervision & Quality Checks</li>
                                                            <li>Technical Guidance & Problem Solving</li>
                                                            <li> Historic Renovations and Restorations.</li> 
                                                             <li>Project on time and Latest Design</li> 
                                                        </ul>
                                                    </div> */}
                                                </div>
                                            </div>
                                            <p>With us, interiors aren't just about decoration — they're about creating an experience that inspires everyday living.</p>
                                            </div>
                                       
                                    </div>
                                </div>
                              
                            </div>
                            
                            {/* Banner Image */}
                            <div className="banner-section m-t30 m-b30" style={{ cursor: 'pointer', padding: '0 clamp(10px, 2vw, 0px)' }}>
                            <NavLink
                                to="/shop"
  
                            >
                                <img 
                                    src={require('./../../images/main-slider/slider2/Banner_2.jpeg')} 
                                    alt="Banner" 
                                    style={{
                                        width: "100%", 
                                        height: "clamp(200px, 40vw, 450px)", 
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        display: 'block'
                                    }}
                                />
                                </NavLink>
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
                                                           
                                                            <li>If you are interested in any of our services, Leave your enquiry or Contact us.</li>
                                                            <li>We will discuss the requirement and start working on your Space.</li>
                                                             <li>We will prepare the 3d plans and get it approved from you.</li>
                                                            <li>After 3d approval, 2d drawings will be provided.</li>
                                                            <li>Our Interior Charges start from as minimum as 5000/design.</li>
                                                            <li>Client can further discuss the with material execution for the project on turnkey basis.</li>
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
                    
                    <div className="section-full bg-white">
                                <div className="container">
                                    <div className="section-head">
                                        <div className="sx-separator-outer separator-left">
                                            <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg2 + ')' }}>
                                                <h3 className="sep-line-one">Interior Design Packages</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-b30">
                                        <div className="col-lg-12 text-center">
                                            <p className="m-b20" style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
                                                Design your House, Choose your designs from store….Wardrobe, Bed, Kitchen, TV Panel, Sofa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        {interiorPackages.map((pkg) => (
                                            <div className="col-lg-3 col-md-6 col-sm-12 m-b30" key={pkg.id}>
                                                <div className="sx-box bg-gray-light border-radius-10 shadow-sm h-100 d-flex flex-column">
                                                    <div className="p-a25 flex-grow-1 d-flex flex-column">
                                                        <h4 className="m-b10">{pkg.name}</h4>
                                                        <p className="text-primary m-b10" style={{ fontWeight: 600 }}>{pkg.price}</p>
                                                        <p className="text-muted m-b20">{pkg.tagline}</p>
                                                        <ul className="list-unstyled text-muted flex-grow-1">
                                                            {pkg.features.map((feature) => (
                                                                <li key={feature} className="m-b5"><i className="fa fa-check text-primary m-r5" /> {feature}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="p-a25">
                                                        <button className="site-button btn-block" onClick={() => handlePackageClick(pkg)}>
                                                            Choose Package
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="col-lg-3 col-md-6 col-sm-12 m-b30">
                                            <div className="sx-box bg-dark text-white border-radius-10 h-100 d-flex flex-column">
                                                <div className="p-a30 flex-grow-1">
                                                    <h4 className="m-b10 text-white">Custom Package</h4>
                                                    <p className="text-muted text-white">Share detailed requirements for bespoke interiors across residential, commercial or hospitality spaces.</p>
                                                    <ul className="list-unstyled text-white m-b20">
                                                        <li><i className="fa fa-check text-success m-r5" /> Room-wise detailing</li>
                                                        <li><i className="fa fa-check text-success m-r5" /> Furniture & décor preferences</li>
                                                        <li><i className="fa fa-check text-success m-r5" /> Budget & timeline planning</li>
                                                    </ul>
                                                </div>
                                                <div className="p-a25">
                                                    <button className="site-button-secondry btn-block" onClick={handleCustomClick}>
                                                        Create Custom Request
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
 <div className="section-full p-b80 column-grid-4 inner-page-padding">
                        <div className="container">
                            {/* Filter Nav START */}
                            <div className="filter-wrap p-b30 text-center">
                               
                                <ul className="filter-navigation masonry-filter clearfix">
                                   
                                                                <button className="btn from-top" onClick={(e) => {
                                                               e.preventDefault();
                                                               handleAllClick();
                                                             }}style={{color: label_id == 6 ? "#0f172a" : ""}}>
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
                             {"Interior Design & Execution"} → {subCategoryName}
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
                          border: i === currentPagePhotoIndex ? '2px solid #ff6b00' : '1px solid #333',
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
                {showPackageModal && (
                    <div
                        className="modal-overlay"
                        onClick={closePackageModal}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,2vw,20px)' }}
                    >
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: 'min(95vw, 520px)', padding: 'clamp(16px,3vw,32px)', position: 'relative' }}>
                            <button
                onClick={closePackageModal}
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
                            {packageSuccess ? (
                                <div className="text-center p-t30 p-b30">
                                    <i className="fa fa-check-circle text-success" style={{ fontSize: 48 }} />
                                    <h4 className="m-t20">Enquiry Submitted Successfully!</h4>
                                    <p className="m-t10">{packageSuccessMessage || 'Our team will share detailed pricing and timelines shortly.'}</p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="m-b10">Enquire for {selectedPackage?.name}</h4>
                                    <p className="text-muted m-b20">Fill the form and we will get back with a tailored interior proposal.</p>
                                    <form onSubmit={submitPackageForm}>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input type="text" className="form-control" name="name" value={packageFormData.name} onChange={handlePackageFormChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                autoComplete="tel"
                                                className="form-control"
                                                name="phone"
                                                placeholder="Digits only"
                                                maxLength={15}
                                                value={packageFormData.phone}
                                                onChange={handlePackageFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" className="form-control" name="email" value={packageFormData.email} onChange={handlePackageFormChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" className="form-control" name="city" value={packageFormData.city} onChange={handlePackageFormChange} required />
                                        </div>
                                        <button type="submit" className="site-button btn-block" disabled={packageSubmitting}>
                                            <span>{packageSubmitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {showCustomModal && (
                    <div
                        className="modal-overlay"
                        onClick={closeCustomModal}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,2vw,20px)' }}
                    >
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: 'min(95vw, 720px)', padding: 'clamp(16px,3vw,32px)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                            <button
                onClick={closeCustomModal}
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
                            {customSuccess ? (
                                <div className="text-center p-t30 p-b30">
                                    <i className="fa fa-check-circle text-success" style={{ fontSize: 48 }} />
                                    <h4 className="m-t20">Proposal Request Received</h4>
                                    <p>We will curate a custom interior proposal based on your inputs.</p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="m-b10">Custom Interior Proposal</h4>
                                    <p className="text-muted m-b20">Tell us more about your property and design preferences.</p>
                                    <form onSubmit={submitCustomForm}>
                                       
                                     
                                        <div className="form-group">
                                            <label>Property Type</label>
                                            <select name="propertyType" className="form-control" value={customFormData.propertyType} onChange={handleCustomFormChange}>
                                                {Object.keys(propertyFieldConfig).map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {renderPropertySpecificFields()}
                                        <div className="form-group">
                                            <label>Furniture Scope</label>
                                            <input type="text" name="furnitureScope" className="form-control" value={customFormData.furnitureScope} onChange={handleCustomFormChange} placeholder="Full furniture, modular kitchen, wardrobes, etc." />
                                        </div>
                                        <div className="form-group">
                                            <label>Design Preferences</label>
                                            <textarea name="designPreferences" rows="2" className="form-control" value={customFormData.designPreferences} onChange={handleCustomFormChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Budget (Approx.)</label>
                                            <input type="text" name="budget" className="form-control" value={customFormData.budget} onChange={handleCustomFormChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Additional Notes</label>
                                            <textarea name="message" rows="3" className="form-control" value={customFormData.message} onChange={handleCustomFormChange} />
                                        </div>
                                        <button type="submit" className="site-button btn-block" disabled={customSubmitting}>
                                            <span>{customSubmitting ? 'Submitting...' : 'Submit Custom Request'}</span>
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

export default withRouter(ServiceDetailInte);

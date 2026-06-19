import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home2 from './Pages/Home2';


import About1 from './Pages/About1';

import Services1 from './Pages/Services1';
import Services2 from './Pages/Services2';
import ServiceDetail from './Pages/ServiceDetail';
import ServiceDetailInte from './Pages/ServiceDetailInte';
import ServiceDetailT from './Pages/ServiceDetailT';
import ArchitectureLayoutLibrary from './Pages/ArchitectureLayoutLibrary';
import TurnkeyConstructionPlans from './Pages/TurnkeyConstructionPlans';

import Team1 from './Pages/Team1';
import Team2 from './Pages/Team2';
import TeamDetail from './Pages/TeamDetail';

import OurHistory from './Pages/OurHistory';
import FontIcons from './Pages/FontIcons';
import Error from './Pages/Error';

import ProjectGrid3 from './Pages/ProjectGrid3';
import ProjectGridNoGap3 from './Pages/ProjectGridNoGap3';
import ProjectGrid4 from './Pages/ProjectGrid4';
import ProjectGridNoGap4 from './Pages/ProjectGridNoGap4';
import ProjectGrid5 from './Pages/ProjectGrid5';
import ProjectGridNoGap5 from './Pages/ProjectGridNoGap5';

import ProjectMasonary3 from './Pages/ProjectMasonary3';
import ProjectMasonaryNoGap3 from './Pages/ProjectMasonaryNoGap3';
import ProjectMasonary4 from './Pages/ProjectMasonary4';
import ProjectMasonaryNoGap4 from './Pages/ProjectMasonaryNoGap4';
import ProjectMasonary5 from './Pages/ProjectMasonary5';
import ProjectMasonaryNoGap5 from './Pages/ProjectMasonaryNoGap5';

import ProjectCorousel from './Pages/ProjectCorousel';
import ProjectDetail1 from './Pages/ProjectDetail1';
import ProjectDetail2 from './Pages/ProjectDetail2';
import ShowcaseLanding from './Pages/ShowcaseLanding';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/ForgotPassword';
import SellerForgotPassword from './Pages/SellerForgotPassword';

import BlogGrid from './Pages/BlogGrid';
import BlogListing from './Pages/BlogListing';
import BlogMasonary from './Pages/BlogMasonary';
import BlogSingle from './Pages/BlogSingle';
import PostRightSidebar from './Pages/PostRightSidebar';

import Shop from './Pages/Shop';
import ShopGrid from './Pages/ShopGrid';
import ShopList from './Pages/ShopList';
import ShopDetail from './Pages/ShopDetail';
import ShopAccount from './Pages/ShopAccount';
import ShopCart from './Pages/ShopCart';
import ShopCheckout from './Pages/ShopCheckout';

import Faq from './Pages/Faq';
import ContactUs from './Pages/ContactUs';
import ScrollToTop from './Common/ScrollToTop';
import ProtectedRoute from './Common/ProtectedRoute';
import UserAccount from './Pages/UserAccount';
import PartnerAccount from './Pages/PartnerAccount';
import Sellers from './Pages/Sellers';
import PropertySellers from './Pages/PropertySellers';
import PropertySellerDetail from './Pages/PropertySellerDetail';
import SellerDetail from './Pages/SellerDetail';
import SellerServicePublicDetail from './Pages/SellerServicePublicDetail';
import Solutions from './Pages/Solutions';
import SolarCrm from './Pages/SolarCrm';
import { AuthProvider } from '../context/AuthContext';
import SellerRegistrationModal from './Elements/SellerRegistrationModal';
import SellerProtectedRoute from './Common/SellerProtectedRoute';
import SellerDashboard from './Pages/SellerDashboard';
import SellerLeads from './Pages/SellerLeads';
import SellerEnquiries from './Pages/SellerEnquiries';
import SellerEnquiryView from './Pages/SellerEnquiryView';
import SellerAccount from './Pages/SellerAccount';
import SellerChangePassword from './Pages/SellerChangePassword';
import SellerProfile from './Pages/SellerProfile';
import SellerStaff from './Pages/SellerStaff';
import SellerServices from './Pages/SellerServices';
import SellerServiceForm from './Pages/SellerServiceForm';
import SellerServiceView from './Pages/SellerServiceView';
import SellerCustomers from './Pages/SellerCustomers';
import SellerCustomerView from './Pages/SellerCustomerView';
import SellerPrivileges from './Pages/SellerPrivileges';
import SellerCustomerAdd from './Pages/SellerCustomerAdd';
import SellerCustomerEdit from './Pages/SellerCustomerEdit';
import SellerLeadStepMaster from './Pages/SellerLeadStepMaster';
import SellerFollowupDetail from './Pages/SellerFollowupDetail';
import SellerPackages from './Pages/SellerPackages';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsAndConditions from './Pages/TermsAndConditions';


class Components extends React.Component {
    render() {
        return (
            <BrowserRouter basename="/">
                <ScrollToTop />
                <AuthProvider>
                    <div className="page-wraper">
                        <Routes>
                            <Route path='/' element={<Home2/>} />
                            <Route path='/home-2' element={<Home2/>} />
                          

                            <Route path='/about-us' element={<About1/>} />

                            <Route path='/services-1' element={<Services1/>} />
                            <Route path='/services-2' element={<Services2/>} />
                            <Route path='/architecture-design' element={<ServiceDetail/>} />
                            <Route path='/architecture-layout-library' element={<ArchitectureLayoutLibrary/>} />
                            <Route path='/interior-design' element={<ServiceDetailInte/>} />
                            <Route path='/turnkey-construction' element={<ServiceDetailT/>} />
                            <Route path='/turnkey-construction-plans' element={<TurnkeyConstructionPlans/>} />

                            <Route path='/team-1' element={<Team1/>} />
                            <Route path='/team-2' element={<Team2/>} />
                            <Route path='/team-single' element={<TeamDetail/>} />

                            <Route path='/our-history' element={<OurHistory/>} />
                            <Route path='/icon-font' element={<FontIcons/>} />
                            <Route path='/error-404' element={<Error/>} />

                            <Route path='/project-grid-3-columns' element={<ProjectGrid3/>} />
                            <Route path='/project-grid-3-columns-no-gap' element={<ProjectGridNoGap3/>} />
                            <Route path='/social-media' element={<ProjectGrid4/>} />
                            <Route path='/project-grid-4-columns-no-gap' element={<ProjectGridNoGap4/>} />
                            <Route path='/showcase' element={<ShowcaseLanding/>} />
                            <Route path='/project-grid-5-columns' element={<ProjectGrid5/>} />
                            <Route path='/project-grid-5-columns-no-gap' element={<ProjectGridNoGap5/>} />

                            <Route path='/project-masonry-3-columns' element={<ProjectMasonary3/>} />
                            <Route path='/project-masonry-3-columns-no-gap' element={<ProjectMasonaryNoGap3/>} />
                            <Route path='/project-masonry-4-columns' element={<ProjectMasonary4/>} />
                            <Route path='/project-masonry-4-columns-no-gap' element={<ProjectMasonaryNoGap4/>} />
                            <Route path='/project-masonry-5-columns' element={<ProjectMasonary5/>} />
                            <Route path='/project-masonry-5-columns-no-gap' element={<ProjectMasonaryNoGap5/>} />

                            <Route path='/project-carousel' element={<ProjectCorousel/>} />
                            <Route path='/project-detail1' element={<ProjectDetail1/>} />
                            <Route path='/project-detail2' element={<ProjectDetail2/>} />
                            <Route path='/login' element={<Login/>} />
                            <Route path='/seller-login' element={<Login/>} />
                            <Route path='/register' element={<Register/>} />
                            <Route path='/seller-register' element={<Register/>} />
                            <Route path='/forgot-password' element={<ForgotPassword/>} />
                            <Route path='/seller-forgot-password' element={<SellerForgotPassword/>} />

                            <Route path='/blog' element={<BlogGrid/>} />
                            <Route path='/blog-listing' element={<BlogListing/>} />
                            <Route path='/blog-masonry' element={<BlogMasonary/>} />
                            <Route path='/blog-detail/:blogId' element={<BlogSingle/>} />
                            <Route path='/blog-detail' element={<BlogSingle/>} />
                            <Route path='/post-right-sidebar' element={<PostRightSidebar/>} />

                            <Route path='/properties' element={<Sellers/>} />
                            <Route path='/property-sellers' element={<PropertySellers/>} />
                            <Route path='/property-sellers/:sellerId' element={<PropertySellerDetail />} />
                            <Route path='/properties/:sellerId' element={<SellerDetail />} />
                            <Route path='/properties/:sellerId/services/:serviceId' element={<SellerServicePublicDetail />} />
                            <Route path='/sellers' element={<Navigate to="/properties" replace />} />
                            <Route path='/sellers/:sellerId' element={<SellerDetail />} />
                            <Route path='/sellers/:sellerId/services/:serviceId' element={<SellerServicePublicDetail />} />
                            <Route path='/services' element={<Solutions/>} />
                            <Route path='/solutions' element={<Navigate to="/services" replace />} />
                            <Route path='/solar-crm' element={<SolarCrm />} />
                            <Route path='/property-seller-packages' element={<SellerPackages />} /> 
                            <Route path='/privacy-policy' element={<PrivacyPolicy />} />  
                            <Route path='/terms-conditions' element={<TermsAndConditions />} />
                            <Route
                              path='/seller-dashboard'
                              element={
                                <SellerProtectedRoute permissions={["Dashboard.Manage"]}>
                                  <SellerDashboard />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-leads'
                              element={
                                <SellerProtectedRoute permissions={["Leads.Manage", "Leads.View"]}>
                                  <SellerLeads />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-enquiries'
                              element={
                                <SellerProtectedRoute permissions={["Enquiry.Manage"]}>
                                  <SellerEnquiries />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-enquiries/:id'
                              element={
                                <SellerProtectedRoute permissions={["Enquiry.View"]}>
                                  <SellerEnquiryView />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-account'
                              element={
                                <SellerProtectedRoute>
                                  <SellerAccount />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-change-password'
                              element={
                                <SellerProtectedRoute>
                                  <SellerChangePassword />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-profile'
                              element={
                                <SellerProtectedRoute>
                                  <SellerProfile />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-staff'
                              element={
                                <SellerProtectedRoute permissions={["Staff.Manage"]}>
                                  <SellerStaff />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-services'
                              element={
                                <SellerProtectedRoute permissions={["Services.Manage"]}>
                                  <SellerServices />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-services/new'
                              element={
                                <SellerProtectedRoute permissions={["Services.Add"]}>
                                  <SellerServiceForm />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-services/:id/edit'
                              element={
                                <SellerProtectedRoute permissions={["Services.Edit"]}>
                                  <SellerServiceForm />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-services/:id'
                              element={
                                <SellerProtectedRoute permissions={["Services.View"]}>
                                  <SellerServiceView />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-customers'
                              element={
                                <SellerProtectedRoute permissions={["SolarCRM.Manage"]}>
                                  <SellerCustomers />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-customers/new'
                              element={
                                <SellerProtectedRoute permissions={["SolarCRM.Lead.Add"]}>
                                  <SellerCustomerAdd />
                                </SellerProtectedRoute>
                              }
                            />
                            <Route
                              path='/seller-customers/:id'
                              element={
                                <SellerProtectedRoute permissions={["SolarCRM.View"]}>
                                  <SellerCustomerView />
                                </SellerProtectedRoute>
                              }
                            />

<Route path="/seller-customers/:id/edit" element={<SellerProtectedRoute permissions={["SolarCRM.Edit"]}><SellerCustomerEdit /></SellerProtectedRoute>} />

                            <Route
                              path='/seller-privileges'
                              element={
                                <SellerProtectedRoute permissions={["Role.Permission", "Privilege.Permission"]}>
                                  <SellerPrivileges />
                                </SellerProtectedRoute>
                              }
                            />

                            <Route
                              path='/seller-lead-step-master'
                              element={
                                <SellerProtectedRoute permissions={["Role.Permission", "Privilege.Permission"]}>
                                  <SellerLeadStepMaster />
                                </SellerProtectedRoute>
                              }
                            />

                            <Route
                              path='/seller-followups/:id'
                              element={
                                <SellerProtectedRoute permissions={["Dashboard.Manage"]}>
                                  <SellerFollowupDetail />
                                </SellerProtectedRoute>
                              }
                            />

                            <Route path='/shop' element={<ProtectedRoute><Shop/></ProtectedRoute>} />
                            <Route path='/shop-grid' element={<ShopGrid/>} />
                            <Route path='/shop-list' element={<ShopList/>} />
                            <Route path='/shop-detail' element={<ShopDetail/>} />
                            <Route path='/shop-account' element={<ShopAccount/>} />
                            <Route path='/shop-cart' element={<ShopCart/>} />
                            <Route path='/shop-checkout' element={<ShopCheckout/>} />

                            <Route path='/faq' element={<Faq/>} />
                            <Route path='/contact-us' element={<ContactUs/>} />
                            
                            <Route path='/user-account' element={<UserAccount/>} />
                            <Route path='/partner-account' element={<PartnerAccount/>} />
                            
                            <Route path='*' element={<Error/>} />
                        </Routes>
                        <SellerRegistrationModal />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        );
    };
};

export default Components;

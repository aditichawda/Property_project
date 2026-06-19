import React from 'react';
import Header2 from './../Common/Header2';
import Footer from './../Common/Footer';
import SEO from './../Common/SEO';
import Banner from './../Elements/Banner';
import WhatWeDo6 from './../Elements/WhatWeDo6';
import Services6 from './../Elements/Services6';
import Services7 from './../Elements/Services7';
import ClientsLogo2 from './../Elements/ClientsLogo2';
import Services1 from './../Elements/Services1';
import { NavLink } from 'react-router-dom';
import Header4 from './../Common/Header4';
import ConsultationModal from '../Elements/ConsultationModal';
import Footer2 from '../Common/Footer2';
var bgimg1 = require('./../../images/background/bg-1.jpg');
var bnrimg = require('./../../images/banner/6.jpg');

class Service1 extends React.Component {
constructor(props) {
    super(props);
    this.state = {
         isOpen: false,
      showModal: false,
      formData: {
        name: "",
        phone: "",
        email: "",
        service: [],
        city: "",
        message: "",
      }
    //  this.openModal = this.openModal.bind(this)
    };
  }
          openModal() {
        this.setState({ isOpen: true })
    }
    toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };
   resetForm = () => {
      this.setState({formData:{ name: "", phone: "", email: "", service: [], city: "", message: "" }});
    }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      formData: { ...prev.formData, [name]: value }
    }));
  };

  handleServiceCheckbox = (e) => {
    const { value, checked } = e.target;
    this.setState((prev) => {
      let services = [...prev.formData.service];
      if (checked) {
        services.push(value);
      } else {
        services = services.filter((s) => s !== value);
      }
      return { formData: { ...prev.formData, service: services } };
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", this.state.formData);
    this.toggleModal();
  };

    render() {

        return (
            <>
                <SEO
                  titleExact
                  title="Infrio Properties Services - Listings, Sellers and Enquiries"
                  description="Explore Infrio Properties services for property sellers and buyers, including listing tools, enquiry management, seller dashboards and real estate marketplace support."
                  keywords="property services, property listings, seller dashboard, buyer enquiries, real estate marketplace, property seller tools"
                  canonicalPath="/services"
                />
                <Header2 />
                <div className="page-content">
                    <Banner title="All Services" pagename="Services" description="Our Love for Architecture
We are A Passionate Team Dedicated To Creating Stunning Architecture." bgimage={bnrimg}/>
                    {/* <WhatWeDo6 /> */}
                     <Services1 />
                    {/* <Services6 /> */}
                                                        <div className='p-t50 p-b50'>

                    <Services7 />
                    </div>
                 <div className="section-full overlay-wraper sx-bg-secondry mobile-page-padding p-t80 p-b50 bg-parallax ml-auto m-b50" data-stellar-background-ratio="0.5" style={{ backgroundImage: 'url(' + bgimg1 + ')', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                        <div className="overlay-main bg-black opacity-05" />
                                        <div className="container">
                                            <div className="section-content">
                                                 <div className="counter-blocks-CTA text-center">
                                                {/* <div  style={{ zIndex: 10, color: '#fff', fontFamily: '"Poppins", sans-serif' }}>Modish</div> */}
                                                                                    {/* LAYER 4  Bold Title*/}
                                                                                    <div style={{ zIndex: 10, textTransform: 'uppercase', whiteSpace: 'normal', fontWeight: 800, color: '#fff', fontFamily: '"Poppins", sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '20px' }}>Join us in inspiring dialogue</div>
                                                                                    {/* LAYER 5  Paragraph*/}
                                                                                    <div  style={{ zIndex: 10, whiteSpace: 'normal', color: '#fff', fontFamily: '"Poppins", sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: '1.6', maxWidth: '800px', marginBottom: '30px', margin: '0 auto 30px auto' }}>Excited to meet you in person! Come visit us at our office to discuss your new design. We re looking forward to connecting face-to-face. See you soon</div>
                                                                                    {/* LAYER 6  Read More*/}
                                                                                    <div style={{ zIndex: 9 }}><NavLink onClick={this.toggleModal}  className="site-button btn-half"><span>Get a Free Consultation</span></NavLink></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                    {/* <ClientsLogo2 bgcolor="bg-gray" /> */}
                </div>
                 <ConsultationModal
          show={this.state.showModal}
          toggleModal={this.toggleModal}
          formData={this.state.formData}
          onResetForm={this.resetForm}
          handleChange={this.handleChange}
          handleServiceCheckbox={this.handleServiceCheckbox}
          handleSubmit={this.handleSubmit}
        />
                <Footer2 />
            </>
        );
    };
};

export default Service1;

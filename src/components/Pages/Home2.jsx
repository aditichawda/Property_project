import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Slider2 from "./../Elements/Slider2";
import About2 from "./../Elements/About2";
import WhatWeDo1 from "./../Elements/WhatWeDo1";
import SellerPackageSection from "./../Elements/SellerPackageSection";
import Team3 from "./../Elements/Team3";
import Blog1 from "./../Elements/Blog1";
import Statistics1 from "./../Elements/Statistics1";
import Testimonials2 from "./../Elements/Testimonials2";
import Team1 from "./../Elements/Team1";
import { NavLink } from "react-router-dom";
import ConsultationModal from "../Elements/ConsultationModal";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { PROPERTY_IMAGES } from "../../data/propertyImages";
var founderImg = require("./../../images/our-team5/r2.jpg");
var coFounderImg = require("./../../images/our-team5/p1.jpg");
class Home2 extends React.Component {
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
      },
      //  this.openModal = this.openModal.bind(this)
    };
  }
  componentDidMount() {
    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = src;
        script.addEventListener("load", function () {
          resolve();
        });
        script.addEventListener("error", function (e) {
          reject(e);
        });
        document.body.appendChild(script);
        document.body.removeChild(script);
      });
    }

    loadScript("./assets/js/custom.js");
  }
  openModal() {
    this.setState({ isOpen: true });
  }
  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };
  resetForm = () => {
    this.setState({
      formData: {
        name: "",
        phone: "",
        email: "",
        service: [],
        city: "",
        message: "",
      },
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      formData: { ...prev.formData, [name]: value },
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
          title="Property Sale & Buy Marketplace | Infrio Properties"
          description="Buy, sell, and discover properties with Infrio's Property Sale & Buy Marketplace. Connect buyers and sellers through a trusted, transparent, and enquiry-driven real estate platform for residential, commercial, and investment properties."
          canonicalPath="/"
          keywords="Property Sale & Buy Marketplace, buy property online, sell property online, real estate marketplace, property listing platform, property buying platform, property dealers near me, land for sale, online property marketplace."
        />
        <Header2 />
        <div className="page-content">
          <Slider2 />
          <About2 />
          {/* <Services2 /> */}
          {/* <WhatWeDo2 /> */}
          <Team3 />
          <SellerPackageSection />
          <WhatWeDo1 />
          {/* <Projects2 />  */}

          <Statistics1 />
          {/* <div className="section-full p-t50 bg-white">
            <div className="container">
              <div className="section-head">
                <div className="sx-separator-outer separator-center">
                  <div
                    className="sx-separator bg-white bg-moving bg-repeat-x"
                    style={{
                      backgroundImage:
                        "url(" +
                        require("./../../images/background/cross-line2.png") +
                        ")",
                    }}
                  >
                    <h3 className="sep-line-one">Leadership Team</h3>
                  </div>
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-lg-5 col-md-6 col-sm-12 m-b30">
                  <div className="our-team-2 shadow-sm h-100">
                    <div
                      className="profile-image"
                      style={{
                        width: "100%",
                        height: "320px",
                        overflow: "hidden",
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      <img
                        src={founderImg}
                        alt="Founder"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="figcaption text-black p-a25">
                      <h4 className="m-t0">Rajesh Malav</h4>
                      <span
                        className="m-b15 d-block text-primary text-uppercase"
                        style={{ letterSpacing: "1px", fontWeight: 600 }}
                      >
                        Founder &amp; Director
                      </span>
                      <p className="text-muted" style={{ lineHeight: 1.7 }}>
                        With over 15 years of experience in architecture and
                        turnkey construction, Rajesh leads Infrio’s vision of
                        crafting functional, future-ready spaces.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 col-md-6 col-sm-12 m-b30">
                  <div className="our-team-2 shadow-sm h-100">
                    <div
                      className="profile-image"
                      style={{
                        width: "100%",
                        height: "320px",
                        overflow: "hidden",
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      <img
                        src={coFounderImg}
                        alt="Co-Founder"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="figcaption text-black p-a25">
                      <h4 className="m-t0">Pooja Malav</h4>
                      <span
                        className="m-b15 d-block text-primary text-uppercase"
                        style={{ letterSpacing: "1px", fontWeight: 600 }}
                      >
                        Head of Architect & Interior Designing
                      </span>
                      <p className="text-muted" style={{ lineHeight: 1.7 }}>
                        Pooja Malav, a Civil Engineering graduate from GSITS
                        Indore, drives the design language at Infrio, blending
                        aesthetics with practicality to deliver immersive
                        interior experiences for every client.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          {/* <Team2 /> */}
          {/* <Team1 /> */}
          <Blog1 />

          <div
            className="section-full overlay-wraper sx-bg-secondry mobile-page-padding p-t80 p-b50 bg-parallax ml-auto"
            data-stellar-background-ratio="0.5"
            style={{
              backgroundImage: "url(" + PROPERTY_IMAGES.ctaBg1 + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="overlay-main bg-black opacity-05" />
            <div className="container">
              <div className="section-content">
                <div className="counter-blocks-CTA text-center">
                  {/* <div  style={{ zIndex: 10, color: '#fff', fontFamily: '"Poppins", sans-serif' }}>Modish</div> */}
                  {/* LAYER 4  Bold Title*/}
                  <div
                    style={{
                      zIndex: 10,
                      textTransform: "uppercase",
                      whiteSpace: "normal",
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: "clamp(1.5rem, 4vw, 2rem)",
                      marginBottom: "20px",
                    }}
                  >
                    Join us in inspiring dialogue
                  </div>
                  {/* LAYER 5  Paragraph*/}
                  <div
                    style={{
                      zIndex: 10,
                      whiteSpace: "normal",
                      color: "#fff",
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                      lineHeight: "1.6",
                      maxWidth: "800px",
                      marginBottom: "30px",
                      margin: "0 auto 30px auto",
                    }}
                  >
                    Excited to meet you in person! Come visit us at our office
                    to discuss your new design. We re looking forward to
                    connecting face-to-face. See you soon
                  </div>
                  {/* LAYER 6  Read More*/}
                  <div style={{ zIndex: 9 }}>
                    <NavLink
                      onClick={this.toggleModal}
                      className="site-button btn-half"
                    >
                      <span>Get a Free Consultation</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Testimonials2 separatoralignment="separator-center" />
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
  }
}

export default Home2;

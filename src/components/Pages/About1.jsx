import React from "react";
import Header2 from "./../Common/Header2";
import SEO from "./../Common/SEO";
import Banner from "./../Elements/Banner";
import About2 from "./../Elements/About2";
import About3 from "../Elements/About3";
import About4 from "../Elements/About4";
import Team1 from "./../Elements/Team1";

import Testimonials2 from "./../Elements/Testimonials2";
import Footer2 from "../Common/Footer2";
import SellerPackageSection from "../Elements/SellerPackageSection";

var bnrimg = require("./../../images/property/3.jpg");
var founderImg = require("./../../images/our-team5/r2.jpg");
var coFounderImg = require("./../../images/our-team5/p1.jpg");

class About1 extends React.Component {
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
  render() {
    return (
      <>
        <SEO
          titleExact
          title="About Infrio Property Marketplace | Smart Real Estate Solutions"
          description="Infrio provides a secure and user-friendly property marketplace for buyers and sellers. Discover property listings, advanced search filters, enquiry management, and smart real estate solutions for residential, commercial, and investment properties."
          keywords="real estate marketplace, property listing platform, buy and sell property, online property marketplace, property management services, property search platform, real estate solutions, residential property marketplace, commercial property marketplace, property buying platform, property selling platform, real estate portal India."
          canonicalPath="/about-us"
        />
        <Header2 />
        <div className="page-content">
          <Banner
            title="About Infrio"
            pagename="About 1"
            description="A property marketplace for buyers, sellers, listings and direct enquiries."
            bgimage={bnrimg}
          />
          <About2 />
          <SellerPackageSection />

          <About3 bgcolor="bg-gray" />
          <About4 bgcolor="bg-gray" />
          {/* <WhatWeDo6 /> */}
          {/* <Achievements1 /> */}
          {/* <div className="section-full bg-white">
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
          {/* <Testimonials2 separatoralignment="separator-center" /> */}
        </div>

        <Footer2 />
      </>
    );
  }
}

export default About1;

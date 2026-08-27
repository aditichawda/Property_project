import React from "react";
import { NavLink } from "react-router-dom";
import ReactPlayer from "react-player";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { PROPERTY_IMAGES } from "../../data/propertyImages";

class About3 extends React.Component {
  render() {
    return (
      <>
        <div
          className={`${this.props.bgcolor} section-full mobile-page-padding p-t80 p-b50`}
        >
          <div className="container">
            <div className="section-content">
              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-12">
                  <div className="about-home-3 m-b30 bg-white">
                    <h3 className="m-t0 m-b20 sx-tilte">
                      Our services include:
                    </h3>
                    <p>
                      At Infrio Property Marketplace, we are committed to
                      delivering a seamless and reliable real estate experience
                      for both property buyers and sellers. Our platform is
                      designed with a client-first approach, combining
                      technology, user-friendly design, and transparency to
                      simplify property discovery and management.
                    </p>
                    <ul className="list-angle-right anchor-line">
                      {/* <li><NavLink  to={"/architecture-design"} state={{ id: 5}}>Architectural Design & Planning.</NavLink></li>
                                            <li><NavLink to={"/interior-design"} state={{ id: 6}}>Interior Design & Execution.</NavLink></li>
                                            <li><NavLink to={"/turnkey-construction"} state={{ id: 8}}>Turnkey Construction Projects.</NavLink></li> */}
                      <li>
                        <b>Property Listing & Showcase</b>
                      </li>
                      <li>
                        <b>Property Search & Advanced Filtering</b>
                      </li>
                      <li>
                        <b>Buy & Sale Property Management</b>
                      </li>
                      <li>
                        <b>Property Enquiry & Lead Management</b>
                      </li>
                    </ul>
                    <p>
                      What sets us apart is our focus on providing a secure,
                      easy-to-use, and enquiry-driven property marketplace.
                      Whether users are searching for residential, commercial,
                      or investment propertie
                    </p>
                    {/* <div className="text-left">
                                            <NavLink  className="site-button btn-half"><span>Read More</span></NavLink>
                                        </div> */}
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12">
                  <div className="video-section-full-v2">
                    <div
                      className="video-section-full bg-no-repeat bg-cover bg-center overlay-wraper m-b30"
                      style={{
                        backgroundImage: "url(" + PROPERTY_IMAGES.hero2 + ")",
                      }}
                    >
                      <div className="overlay-main bg-black opacity-04" />
                      <div className="video-section-inner">
                        <div className="video-section-content">
                          <NavLink
                            to={"#"}
                            className="play-now"
                            data-toggle="modal"
                            data-target="#myModal"
                          >
                            <i className="icon fa fa-play" />
                            <span className="ripple" />
                          </NavLink>

                          <div className="video-section-bottom">
                            <h3 className="sx-title text-white">
                              25 Years
                              <br />
                              Experience
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal fade" id="myModal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <ReactPlayer url="https://vimeo.com/34741214" />
            </div>
          </div>
        </div>
        <div
          className={`${this.props.bgcolor} section-full mobile-page-padding p-t80 p-b50`}
        >
          <div className="container">
            <div className="section-content">
              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-12">
                  <div className="video-section-full-v2">
                    <div
                      className="video-section-full bg-no-repeat bg-cover bg-center overlay-wraper m-b30"
                      style={{
                        backgroundImage: "url(" + PROPERTY_IMAGES.hero5 + ")",
                      }}
                    >
                      
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12">
                  <div className="about-home-3 m-b30 bg-white">
                    <h3 className="m-t0 m-b20 sx-tilte">Our Mission:</h3>
                    <p>
                      To simplify property transactions by offering a trusted
                      platform where people can discover genuine opportunities,
                      connect with the right buyers or sellers, and access
                      expert guidance whenever needed.
                    </p>
                    <ul className="list-angle-right anchor-line">
                      {/* <li><NavLink  to={"/architecture-design"} state={{ id: 5}}>Architectural Design & Planning.</NavLink></li>
                                            <li><NavLink to={"/interior-design"} state={{ id: 6}}>Interior Design & Execution.</NavLink></li>
                                            <li><NavLink to={"/turnkey-construction"} state={{ id: 8}}>Turnkey Construction Projects.</NavLink></li> */}
                      <li>
                        <b>Verified and genuine property listings</b>
                      </li>
                      <li>
                        <b>Easy property search and enquiry process</b>
                      </li>
                      <li>
                        <b>Direct buyer and seller connections</b>
                      </li>
                      <li>
                        <b>Professional real estate support</b>
                      </li>
                      <li>
                        <b>Integrated architecture, design, and construction expertise</b>
                      </li>
                      <li>
                        <b>Transparent and customer-focused approach</b>
                      </li>
                    </ul>
                    <p>
                      At <b>Infrio Properties</b>, we are not just listing properties—we are helping people build their future with confidence.
                    </p>
                    <p style={{ fontWeight: 700, color: "#000" }}>
                      Buy | Sell | Relax
                    </p>
                    {/* <div className="text-left">
                                            <NavLink  className="site-button btn-half"><span>Read More</span></NavLink>
                                        </div> */}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default About3;

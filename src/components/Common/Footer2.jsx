import React from "react";
import { NavLink } from "react-router-dom";
import Switcher from "../Elements/Switcher";

var bnr = require("./../../images/property/home4.jpg");

class Footer2 extends React.Component {
  render() {
    return (
      <>
        <footer className="site-footer footer-large footer-dark footer-wide">
          {/* FOOTER BLOCKES START */}
          <div
            className="footer-top overlay-wraper bg-cover"
            style={{ backgroundImage: "url(" + bnr + ")" }}
          >
            <div className="overlay-main sx-bg-secondry opacity-08" />
            <div className="container">
              <div className="row">
                {/* ABOUT COMPANY */}
                <div className="col-lg-4 col-md-6 col-sm-6">
                  <div className="widget widget_about">
                    {/*<h4 class="widget-title">About Company</h4>*/}
                    <div className="logo-footer clearfix p-b15">
                      <NavLink to={"./"}>
                        <img
                          src={require("./../../images/Infrio_Properties.png")}
                          alt="Inteshape"
                        />
                      </NavLink>
                    </div>
                    <p>Plain I Find I Sell </p>
                    <p
                      style={{ whiteSpace: "pre-line" }}
                    >{`We are a passionate team dedicated to connecting buyers, sellers, and renters with their perfect property.`}</p>
                    <div className="footer-social-round">
                      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <i className="fa fa-facebook" />
                      </a>
                      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <i className="fa fa-instagram" />
                      </a>
                      <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <i className="fa fa-linkedin" />
                      </a>
                      <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <i className="fa fa-youtube-play" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* RESENT POST */}
                {/* <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="widget recent-posts-entry-date">
                                        <h5 className="widget-title">Resent Post</h5>
                                        <div className="widget-post-bx">
                                            <div className="widget-post clearfix">
                                                <div className="sx-post-date text-center text-uppercase text-white">
                                                    <strong className="p-date">15</strong>
                                                    <span className="p-month">Sep</span>
                                                    <span className="p-year">2022</span>
                                                </div>
                                                <div className="sx-post-info">
                                                    <div className="sx-post-header">
                                                        <h6 className="post-title"><NavLink to={"/blog-single"}>On these beams, we’re.</NavLink></h6>
                                                    </div>
                                                    <div className="sx-post-meta">
                                                        <ul>
                                                            <li className="post-author"><i className="fa fa-user" />By Admin</li>
                                                            <li className="post-comment"><i className="fa fa-comments" /> 28</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="widget-post clearfix">
                                                <div className="sx-post-date text-center text-uppercase text-white">
                                                    <strong className="p-date">17</strong>
                                                    <span className="p-month">Sep</span>
                                                    <span className="p-year">2022</span>
                                                </div>
                                                <div className="sx-post-info">
                                                    <div className="sx-post-header">
                                                        <h6 className="post-title"><NavLink to={"/blog-single"}>We’ll be a sensation for</NavLink></h6>
                                                    </div>
                                                    <div className="sx-post-meta">
                                                        <ul>
                                                            <li className="post-author"><i className="fa fa-user" />By Admin</li>
                                                            <li className="post-comment"><i className="fa fa-comments" /> 29</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="widget-post clearfix">
                                                <div className="sx-post-date text-center text-uppercase text-white">
                                                    <strong className="p-date">18</strong>
                                                    <span className="p-month">Sep</span>
                                                    <span className="p-year">2022</span>
                                                </div>
                                                <div className="sx-post-info">
                                                    <div className="sx-post-header">
                                                        <h6 className="post-title"><NavLink to={"/blog-single"}>We’ll be a sensation for</NavLink></h6>
                                                    </div>
                                                    <div className="sx-post-meta">
                                                        <ul>
                                                            <li className="post-author"><i className="fa fa-user" />By Admin</li>
                                                            <li className="post-comment"><i className="fa fa-comments" /> 29</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                {/* USEFUL LINKS */}
                <div className="col-lg-4 col-md-6 col-sm-6 footer-col-3">
                  <div className="widget widget_services inline-links">
                    <h5 className="widget-title">Useful links</h5>
                    <ul>
                      <li>
                        <NavLink to={"/"}>Home</NavLink>
                      </li>
                      <li>
                        <NavLink to={"/about-us"}>About</NavLink>
                      </li>
                      <li>
                        <NavLink to={"/property-sellers"}>
                          Property Seller
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to={"/properties"}>Properties</NavLink>
                      </li>
                       <li>
                       <NavLink to={"/property-seller-packages"}>Property Packages</NavLink>
                       </li>
                      <li>
                        <NavLink to={"/blog"}>Blog</NavLink>
                      </li>
                      <li>
                        <NavLink to={"/contact-us"}>Contact Us</NavLink>
                      </li>
                      {/* <li>
                        <NavLink to={"/seller-login"}>Seller Login</NavLink>
                      </li>
                      <li>
                        <NavLink to={"/seller-register"}>Seller Register</NavLink>
                      </li> */}
                    </ul>
                  </div>
                </div>
                {/* CONTACT US */}
                <div className="col-lg-4 col-md-6 col-sm-6">
                  <div className="widget widget_address_outer">
                    <h5 className="widget-title">Contact Us</h5>
                    <ul className="widget_address">
                      <li>1st floor, Above Swastik Plywood, 27, New Grain Mandi, Kota, 324005</li>
                      <li>properties@infrioindia.com</li>
                      <li>(+91) 900-1457-000</li>
                      <li>(+91) 785-1820-559</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="call-to-action-wrap">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div className="call-to-action-left">
                      <h5 className="text-uppercase m-b10 m-t0">
                        Subscribe to our YouTube channel!
                      </h5>
                      <span>
                        Never miss property updates, seller tips, and Infrio
                        marketplace news.
                      </span>
                    </div>
                  </div>
                  {/* <div className="col-lg-5 col-md-6">
                                        <div className="call-to-action-right">
                                            <div className="widget_newsletter">
                                                <div className="newsletter-bx">
                                                    <form role="search" method="post" action="">
                                                        <div className="input-group">
                                                            <input name="news-letter" className="form-control" placeholder="ENTER YOUR EMAIL" type="text" />
                                                            <span className="input-group-btn">
                                                                <button type="button" className="site-button"><i className="fa fa-paper-plane-o" /></button>
                                                            </span>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                </div>
              </div>
            </div>
          </div>
          {/* FOOTER COPYRIGHT */}
          <div className="footer-bottom overlay-wraper">
            <div className="overlay-main" />
            <div className="container">
              <div className="row justify-content-between">
                <div className="sx-footer-bot-left">
                  <span className="copyrights-text">
                    © 2025 Your Company. Designed By{" "}
                    <a
                      href="https://www.ampleebusiness.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-credit-link"
                    >
                      Ample eBusiness
                    </a>
                  </span>
                </div>
                <div className="sx-footer-bot-right">
                <a href="/privacy-policy" className="copyrights-text">
                    Privacy Policy
                </a>
                <span className="mx-2">|</span>
                <a href="/terms-conditions" className="copyrights-text">
                    Terms & Conditions
                </a>
            </div>
              </div>
            </div>
          </div>
        </footer>
        <Switcher />
      </>
    );
  }
}

export default Footer2;

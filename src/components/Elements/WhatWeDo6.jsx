import React from 'react';
import { NavLink } from 'react-router-dom';

var bgimg1 = require('./../../images/background/bg-5.png');
var bgimg2 = require('./../../images/background/bg-5.png');
var bgimg3 = require('./../../images/background/cross-line2.png');

class WhatWeDo6 extends React.Component {
    render() {
        return (
            <>
                <div className="section-full  mobile-page-padding bg-white  p-t80 p-b30 bg-repeat overflow-hide" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                    <div className="container right-half-bg-image-outer">
                        <div className="right-half-bg-image bg-parallax bg-fixed bg-top-right" data-stellar-background-ratio={0} style={{ backgroundImage: 'url(' + bgimg2 + ')' }} />
                        {/* TITLE START */}
                        {/* <div className="section-head">
                            <div className="sx-separator-outer separator-left">
                                <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg3 + ')' }}>
                                    <h3 className="sep-line-one">What We do</h3>
                                </div>
                            </div>
                        </div> */}
                          <div className="section-head">
                                                    <div className="sx-separator-outer separator-center">
                                                        <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                                                            <h3 className="sep-line-one">What We Do</h3>
                                                        </div>
                                                    </div>
                                                </div>
                        {/* TITLE END */}
                        <div className="section-content">
                            <div className="row number-block-one-outer justify-content-center">
                                <div className="col-lg-4 col-md-6 col-sm-6 m-b30">
                                    <div className="number-block-one animate-in-to-top">
                                        <NavLink to={"/architecture-design"}  state={{ id: 5}} className="sx-text-black">
                                        <img src={require('./../../images//services/service-projects/1.jpg')} alt="" />
                                        <div className="figcaption bg-white text-center p-a20">
                                            <h4 className="m-a0"> <NavLink to={"/architecture-design"}  state={{ id: 5}} className="sx-text-black"> Architectural Design & Planning </NavLink></h4>
                                        </div>
                                        <div className="figcaption-number text-center sx-text-primary animate-in-to-top-content">
                                            <span>01</span>
                                        </div>
                                        </NavLink>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6 m-b30">
                                    <div className="number-block-one animate-in-to-top">
                                        <NavLink to={"/interior-design"}  state={{ id: 6}} className="sx-text-black"> 
                                        <img src={require('./../../images//services/service-projects/2.jpg')} alt="" />
                                        <div className="figcaption bg-white text-center p-a20">
                                            <h4 className="m-a0">  <NavLink to={"/interior-design"}  state={{ id: 6}} className="sx-text-black">   Interior Design & Execution </NavLink></h4>
                                        </div>
                                        <div className="figcaption-number text-center sx-text-primary animate-in-to-top-content">
                                            <span>02</span>
                                        </div>
                                        </NavLink>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6 m-b30">
                                    <div className="number-block-one animate-in-to-top">
                                        <NavLink to={"/turnkey-construction"}  state={{ id: 8}} className="sx-text-black">
                                        <img src={require('./../../images//services/service-projects/3.jpg')} alt="" />
                                        <div className="figcaption bg-white text-center p-a20">
                                            <h4 className="m-a0">  <NavLink to={"/turnkey-construction"}  state={{ id: 8}} className="sx-text-black"> Turnkey Construction Projects </NavLink> </h4>
                                        </div>
                                        <div className="figcaption-number text-center sx-text-primary animate-in-to-top-content">
                                            <span>03</span>
                                        </div>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default WhatWeDo6;
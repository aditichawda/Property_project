import React from 'react';
import { SOLAR_IMAGES } from '../../data/solarImages';

class About6 extends React.Component {
    render() {
        return (
            <>
                <div className="section-full mobile-page-padding p-t80 bg-gray">
                        <div className="container">
                            <div className="section-content">
                                <div className="row">
                                    <div className="col-xl-5 col-lg-5 col-md-12 ">
                                        <div className="home-2-about bg-bottom-left bg-no-repeat bg-cover" style={{ backgroundImage: 'url(' + SOLAR_IMAGES.solutionsRightBg + ')' }}>
                                        </div>
                                    </div>
                                    <div className="col-xl-7 col-lg-7 col-md-12">
                                        <div className="about-home-2">
                                            <h3 className="m-t0 sx-tilte">Plan I Build I Design</h3>
                                            <p>At Infrio, we believe that every space tells a story — and we are here to design and build it with precision, creativity, and trust.
Founded in 2014 by Mr Rajesh Malav & Mrs Pooja Malav. Mrs. Pooja Malav, a Civil Engineering graduate from GSITS Indore, Infrio began as a small yet passionate venture with a clear vision: to deliver quality-driven architectural and construction solutions. Over the years, we have evolved into a trusted name with 100+ completed projects and 20+ ongoing works across multiple cities till 2025.
With the leadership of Mr. Rajesh Malav, an engineering professional with strong experience in supervision and turnkey projects, Infrio has expanded its offerings to cover a complete spectrum of civil solutions — from architectural planning, structural consultancy, and interiors to end-to-end construction and turnkey delivery.</p>
                                            {/* <div className="text-left">
                                            <NavLink to={"/about-us"} className="site-button-link">Read More</NavLink>
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
};

export default About6;
import React from 'react';
import { NavLink } from 'react-router-dom';
import Header2 from './../Common/Header2';
import Footer2 from './../Common/Footer2';
import Banner from './../Elements/Banner';

const bannerImg = require('./../../images/banner/7.jpg');

const ShowcaseLanding = () => {
  return (
    <>
      <Header2 />
      <div className="page-content">
        <Banner
          title="Explore Our Work"
          pagename="Showcase"
          description="Choose how you would like to discover Infrio's portfolio — curated project showcases or our signature picks."
          bgimage={bannerImg}
        />
        <div className="section-full p-t80 p-b80 bg-gray">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-12 m-b30">
                <div className="p-a40 bg-white shadow text-center border-radius-10 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h3 className="m-b20">Project Showcase</h3>
                    <p className="text-muted m-b30">
                      Dive into our complete catalogue of architectural and interior projects with filters and detailed views.
                    </p>
                  </div>
                  <NavLink to="/showcase/projects" className="site-button btn-half w-100">
                    <span>View Showcase</span>
                  </NavLink>
                </div>
              </div>
              <div className="col-lg-6 col-md-8 col-sm-12 m-b30">
                <div className="p-a40 bg-white shadow text-center border-radius-10 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h3 className="m-b20">Infrio's Choice</h3>
                    <p className="text-muted m-b30">
                      Explore a curated selection of our favourite transformations highlighting innovation and craftsmanship.
                    </p>
                  </div>
                  <NavLink to="/infrio-choice" className="site-button-secondry btn-half w-100">
                    <span>See Infrio Choice</span>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default ShowcaseLanding;

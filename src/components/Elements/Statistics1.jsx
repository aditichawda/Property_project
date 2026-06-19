import React from "react";
import CountUp from "react-countup";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { PROPERTY_IMAGES } from "../../data/propertyImages";

var bgimg2 = require("./../../images/background/bg-5.png");

class Statistics1 extends React.Component {
  render() {
    return (
      <>
        <div
          className="section-full overlay-wraper sx-bg-secondry mobile-page-padding  p-t80 p-b50 bg-parallax ml-auto"
          data-stellar-background-ratio="0.5"
          style={{ backgroundImage: "url(" + PROPERTY_IMAGES.ctaBg1 + ")" }}
        >
          <div className="overlay-main bg-black opacity-05" />
          <div className="container">
            <div className="section-content">
              <div className="counter-blocks">
                <div className="row">
                  <div className="col-xl-3 col-md-6 m-b30 ">
                    <div
                      className="sx-count text-white sx-icon-box-wraper bg-repeat p-a30"
                      style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                    >
                      <h2 className="m-t0 sx-text-primary text-center">
                        <span className="counter">
                          <CountUp end={20} duration={5} />
                        </span>
                      </h2>
                      <h4 className="m-b0 text-center">Working Projects</h4>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-6 m-b30">
                    <div
                      className="sx-count  text-white sx-icon-box-wraper bg-repeat p-a30"
                      style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                    >
                      <h2 className="m-t0  sx-text-primary text-center">
                        <span className="counter">
                          <CountUp end={250} duration={5} />
                        </span>
                      </h2>
                      <h4 className="m-b0 text-center">Projects Done</h4>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-6 m-b30">
                    <div
                      className="sx-count  text-white sx-icon-box-wraper bg-repeat p-a30"
                      style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                    >
                      <h2 className="m-t0  sx-text-primary text-center">
                        <span className="counter">
                          <CountUp end={12} duration={5} />
                        </span>
                      </h2>
                      <h4 className="m-b0 text-center">Cities</h4>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-6 m-b30">
                    <div
                      className="sx-count  text-white sx-icon-box-wraper bg-repeat  p-a30"
                      style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                    >
                      <h2 className="m-t0  sx-text-primary text-center">
                        <span className="counter">
                          <CountUp end={100} duration={5} />
                        </span>
                        <span>K+</span>
                      </h2>
                      <h4 className="m-b0 text-center">Building Site</h4>
                    </div>
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

export default Statistics1;

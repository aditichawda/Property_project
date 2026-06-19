import React from "react";

var bgimg1 = require("./../../images/property/about1.jpg");

class About2 extends React.Component {
  render() {
    return (
      <>
        <div className="section-full mobile-page-padding p-t80 p-b80 bg-gray">
          <div className="container">
            <div className="section-content">
              <div className="row">
                <div className="col-xl-5 col-lg-5 col-md-12 ">
                  <div
                    className="home-2-about bg-bottom-left bg-no-repeat bg-cover"
                    style={{ backgroundImage: "url(" + bgimg1 + ")" }}
                    aria-label="Property Sale & Buy Marketplace"
                    title="Property Sale & Buy Marketplace"
                  ></div>
                </div>
                <div className="col-xl-7 col-lg-7 col-md-12">
                  <div className="about-home-2">
                    <h3 className="m-t0 sx-tilte">
                      Property Sale & Buy Marketplace
                    </h3>
                    <p style={{ whiteSpace: "pre-line", textAlign: "justify" }}>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "18px",
                          color: "#000",
                        }}
                      >
                        At Infrio,
                      </span>{" "}
                      we believe that every property holds value and every
                      client deserves a smooth, transparent, and reliable real
                      estate experience.Founded in 2014 by Mr. Rajesh Malav &
                      Mrs. Pooja Malav, Infrio has built a strong reputation in
                      architectural planning, construction, and infrastructure
                      development across multiple cities.With years of
                      experience in civil engineering, turnkey projects, and
                      property development, Infrio is now expanding into the
                      digital real estate sector with an advanced Property Sale
                      & Buy Marketplace platform.The platform is designed to
                      connect property sellers and buyers through a simple,
                      modern, and enquiry-driven system. Our goal is to make
                      property discovery, listing, and communication easier for
                      users while maintaining trust and transparency."
                    </p>
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
}

export default About2;

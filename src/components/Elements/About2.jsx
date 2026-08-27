import React from "react";

var bgimg1 = require("./../../images/property/property2.jpeg");
var bgimg2 = require("./../../images/property/property1.png");

class About2 extends React.Component {
  render() {
    return (
      <>
        <div className="section-full mobile-page-padding p-t80  bg-gray">
          <div className="container">
            <div className="section-content">
              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-12 ">
                  <div
                    className="home-2-about bg-bottom-left bg-no-repeat bg-cover"
                    style={{ backgroundImage: "url(" + bgimg1 + ")" }}
                    aria-label="Property Sale & Buy Marketplace"
                    title="Property Sale & Buy Marketplace"
                  ></div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12">
                  <div className="about-home-2">
                    <h3
                      className="m-t0 sx-tilte"
                      style={{ marginBottom: 18 }}
                    >
                      About Us
                    </h3>
                    <p style={{ textAlign: "justify", marginBottom: 16 }}>
                      At{" "}
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "18px",
                          color: "#000",
                        }}
                      >
                        Infrio Properties,
                      </span>{" "}
                      we believe that finding the right property should be
                      simple, transparent, and stress-free. Whether you are
                      looking to buy, sell, rent, or invest, our platform
                      connects genuine property owners, buyers, and real estate
                      professionals through a trusted and easy-to-use property
                      marketplace.
                    </p>
                    <p style={{ textAlign: "justify", marginBottom: 16 }}>
                      Backed by the expertise of{" "}
                      <span style={{ fontWeight: "700", color: "#000" }}>
                        Infrio India,
                      </span>{" "}
                      we bring together real estate, architecture, interior
                      design, and construction under one ecosystem. This allows
                      us to offer more than just property listings—we provide
                      complete property solutions that help our customers make
                      informed decisions with confidence.
                    </p> 
                    <p style={{ textAlign: "justify", marginBottom: 16 }}>
                      Our platform features residential, commercial, and
                      investment properties with a strong focus on authenticity,
                      verified information, and direct connections between
                      buyers and sellers. We are committed to creating a
                      reliable property network where transparency,
                      professionalism, and customer satisfaction come first.
                    </p>
                    <p style={{ textAlign: "justify", marginBottom: 16 }}>
                      Whether it's your first home, a commercial space, a plot
                      for future development, or an investment opportunity,
                      Infrio Properties is here to help you at every step of the
                      journey.
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

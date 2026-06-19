import React from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const testimonials = [
  {
    image: require("./../../images/testimonials/pic1.jpg"),
    reviewername: "Rosalina D. William",
    position: "Architect",
    review:
      "Great theme, just what we were looking for. Easy to install, easy to navigate. Well documented. Really enjoyed the support.",
  },
  {
    image: require("./../../images/testimonials/pic2.jpg"),
    reviewername: "Mitchal Jhon",
    position: "Architect",
    review:
      "Amazing fast and reliable customer support! The team of willing to go mile for customer service! Thanks!",
  },
  {
    image: require("./../../images/testimonials/pic3.jpg"),
    reviewername: "Barney Smith",
    position: "Interior designer",
    review:
      "Great theme, just what we were looking for. Easy to install, easy to navigate. Well documented. Really enjoyed the support.",
  },
  {
    image: require("./../../images/testimonials/pic4.jpg"),
    reviewername: "Rosalina D. William",
    position: "Architect",
    review:
      "Amazing fast and reliable customer support! The team of willing to go mile for customer service! Thanks!",
  },
];

var bgimg1 = require("./../../images/background/bg6.jpg");
var bgimg2 = require("./../../images/background/cross-line2.png");

class Testimonials2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiData: [], // API ka data save karne ke liye
      loading: true, // loading state
      error: null, // error handle karne ke liye
    };
  }

  componentDidMount() {
    const requestOptions = {
      //  mode: 'no-cors',
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch(
      "https://www.admin.infrioindia.com/api/v2/auth/testimonial-list",
      requestOptions,
    )
      .then((response) => response.json()) // response ko JSON me convert
      .then((result) => {
        console.log("API Result:", result);
        this.setState({ apiData: result.data, loading: false });
      })
      .catch((error) => {
        console.error("API Error: Lakshay", error);
        this.setState({ error: error, loading: false });
      });
  }

  render() {
    const { apiData, loading, error } = this.state;
    const options = {
      loop: true,
      autoplay: false,
      margin: 30,
      nav: true,
      dots: false,
      navText: [
        '<i class="fa fa-angle-left"></i>',
        '<i class="fa fa-angle-right"></i>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        991: {
          items: 2,
        },
      },
    };
    return (
      <>
        <div
          className="section-full mobile-page-padding bg-repeat p-t80 p-b80"
          style={{ backgroundImage: "url(" + bgimg1 + ")" }}
        >
          <div className="section-content">
            <div className="container">
              {/* TITLE START */}
              <div className="section-head">
                <div
                  className={`${this.props.separatoralignment} sx-separator-outer`}
                >
                  <div
                    className="sx-separator bg-white bg-moving bg-repeat-x"
                    style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                  >
                    <h3 className="sep-line-one">Testimonial</h3>
                  </div>
                </div>
              </div>
              {/* TITLE END */}
              {/* TESTIMONIAL START */}
              {!loading && !error && apiData.length > 0 && (
                <OwlCarousel
                  className="owl-carousel testimonial-home-two owl-btn-vertical-center"
                  {...options}
                >
                  {apiData.map((item, index) => (
                    <div
                      className="item"
                      key={index}
                      style={{
                        height: "100%",
                        display: "flex",
                      }}
                    >
                      <div
                        className="testimonial-1 hover-animation-1 bg-gray"
                        style={{
                          minHeight: 420,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          className="testimonial-detail clearfix"
                          style={{ textAlign: "center" }}
                        >
                          <div
                            className="testimonial-pic scale-in-center"
                            style={{
                              margin: "0 auto 15px",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <img
                              src={item.icon}
                              alt={item.name}
                              width={140}
                              height={140}
                              style={{
                                width: 140,
                                height: 140,
                                objectFit: "cover",
                                borderRadius: 8, // square with slight rounding
                                display: "block",
                              }}
                            />
                          </div>
                          <span
                            className="testimonial-position"
                            style={{
                              display: "block",
                              marginTop: 25,
                              marginBottom: 5,
                            }}
                          >
                            {item.designation}
                          </span>
                          <h4
                            className="testimonial-name"
                            style={{ marginBottom: 10 }}
                          >
                            {item.name}
                          </h4>
                          <span className="fa fa-quote-right" />
                        </div>
                        <div
                          className="testimonial-text"
                          style={{ paddingBottom: 10 }}
                        >
                          <p style={{ marginBottom: 0, textAlign: "justify" }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </OwlCarousel>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Testimonials2;

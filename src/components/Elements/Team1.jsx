import React from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const teamMembers = [
  {
    image: require("./../../images/our-team5/1.jpg"),
    membername: "Johnny Jackman",
    position: "Architect",
  },
  {
    image: require("./../../images/our-team5/2.jpg"),
    membername: "Daniel Rickman",
    position: "Architect",
  },
  {
    image: require("./../../images/our-team5/3.jpg"),
    membername: "Mark Norwich",
    position: "Finances",
  },
  {
    image: require("./../../images/our-team5/1.jpg"),
    membername: "Nich Jonas",
    position: "Finances",
  },
];

var bgimg1 = require("./../../images/background/cross-line2.png");

class Team1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiData: teamMembers,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    const requestOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    fetch(
      "https://www.admin.infrioindia.com/api/v2/auth/our-teams-list",
      requestOptions,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Team API failed with ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        const list = Array.isArray(result?.data) && result.data.length
          ? result.data
          : teamMembers;
        this.setState({ apiData: list, loading: false, error: null });
      })
      .catch((error) => {
        console.error("Team API Error:", error);
        this.setState({ apiData: teamMembers, error, loading: false });
      });
  }

  render() {
    const { apiData } = this.state;

    return (
      <>
        <div className="section-full p-t30 mobile-page-padding">
          <div className="container">
            {/* TITLE START */}
            <div className="section-head">
              <div className="sx-separator-outer separator-center">
                <div
                  className="sx-separator bg-white bg-moving bg-repeat-x"
                  style={{ backgroundImage: "url(" + bgimg1 + ")" }}
                >
                  <h3 className="sep-line-one">Our Team</h3>
                </div>
              </div>
            </div>
            {/* TITLE END */}
            {/* IMAGE CAROUSEL START */}
            <div className="section-content">
              <div className="row team-item-four">
                {apiData.slice(0, 4).map((item, index) => (
                  <div className="col-lg-3 col-md-6 col-sm-6 m-b30" key={index}>
                    <div className="our-team-2 ">
                      <div
                        className="profile-image"
                        style={{
                          width: "100%",
                          height: "300px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.icon || item.image}
                          alt={item.name || item.membername}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                          }}
                        />
                        {/* <div className="icons">
                                                    <a href="https://www.facebook.com" target="_blank"><i className="fa fa-facebook" /></a>
                                                    <a href="https://www.twitter.com" target="_blank"> <i className="fa fa-twitter" /></a>
                                                    <a href="https://www.instagram.com" target="_blank"> <i className="fa fa-instagram" /></a>
                                                    <a href="https://in.linkedin.com" target="_blank"> <i className="fa fa-linkedin" /></a>
                                                </div> */}
                      </div>
                      <div className="figcaption text-black">
                        <h4 className="m-t0">
                          {item.name || item.membername}
                        </h4>
                        <span className="m-b0">
                          {item.designation || item.position}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Team1;

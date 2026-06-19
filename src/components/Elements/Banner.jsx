import React from "react";
import { NavLink } from "react-router-dom";

class Banner extends React.Component {
  render() {
    const bannerStyle = {
      backgroundImage: "url(" + this.props.bgimage + ")",
      ...(this.props.height
        ? { minHeight: this.props.height, height: this.props.height }
        : {}),
    };

    return (
      <>
        <div
          className="sx-bnr-inr overlay-wraper bg-parallax bg-top-center"
          data-stellar-background-ratio="0.5"
          style={bannerStyle}
        >
          <div className="overlay-main bg-black opacity-07" />
          <div className="container">
            <div className="sx-bnr-inr-entry">
              <div className="banner-title-outer">
                <div className="banner-title-name">
                  <h2 className="m-tb0">{this.props.title}</h2>
                  <p style={{ whiteSpace: "pre-line" }}>
                    {
                      "Connecting buyers and sellers through a smart, trusted, and user-friendly property platform . Making property buying and selling simple, secure, and hassle-free"
                    }
                  </p>
                  {this.props.buttonVisible &&
                    (this.props.isSeller ? (
                      <NavLink to="/seller-dashboard" className="site-button">
                        <span>Property Seller Dashboard</span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        className="solar-crm-cta__btn"
                        onClick={this.props.onClick}
                      >
                        Become a property seller
                      </button>
                    ))}
                </div>
              </div>
              {/* BREADCRUMB ROW */}
              {/* <div>
                                <ul className="sx-breadcrumb breadcrumb-style-2">
                                <li><NavLink to={"./"}>Home</NavLink></li>
                                    <li>{this.props.pagename}</li>
                                </ul>
                            </div> */}
              {/* BREADCRUMB ROW END */}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Banner;

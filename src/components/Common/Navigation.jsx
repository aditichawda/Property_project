import React from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

class Navigation extends React.Component {
  static contextType = AuthContext;

  componentDidMount() {
    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = src;
        script.addEventListener("load", function () {
          resolve();
        });
        script.addEventListener("error", function (e) {
          reject(e);
        });
        document.body.appendChild(script);
        document.body.removeChild(script);
      });
    }

    loadScript("./assets/js/mobilenav.js");
  }

  render() {
    const { isLoggedIn, userRole, onNavigate } = this.props;
    const { openSellerRegistration } = this.context || {};
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const activeNavSource =
      typeof window !== "undefined" ? window.history.state?.usr?.activeNav : "";
    const isSellersActive = (isActive) =>
      activeNavSource
        ? activeNavSource === "properties"
        : isActive ||
          path.startsWith("/properties") ||
          path.startsWith("/sellers");
    const isPropertySellersActive = (isActive) =>
      activeNavSource
        ? activeNavSource === "property-sellers"
        : isActive || path.startsWith("/property-sellers");
    const accountPath =
      userRole === "normal"
        ? "/user-account"
        : userRole === "seller"
          ? "/seller-dashboard"
          : "/partner-account";
    const accountLabel =
      userRole === "seller" ? "Property Seller Dashboard" : "My Account";

    return (
      <>
        <ul
          className="nav navbar-nav"
          onClick={(event) => {
            const target = event.target;
            if (target && target.closest && target.closest("a")) {
              onNavigate?.();
            }
          }}
        >
          {/* Mobile drawer items - Mail, Call, Login, Register */}

          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
            {/* <ul className="sub-menu">
                            <li><NavLink to={"/"}>Home-1</NavLink></li>
                            <li><NavLink to={"/home-2"}>Home-2</NavLink></li>
                            <li><NavLink to={"/home-3"}>Home-3</NavLink></li>
                            <li><NavLink to={"/home-4"}>Home-4</NavLink></li>
                            <li><NavLink to={"/home-5"}>Home-5</NavLink></li>
                            <li><NavLink to={"/home-6"}>Home-6</NavLink></li>
                        </ul> */}
          </li>
          <li>
            <NavLink to={"/about-us"}>About us</NavLink>
            {/* <ul className="sub-menu">
                            <li><NavLink to={"/about-1"}>About 1</NavLink></li>
                            <li><NavLink to={"/about-2"}>About 2</NavLink></li>
                        </ul> */}
          </li>
          <li>
            <NavLink
              to={"/property-sellers"}
              className={({ isActive }) =>
                isPropertySellersActive(isActive) ? "active" : ""
              }
            >
              Property Seller
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/properties"}
              className={({ isActive }) =>
                isSellersActive(isActive) ? "active" : ""
              }
            >
              Properties
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/property-seller-packages"}
            >
             Property Packages
            </NavLink>
          </li>
          <li>
            <NavLink to={"/blog"}>Blog</NavLink>
          </li>

          <li>
            <NavLink to={"/contact-us"}>Contact us</NavLink>
          </li>

          {!isLoggedIn && (
            <>
              <li className="mobile-drawer-top-items">
                <NavLink to={"/login"}>User Login</NavLink>
              </li>
              <li className="mobile-drawer-top-items">
                <NavLink to={"/seller-login"}>Property Seller Login</NavLink>
              </li>
             
            </>
          )}
          {isLoggedIn && (
            <li className="mobile-drawer-top-items">
              <NavLink to={accountPath}>{accountLabel}</NavLink>
            </li>
          )}
          <li className="mobile-drawer-top-items">
            <a href="mailto:info@infrioindia.com">
              Mail Us : info@infrioindia.com
            </a>
          </li>
          <li className="mobile-drawer-top-items">
            <a href="tel:+919001457000">Call Us : +91 90014 57000</a>
          </li>
        </ul>
      </>
    );
  }
}

export default Navigation;

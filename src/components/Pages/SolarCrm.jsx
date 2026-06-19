import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { SOLAR_CRM_CARDS } from "../../data/solarCrmContent";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

function SolarCrm() {
  const { isSeller, openSellerRegistration } = useAuth();
  return (
    <>
      <SEO
        titleExact
        title="Solar CRM – Partner workspace for leads & customers"
        description="Discover Infrio Solar CRM: how verified sellers manage leads, customers, services, and team workflows in one solar-focused workspace."
        canonicalPath="/solar-crm"
        keywords="solar CRM, Infrio seller dashboard, solar leads, solar partner tools, installer CRM"
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Solar CRM"
          pagename="Solar CRM"
          description="A focused workspace for Infrio solar partners—leads, customers, services, and teamwork in one place."
          bgimage={SOLAR_IMAGES.bannerSolutions}
          buttonVisible={true}
          isSeller={isSeller}
          onClick={() => {
            openSellerRegistration();
          }}
        />

        <div className="section-full p-t40 p-b50 mobile-page-padding solar-crm-page">
          <div className="container">
            <div className="solar-crm-intro text-center mx-auto m-b30">
              <p className="solar-crm-intro__text m-b0 max-w900 mx-auto">
                Whether you are onboarding as a seller or scaling your crew,
                Solar CRM explains how Infrio helps you organise enquiries,
                deliver consistent service, and grow with confidence.
              </p>
            </div>

            <div className="solar-crm-stack">
              {SOLAR_CRM_CARDS.map((card, index) => {
                const imageLeft = index % 2 === 0;
                const step = String(index + 1).padStart(2, "0");
                return (
                  <article
                    key={card.id}
                    className={`solar-crm-feature-card ${imageLeft ? "solar-crm-feature-card--img-left" : "solar-crm-feature-card--img-right"}`}
                  >
                    <div
                      className={`row no-gutters align-items-stretch solar-crm-feature-card__grid ${
                        imageLeft ? "" : "flex-lg-row-reverse"
                      }`}
                    >
                      <div className="col-12 col-lg-4 solar-crm-feature-card__visual-col">
                        <div className="solar-crm-feature-card__visual">
                          <img
                            src={card.image}
                            alt=""
                            className="solar-crm-feature-card__img"
                            loading="lazy"
                            decoding="async"
                          />
                          <div
                            className="solar-crm-feature-card__visual-shade"
                            aria-hidden
                          />
                        </div>
                      </div>
                      <div className="col-12 col-lg-8 solar-crm-feature-card__content-col">
                        <div className="solar-crm-feature-card__body">
                          <span className="solar-crm-feature-card__step">
                            Step {step}
                          </span>
                          <h3 className="solar-crm-feature-card__title m-t0">
                            {card.title}
                          </h3>
                          <p className="solar-crm-feature-card__lead m-b0">
                            {card.body}
                          </p>
                          {card.bullets && card.bullets.length > 0 && (
                            <ul className="list-unstyled m-b0 solar-crm-feature-card__list">
                              {card.bullets.map((line) => (
                                <li
                                  key={line}
                                  className="solar-crm-feature-card__list-item"
                                >
                                  <span
                                    className="solar-crm-feature-card__bullet-icon"
                                    aria-hidden
                                  >
                                    <i className="fa fa-check" />
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="solar-crm-cta m-t40">
              <div className="solar-crm-cta__overlay" aria-hidden />
              <div className="solar-crm-cta__content">
                <h3 className="solar-crm-cta__title m-t0 m-b10">
                  Join the System Solar Software
                </h3>
                <p className="solar-crm-cta__subtitle m-b20">
                  Partner with us to power homes with clean, reliable solar
                  energy.
                </p>
                {isSeller ? (
                  <NavLink to="/seller-dashboard" className="site-button">
                    <span>Seller Dashboard</span>
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className="solar-crm-cta__btn"
                    onClick={openSellerRegistration}
                  >
                    Become a property seller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

export default SolarCrm;

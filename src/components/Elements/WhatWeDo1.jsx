import React from "react";
import { NavLink } from "react-router-dom";
import { SellerCard } from "./Team3";
import {
  fetchProperties,
  normalizePropertyPaginationResponse,
} from "../../api/properties";

var bgimg1 = require("./../../images/background/bg-5.png");
var bgimg3 = require("./../../images/background/cross-line2.png");

export function SolutionsGrid({ items, getItemHref }) {
  return (
    <div className="row team-item-four solar-sellers-grid-page">
      {items.map((property) => (
        <div
          className="col-xl-3 col-lg-4 col-md-6 col-sm-6 m-b30"
          key={property.id}
        >
          <SellerCard
            item={{
              id: property.id,
              membername: property.title,
              position: property.type,
              price: property.price,
              status: property.status,
              location: property.location,
              description: property.shortDescription || property.description,
              image: property.image,
              fallbackImage: property.image,
              href:
                typeof getItemHref === "function"
                  ? getItemHref(property)
                  : `/properties/${property.id}`,
              state: { activeNav: "properties" },
            }}
          />
        </div>
      ))}
    </div>
  );
}

function WhatWeDo1() {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await fetchProperties({
          status: 1,
          page: 1,
          per_page: 6,
        });
        const next = normalizePropertyPaginationResponse(response, {
          page: 1,
          perPage: 6,
        });
        if (!cancelled) setProperties(next.items.slice(0, 6));
      } catch {
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      id="property-services"
      className="section-full mobile-page-padding bg-white p-t20 p-b30 bg-repeat overflow-hide scroll-spy-section"
      // style={{ backgroundImage: "url(" + bgimg1 + ")" }}
    >
      <div className="container right-half-bg-image-outer">
        <div
          className="right-half-bg-image bg-parallax bg-fixed bg-top-right"
          data-stellar-background-ratio={0}
          style={{ backgroundImage: "url(" + bgimg1 + ")" }}
        />
        <div className="section-head">
          <div className="sx-separator-outer separator-left">
            <div
              className="sx-separator bg-white bg-moving bg-repeat-x"
              style={{ backgroundImage: "url(" + bgimg3 + ")" }}
            >
              <h3 className="sep-line-one">Property Listings</h3>
            </div>
          </div>
        </div>
        <p className="m-b30 max-w900 solar-section-intro">
          Browse active homes, flats, plots, and commercial spaces with price,
          location, specifications, and enquiry-ready seller details.
        </p>
        <div className="section-content">
          {properties.length === 0 ? (
            <p className="text-center p-a30 bg-gray radius-md">
              {loading ? "Loading properties..." : "No active properties found."}
            </p>
          ) : (
            <SolutionsGrid items={properties} />
          )}
          <div className="text-center m-t20 m-b40">
            <NavLink to="/properties" className="site-button btn-half">
              <span>View all properties</span>
            </NavLink>
          </div>
          <div className="large-title-block full-content bg-gray solar-solutions-footer-cta">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-12 col-sm-12">
                <div className="large-title">
                  <h3 className="m-tb0">
                    Find the right property and connect with the seller through
                    a simple enquiry flow.
                  </h3>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12">
                <div className="large-title-info">
                  <p>
                    Buyers can filter by location, type, budget, bedrooms, and
                    status. Sellers can add properties, manage listings, and
                    track incoming enquiries from their dashboard.
                  </p>
                  <div className="text-left">
                    <NavLink to="/seller-register" className="site-button">
                      <span>Post Your Property</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatWeDo1;

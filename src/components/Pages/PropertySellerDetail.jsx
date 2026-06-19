import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { fetchSolarUserDetailRaw } from "../../api/solarUsers";
import { normalizeProperty } from "../../api/properties";

const bannerImg = require("./../../images/property/3.jpg");
const fallbackSellerImage = require("./../../images/solar/banner3.jpg");

function pickSellerImage(seller) {
  return (
    seller?.profile_image_url ||
    seller?.profile_image ||
    seller?.image_url ||
    seller?.image ||
    fallbackSellerImage
  );
}

function normalizeSeller(raw) {
  if (!raw) return null;
  const properties = Array.isArray(raw.properties)
    ? raw.properties.map(normalizeProperty)
    : [];
  return {
    id: raw.id || raw.solar_user_id,
    name: raw.full_name || raw.fullName || raw.name || "Property Seller",
    company: raw.company_name || raw.business_name || raw.name || "Property Seller",
    image: pickSellerImage(raw),
    phone: raw.phone_number || raw.phone || raw.mobile || "-",
    email: raw.email || "-",
    address: raw.address || "",
    state: raw.state_name || raw.state || "",
    city: raw.city_name || raw.city || "",
    status: raw.status,
    activePropertyCount:
      raw.active_property_count ?? properties.filter((item) => item.status === "Active").length,
    properties,
  };
}

function PropertyCard({ property, sellerId }) {
  return (
    <NavLink
      to={`/properties/${property.id}`}
      state={{ activeNav: "property-sellers", fromSellerId: sellerId }}
      className="solar-seller-card-link"
    >
      <article className="our-team-2 solar-seller-card solar-property-card">
        <div className="profile-image">
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="figcaption text-black">
          <div className="d-flex justify-content-between align-items-center m-b10">
            <span
              className="sx-text-primary"
              style={{ fontWeight: 800, fontSize: 18 }}
            >
              {property.price}
            </span>
          </div>
          <h4 className="m-t0">
            <span className="solar-seller-name">{property.title}</span>
          </h4>
          <span className="m-b0 sx-text-primary">
            {property.property_type_name || property.type}
          </span>
          <p className="solar-seller-meta m-b5">
            <i className="fa fa-map-marker sx-text-primary m-r5" />
            {property.location}
          </p>
          <p className="font-14 m-b0 solar-seller-address">
            {property.shortDescription}
          </p>
          <span className="solar-property-view-btn">View Details</span>
        </div>
      </article>
    </NavLink>
  );
}

export default function PropertySellerDetail() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const raw = await fetchSolarUserDetailRaw(sellerId);
        if (!cancelled) {
          const next = normalizeSeller(raw);
          setSeller(next);
          setNotFound(!next);
        }
      } catch {
        if (!cancelled) {
          setSeller(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const properties = useMemo(
    () => (seller?.properties || []).filter((item) => item.status === "Active"),
    [seller],
  );

  if (!loading && notFound) {
    return <Navigate to="/error-404" replace />;
  }

  const seoName = seller?.company || "Property Seller";

  return (
    <>
      <SEO
        titleExact
        title={`${seoName} - Property Seller Details`}
        description={`${seoName} seller details and listed properties.`}
        canonicalPath={`/property-sellers/${sellerId}`}
        keywords={`${seoName}, property seller, real estate seller`}
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title={seoName}
          pagename="Seller Details"
          description={
            seller
              ? [seller.city, seller.state].filter(Boolean).join(", ")
              : "Loading seller details"
          }
          bgimage={bannerImg}
        />

        <div className="section-full p-t50 p-b80 bg-gray mobile-page-padding">
          <div className="container">
            <nav className="solar-seller-detail__breadcrumb m-b30">
              <NavLink to="/">Home</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <NavLink to="/property-sellers">Sellers</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <span className="text-muted">{seoName}</span>
            </nav>

            {loading ? (
              <p className="text-center p-a30 bg-white radius-md">
                Loading seller details...
              </p>
            ) : null}

            {seller ? (
              <>
                <div className="row align-items-stretch m-b45">
                  <div className="col-lg-5 col-md-5 m-b30">
                    <div className="bg-white h-100 overflow-hidden shadow rounded">
                      <img
                        src={seller.image}
                        alt={seller.name}
                        style={{ width: "100%", height: 280, objectFit: "cover" }}
                      />
                    </div>
                  </div>

                  <div className="col-lg-7 col-md-7 m-b30">
                    <div className="bg-white shadow rounded p-a30 ">
                      <div className="d-flex justify-content-between align-items-start flex-wrap m-b25">
                        <div>
                          <h2 className="m-t0 m-b5" style={{ fontSize: 34 }}>
                            {seller.name}
                          </h2>
                          {seller.activePropertyCount > 0 && (
                            <span className="sx-text-primary ">
                              {seller.activePropertyCount} active properties
                            </span>
                          )}
                        </div>
                        {/* <span className="badge badge-light p-a10">
                          {seller.status === 1 ? "Active" : "Inactive"}
                        </span> */}
                      </div>

                      <div className="row">
                        <div className="col-sm-6 m-b15">
                          <div className="text-muted m-b5">Phone</div>
                          <strong>{seller.phone}</strong>
                        </div>
                        <div className="col-sm-6 m-b15">
                          <div className="text-muted m-b5">Email</div>
                          <strong>{seller.email}</strong>
                        </div>
                        <div className="col-sm-6 m-b15">
                          <div className="text-muted m-b5">City</div>
                          <strong>{seller.city || "-"}</strong>
                        </div>
                        <div className="col-sm-6 m-b15">
                          <div className="text-muted m-b5">State</div>
                          <strong>{seller.state || "-"}</strong>
                        </div>
                        <div className="col-sm-12 m-b15">
                          <div className="text-muted m-b5">Address</div>
                          <strong>{seller.address || "-"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-head m-b20">
                  <h2 className="m-t0 m-b5">Properties </h2>
                  <p className="m-b0">Properties listed by this seller.</p>
                </div>

                <div className="row">
                  {properties.length === 0 ? (
                    <div className="col-12">
                      <p className="text-center p-a30 bg-white radius-md">
                        No properties added for this seller yet.
                      </p>
                    </div>
                  ) : (
                    properties.map((property) => (
                      <div className="col-lg-4 col-md-6 m-b30" key={property.id}>
                        <PropertyCard property={property} sellerId={seller.id} />
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

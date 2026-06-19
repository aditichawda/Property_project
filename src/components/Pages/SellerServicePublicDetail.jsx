import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { fetchSolarSellerServiceView } from "../../api/solarSellerServices";
import SolarEnquiryModal from "../Elements/SolarEnquiryModal";
import { useAuth } from "../../context/AuthContext";

export default function SellerServicePublicDetail() {
  const { sellerId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [state, setState] = useState({ loading: true, error: "", svc: null });
  const [activeImg, setActiveImg] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "", svc: null });
        const res = await fetchSolarSellerServiceView({
          solarUserId: sellerId,
          id: serviceId,
        });
        const svc = res?.data || null;
        if (!alive) return;
        setState({ loading: false, error: "", svc });
      } catch (e) {
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message || "Could not load service.",
          svc: null,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [sellerId, serviceId]);

  const svc = state.svc;
  const gallery = useMemo(
    () =>
      Array.isArray(svc?.service_image_urls) ? svc.service_image_urls : [],
    [svc],
  );
  const allImages = useMemo(() => {
    const list = [];
    if (svc?.thumbnail_url) list.push(svc.thumbnail_url);
    (gallery || []).forEach((x) => {
      if (x && !list.includes(x)) list.push(x);
    });
    return list;
  }, [svc?.thumbnail_url, gallery]);

  useEffect(() => {
    setActiveImg(allImages[0] || "");
  }, [allImages]);

  const openEnquiry = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: location.pathname } });
      return;
    }
    setEnquiryOpen(true);
  };

  return (
    <>
      <SEO
        titleExact
        title={svc?.title ? `${svc.title} – Service` : "Service"}
        description={
          svc?.description
            ? String(svc.description).slice(0, 150)
            : "Solar service details."
        }
        canonicalPath={`/properties/${sellerId}/services/${serviceId}`}
        keywords="solar service, solar installation, inverter, acdb dcdb"
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title={svc?.title || "Service"}
          pagename="Sellers"
          description="Service details"
          bgimage={SOLAR_IMAGES.bannerSellers}
        />

        <div className="section-full p-t50 p-b80 bg-white mobile-page-padding">
          <div className="container">
            {/* <nav className="solar-seller-detail__breadcrumb m-b30" aria-label="Breadcrumb">
              <NavLink to="/">Home</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <NavLink to="/properties">Properties</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <NavLink to={`/properties/${sellerId}`}>Services</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <span className="text-muted">{svc?.title || 'Service'}</span>
            </nav> */}
            <div
              className="m-b20"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <button
                className="seller-crm-btn-outline"
                onClick={() => window.history.back()}
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden /> Back to
                services
              </button>
              <button
                type="button"
                style={{ backgroundColor: "#d97706" }}
                className="seller-crm-btn-orange"
                onClick={openEnquiry}
              >
                Send Enquiry
              </button>
            </div>
            {!state.loading && state.error ? (
              <div className="alert alert-warning m-b20" role="alert">
                {state.error}
              </div>
            ) : null}

            {state.loading ? (
              <p className="text-center p-a30 bg-white radius-md">
                Loading service…
              </p>
            ) : null}

            {!state.loading && svc ? (
              <div className="row">
                <div className="col-lg-5 col-md-12 m-b30">
                  <div className="bg-white shadow rounded overflow-hidden p-a15 solar-service-public__media">
                    <div className="solar-seller-detail__image">
                      {activeImg ? (
                        <img src={activeImg} alt="" />
                      ) : (
                        <img src={SOLAR_IMAGES.defaultbanner} alt="" />
                      )}
                    </div>

                    {allImages.length > 1 ? (
                      <div className="solar-service-public__thumbs">
                        {allImages.slice(0, 12).map((src, i) => (
                          <button
                            key={`${src}-${i}`}
                            type="button"
                            className={`solar-service-public__thumb ${src === activeImg ? "is-active" : ""}`}
                            onClick={() => setActiveImg(src)}
                            aria-label="View image"
                          >
                            <img src={src} alt="" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-lg-7 col-md-12">
                  <h2
                    className="m-t0 m-b15"
                    style={{ fontWeight: 800, color: "#0f172a" }}
                  >
                    {svc.title || "—"}
                  </h2>

                  <div className="seller-crm-service-view__grid">
                    <div>
                      <div className="seller-crm-k">Solar service category</div>
                      <div className="seller-crm-v">
                        {svc.solar_service_category_name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Inverter brand</div>
                      <div className="seller-crm-v">
                        {svc.inverter_brand_name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">ACDB/DCDB</div>
                      <div className="seller-crm-v">
                        {svc.acdb_dcdb_name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Capacity (KW)</div>
                      <div className="seller-crm-v">
                        {svc.capacity_kw || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Installation time</div>
                      <div className="seller-crm-v">
                        {svc.installation_time || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Warranty (years)</div>
                      <div className="seller-crm-v">
                        {svc.warranty_years ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Price</div>
                      <div className="seller-crm-v">{svc.price || "—"}</div>
                    </div>
                  </div>

                  <div className="m-t20">
                    <div className="seller-crm-k">Description</div>
                    <div className="seller-crm-v seller-crm-v--desc">
                      {svc.description || "—"}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Gallery is shown under the main image via thumbnails (above). */}
          </div>
        </div>
      </div>
      <Footer2 />
      <SolarEnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        sellerId={sellerId}
        serviceId={serviceId}
        serviceName={svc?.title || ""}
      />
    </>
  );
}

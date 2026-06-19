import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import {
  fetchPropertyDetail,
  getCurrentSellerId,
} from "../../api/properties";

export default function SellerServiceView() {
  const { id } = useParams();
  const [state, setState] = useState({
    loading: true,
    error: "",
    property: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: "" }));
        const property = await fetchPropertyDetail({
          id,
          sellerId: getCurrentSellerId(),
        });
        if (!alive) return;
        setState({ loading: false, error: "", property });
      } catch {
        if (!alive) return;
        setState({
          loading: false,
          error: "Could not load property from API.",
          property: null,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const property = state.property;
  const gallery = useMemo(
    () =>
      property
        ? [property.image, ...(property.gallery || [])].filter(
            (image, index, list) => image && list.indexOf(image) === index,
          )
        : [],
    [property],
  );

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <h2 className="seller-crm-panel-title">Property details</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {property ? (
                  <NavLink
                    to={`/seller-services/${property.id}/edit`}
                    className="seller-crm-btn-orange"
                    state={{ service: property }}
                  >
                    <i className="fa fa-pencil m-r8 mx-2" aria-hidden />
                    Edit
                  </NavLink>
                ) : null}
                <NavLink
                  to="/seller-services"
                  className="seller-crm-btn-outline"
                >
                  <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden />
                  Back
                </NavLink>
              </div>
            </div>

            {state.loading ? (
              <div className="seller-table__empty">Loading property...</div>
            ) : null}
            {!state.loading && state.error ? (
              <div className="seller-table__empty" style={{ color: "#b00020" }}>
                {state.error}
              </div>
            ) : null}
            {!state.loading && !property ? (
              <div className="seller-table__empty">Property not found.</div>
            ) : null}

            {property ? (
              <div className="row">
                <div className="col-lg-6 col-md-12 m-b20">
                  <img
                    src={property.image}
                    alt={property.title}
                    style={{
                      width: "100%",
                      maxHeight: 420,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                  {gallery.length ? (
                    <div className="seller-crm-media-preview__gallery m-t15">
                      {gallery.slice(0, 5).map((image, index) => (
                        <div className="seller-crm-thumb" key={`${image}-${index}`}>
                          <img src={image} alt={`${property.title} ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="col-lg-6 col-md-12">
                  <h2 className="m-t0" style={{ fontWeight: 900 }}>
                    {property.title}
                  </h2>
                  <div className="seller-crm-service-view__grid">
                    <div>
                      <div className="seller-crm-k">Location</div>
                      <div className="seller-crm-v">{property.location}</div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Property Type</div>
                      <div className="seller-crm-v">
                        {property.property_type_name || property.type}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Price</div>
                      <div className="seller-crm-v">{property.price}</div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Status</div>
                      <div className="seller-crm-v">{property.status}</div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Area Size</div>
                      <div className="seller-crm-v">
                        {property.specifications?.areaSize || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bedrooms</div>
                      <div className="seller-crm-v">
                        {property.specifications?.bedrooms || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bathrooms</div>
                      <div className="seller-crm-v">
                        {property.specifications?.bathrooms || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Parking</div>
                      <div className="seller-crm-v">
                        {property.specifications?.parking || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="m-t20">
                    <div className="seller-crm-k">Description</div>
                    <div className="seller-crm-v seller-crm-v--desc">
                      {property.description || "-"}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}

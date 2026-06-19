import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import SimplePagination from "../Elements/SimplePagination";
import {
  fetchPropertyDetail,
  fetchProperties,
  getCurrentSellerId,
  normalizePropertyPaginationResponse,
  togglePropertyStatus,
} from "../../api/properties";
import {
  getSellerPackageUsage,
  getSellerPostLimit,
  readSellerPackage,
} from "../../data/sellerPackages";

const PER_PAGE = 20;

export default function SellerServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    service: null,
  });
  const [viewState, setViewState] = useState({ open: false, svc: null });
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: PER_PAGE,
    total: 0,
    lastPage: 1,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await fetchProperties({
          seller_id: getCurrentSellerId(),
          page,
          per_page: PER_PAGE,
        });
        const next = normalizePropertyPaginationResponse(response, {
          page,
          perPage: PER_PAGE,
        });
        if (!cancelled) {
          setServices(next.items);
          setPagination(next.pagination);
        }
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const visibleServices = useMemo(() => services || [], [services]);
  const currentPackage = readSellerPackage();
  const postLimit = getSellerPostLimit();
  const packageUsage = getSellerPackageUsage(
    pagination.total || visibleServices.length,
  );
  const usedPosts = packageUsage.usedPosts;
  const remainingPosts = packageUsage.remainingPosts;
  const limitReached =
    !packageUsage.isUnlimited && !loading && usedPosts >= postLimit;

  const handleAddProperty = () => {
    navigate(limitReached ? "/property-seller-packages" : "/seller-services/new");
  };

  const showStatusMessage = (type, text) => {
    setStatusMessage({ type, text });
    window.setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  const confirmDelete = () => {
    const serviceId = deleteModal?.service?.id;
    if (!serviceId) return;
    setServices((prev) =>
      prev.filter((item) => String(item.id) !== String(serviceId)),
    );
    setDeleteModal({ open: false, service: null });
  };

  const openView = async (serviceId) => {
    const fallback = visibleServices.find(
      (item) => String(item.id) === String(serviceId),
    );
    setViewState({ open: true, svc: fallback || null });
    try {
      const svc = await fetchPropertyDetail({
        id: serviceId,
        sellerId: getCurrentSellerId(),
      });
      if (svc?.id) setViewState({ open: true, svc });
    } catch {
      setViewState({ open: true, svc: fallback || null });
    }
  };

  const toggleStatus = async (svc) => {
    if (!svc?.id || statusSavingId) return;
    const sellerId = svc.seller_id || getCurrentSellerId();
    try {
      setStatusSavingId(String(svc.id));
      const response = await togglePropertyStatus({
        id: svc.id,
        sellerId,
      });
      const nextStatus =
        response?.data?.status === 1 || response?.data?.status === "1"
          ? "Active"
          : "Deactive";
      setServices((prev) =>
        prev.map((item) =>
          String(item.id) === String(svc.id)
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
      showStatusMessage(
        "success",
        response?.message || `Property ${nextStatus.toLowerCase()} successfully.`,
      );
    } catch (error) {
      showStatusMessage(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to change property status.",
      );
    } finally {
      setStatusSavingId("");
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div
              className="seller-crm-panel-head seller-crm-panel-head--table"
              style={{ padding: "0px 0px 20px" }}
            >
              <h2 className="seller-crm-panel-title">Property management</h2>
              {!viewState.open ? (
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={handleAddProperty}
                >
                  <i
                    className={`fa ${limitReached ? "fa-shopping-bag" : "fa-plus"} m-r8 mx-2`}
                    aria-hidden
                  />
                  {limitReached ? "View packages" : "Add property"}
                </button>
              ) : (
                <button
                  type="button"
                  className="site-button"
                  onClick={() => setViewState({ open: false, svc: null })}
                >
                  <i
                    className="fa fa-arrow-left m-r8 mr-2"
                    aria-hidden="true"
                  />
                  Back
                </button>
              )}
            </div>

            {!viewState.open ? (
              <div
                style={{
                  background: limitReached ? "#fff7ed" : "#eff6ff",
                  border: `1px solid ${limitReached ? "#fed7aa" : "#bfdbfe"}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong style={{ color: limitReached ? "#9a3412" : "#1e3a8a" }}>
                    {currentPackage.id === "free"
                      ? "Your free plan includes 2 property posts"
                      : packageUsage.isUnlimited
                        ? `${currentPackage.name}: Unlimited property posts`
                        : `${currentPackage.name}: ${postLimit} property posts`}
                  </strong>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>
                    {packageUsage.isUnlimited
                      ? `${usedPosts} posts added after package activation. Unlimited posts available.`
                      : `${usedPosts} of ${postLimit} posts used. ${remainingPosts} remaining.`}
                    Up to 10 images can be uploaded per property.
                  </div>
                </div>
                {limitReached ? (
                  <NavLink to="/property-seller-packages" className="seller-crm-btn-orange">
                    Upgrade package
                  </NavLink>
                ) : null}
              </div>
            ) : null}

            {deleteModal.open ? (
              <div
                className="seller-crm-modal-overlay"
                role="dialog"
                aria-modal="true"
              >
                <div className="seller-crm-modal-card seller-crm-modal-card--md">
                  <div className="seller-crm-modal-head">
                    <h3 id="delete-modal-title">Delete property</h3>
                    <button
                      type="button"
                      className="seller-crm-modal-close"
                      onClick={() =>
                        setDeleteModal({ open: false, service: null })
                      }
                      aria-label="Close"
                    >
                      x
                    </button>
                  </div>
                  <div className="seller-crm-modal-body">
                    <p style={{ marginBottom: 0 }}>
                      Are you sure you want to delete{" "}
                      <strong>
                        {deleteModal.service?.title || "this property"}
                      </strong>
                      ?
                    </p>
                    <div className="seller-crm-modal-actions">
                      <button
                        type="button"
                        className="seller-crm-btn-outline"
                        onClick={() =>
                          setDeleteModal({ open: false, service: null })
                        }
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className="seller-crm-btn-orange"
                        onClick={confirmDelete}
                      >
                        Yes, delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!viewState.open ? (
              <div className="seller-crm-table-wrap">
                {statusMessage ? (
                  <div
                    className={`alert ${
                      statusMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                    }`}
                    style={{ marginBottom: 16 }}
                  >
                    {statusMessage.text}
                  </div>
                ) : null}
                {loading ? (
                  <div className="seller-table__empty">Loading properties...</div>
                ) : null}
                <table className="seller-table seller-table--crm">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="seller-table__actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleServices.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="seller-table__empty">
                          No properties added yet. You can add {remainingPosts}{" "}
                          {remainingPosts === 1 ? "property" : "properties"} with
                          your current plan.
                        </td>
                      </tr>
                    ) : (
                      visibleServices.map((svc) => (
                        <tr key={svc.id}>
                          <td data-label="Image">
                            {svc.image ? (
                              <img
                                src={svc.image}
                                alt={svc.title}
                                style={{
                                  width: 46,
                                  height: 54,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td data-label="Title" className="seller-table__strong">{svc.title}</td>
                          
                          <td data-label="Location">{svc.location}</td>
                          <td data-label="Type">{svc.property_type_name || svc.type}</td>
                          <td data-label="Price">{svc.price}</td>
                          <td data-label="Status">
                            <button
                              type="button"
                              aria-label={`Property status ${svc.status}`}
                              className={`seller-crm-status-switch ${
                                svc.status === "Active"
                                  ? "seller-crm-status-switch--active"
                                  : ""
                              }`}
                              disabled={statusSavingId === String(svc.id)}
                              onClick={() => toggleStatus(svc)}
                              title={
                                svc.status === "Active"
                                  ? "Deactivate property"
                                  : "Activate property"
                              }
                            >
                              <span />
                            </button>
                          </td>
                          <td data-label="Actions" className="seller-table__actions">
                            <button
                              type="button"
                              className="seller-crm-icon-btn"
                              aria-label="View"
                              title="View details"
                              onClick={() => openView(svc.id)}
                            >
                              <i className="fa fa-eye" aria-hidden />
                            </button>
                            <NavLink
                              to={`/seller-services/${svc.id}/edit`}
                              className="seller-crm-icon-btn"
                              aria-label="Edit"
                              title="Edit property"
                              state={{ service: svc }}
                            >
                              <i className="fa fa-pencil" aria-hidden />
                            </NavLink>
                            
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <SimplePagination
                  page={pagination.currentPage || page}
                  perPage={pagination.perPage || PER_PAGE}
                  total={pagination.total || visibleServices.length}
                  lastPage={pagination.lastPage || 1}
                  loading={loading}
                  onPageChange={setPage}
                />
              </div>
            ) : !viewState.svc ? (
              <div className="seller-table__empty" style={{ marginTop: 12 }}>
                Property not found.
              </div>
            ) : (
              <div className="row" style={{ marginTop: 12 }}>
                <div className="col-lg-6 col-md-12 m-b20">
                  <img
                    src={viewState.svc.image}
                    alt={viewState.svc.title}
                    style={{
                      width: "100%",
                      maxHeight: 420,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                  {viewState.svc.gallery?.length ? (
                    <div className="seller-crm-media-preview__gallery m-t15">
                      {viewState.svc.gallery.slice(0, 5).map((image, index) => (
                        <div className="seller-crm-thumb" key={`${image}-${index}`}>
                          <img
                            src={image}
                            alt={`${viewState.svc.title} ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="col-lg-6 col-md-12">
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 10,
                      fontSize: 20,
                      fontWeight: 900,
                    }}
                  >
                    {viewState.svc.title}
                  </h2>
                  <div
                    className="seller-crm-service-view__grid"
                    style={{ marginTop: 6 }}
                  >
                    <div>
                      <div className="seller-crm-k">Location</div>
                      <div className="seller-crm-v">
                        {viewState.svc.location}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Property Type</div>
                      <div className="seller-crm-v">
                        {viewState.svc.property_type_name || viewState.svc.type}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Area Size</div>
                      <div className="seller-crm-v">
                        {viewState.svc.specifications.areaSize}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bedrooms</div>
                      <div className="seller-crm-v">
                        {viewState.svc.specifications.bedrooms}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bathrooms</div>
                      <div className="seller-crm-v">
                        {viewState.svc.specifications.bathrooms}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Parking</div>
                      <div className="seller-crm-v">
                        {viewState.svc.specifications.parking}
                      </div>
                    </div>  
                    <div>
                      <div className="seller-crm-k">Price</div>
                      <div className="seller-crm-v">{viewState.svc.price}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                      <div className="seller-crm-k">Short Description</div>
                      <div className="seller-crm-v">
                        {viewState.svc.shortDescription || "-"}
                      </div>
                    </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="seller-crm-k">Description</div>
                    <div className="seller-crm-v seller-crm-v--desc">
                      {viewState.svc.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}

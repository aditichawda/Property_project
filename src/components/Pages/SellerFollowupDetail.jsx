import React from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";

function getStoredFollowup(id) {
  if (typeof window === "undefined") return null;
  return safeJsonParse(
    localStorage.getItem(`seller_followup_detail_${id}`),
    null,
  );
}

function methodClass(method) {
  if (method === "Email") return "seller-crm-status--pending";
  if (method === "Call") return "seller-crm-status--interested";
  return "seller-crm-status--contacted";
}

export default function SellerFollowupDetail() {
  const { id } = useParams();
  const location = useLocation();
  const followup = location.state?.followup || getStoredFollowup(id);
  const methods = Array.isArray(followup?.followUp) ? followup.followUp : [];
  const raw = followup?.raw || {};

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Follow-up Detail</h2>
                <div className="seller-crm-subtitle">
                  Complete follow-up information.
                </div>
              </div>
              <NavLink
                to="/seller-dashboard"
                className="seller-crm-btn-outline"
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden /> Back
              </NavLink>
            </div>

            {!followup ? (
              <div className="seller-crm-card m-t20 seller-table__empty">
                Follow-up detail not found.
              </div>
            ) : (
              <div className="seller-crm-card m-t20">
                <div className="seller-followup-detail-grid">
                  <div>
                    <label>Customer Name</label>
                    <strong>{followup.name || "-"}</strong>
                  </div>
                  <div>
                    <label>Phone</label>
                    <strong>{followup.phone || "-"}</strong>
                  </div>
                  <div>
                    <label>Created Date</label>
                    <strong>{followup.date || "-"}</strong>
                  </div>
                  <div>
                    <label>Follow-up Type</label>
                    {methods.length ? (
                      <div className="seller-followup-methods">
                        {methods.map((method) => (
                          <span
                            key={method}
                            className={`seller-crm-status ${methodClass(method)}`}
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <strong>-</strong>
                    )}
                  </div>
                  <div>
                    <label>Next Follow-up Date</label>
                    <strong>
                      {raw.next_follow_up_date || raw.nextFollowUpDate || "-"}
                    </strong>
                  </div>
                  <div>
                    <label>Remark</label>
                    <p>{followup.remark || "-"}</p>
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

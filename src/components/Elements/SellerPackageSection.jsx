import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchPropertyPackages } from "../../api/propertyPackages";

export default function SellerPackageSection({ onSubscribe }) {
  const [paidPackages, setPaidPackages] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPropertyPackages()
      .then((list) => {
        if (active && list.length) setPaidPackages(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const visiblePackages = paidPackages
    .filter((pkg) => String(pkg.bannerUrl || "").trim())
    .slice(0, 2);

  if (!visiblePackages.length) return null;

  return (
    <section className="section-full p-t45 pb-5 bg-gray">
      <div className="container">
        <div className="seller-package-banner-grid">
          {visiblePackages.map((pkg) =>
            onSubscribe ? (
              <div className="seller-package-image-banner" key={pkg.id}>
                <img
                  src={pkg.bannerUrl}
                  alt={`${pkg.name} package`}
                  title={`${pkg.name} package`}
                />
                <button
                  type="button"
                  className="site-button btn-block seller-package-subscribe-btn"
                  onClick={() => onSubscribe(pkg)}
                >
                  <span>Subscribe Now</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/property-seller-packages"
                className="seller-package-image-banner"
                key={pkg.id}
                aria-label={`View ${pkg.name} package`}
              >
                <img
                  src={pkg.bannerUrl}
                  alt={`${pkg.name} package`}
                  title={`${pkg.name} package`}
                />
              </NavLink>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

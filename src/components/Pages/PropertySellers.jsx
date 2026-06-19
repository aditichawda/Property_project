import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import SearchableSelect from "../Elements/SearchableSelect";
import SimplePagination from "../Elements/SimplePagination";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import {
  fetchSolarUsersList,
  parseSolarUsersPagination,
  parseSolarUsersResponse,
  mapApiSellerToCard,
} from "../../api/solarUsers";

const bannerImg = require("./../../images/property/5.jpg");
const PER_PAGE = 20;

export default function PropertySellers() {
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: PER_PAGE,
    total: 0,
    lastPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatesLoading(true);
        const list = await fetchSolarStates();
        if (!cancelled) setStatesList(list || []);
      } catch {
        if (!cancelled) setStatesList([]);
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stateId) {
      setCitiesList([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        setCitiesLoading(true);
        const list = await fetchSolarCities(stateId);
        if (!cancelled) setCitiesList(list || []);
      } catch {
        if (!cancelled) setCitiesList([]);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stateId]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchSolarUsersList({
        page,
        perPage: PER_PAGE,
        stateId: stateId || undefined,
        cityId: cityId || undefined,
      });
      const { items } = parseSolarUsersResponse(raw, page, PER_PAGE);
      setSellers(items.map((item, index) => mapApiSellerToCard(item, index)));
      setPagination(parseSolarUsersPagination(raw, page, PER_PAGE));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Could not load sellers.");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, [cityId, page, stateId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const stateOptions = useMemo(
    () => statesList.map((state) => ({ value: String(state.id), label: state.name })),
    [statesList],
  );

  const cityOptions = useMemo(
    () => citiesList.map((city) => ({ value: String(city.id), label: city.name })),
    [citiesList],
  );

  const resetFilters = () => {
    setStateId("");
    setCityId("");
    setPage(1);
  };

  return (
    <>
      <SEO
        titleExact
         title="Property Sellers | List & Sell Properties with Infrio"
          description="List residential, commercial, and investment properties on Infrio's Property Sellers Marketplace. Reach genuine buyers, manage enquiries, and sell your property efficiently through a secure and user-friendly real estate platform."
         canonicalPath="/property-sellers"
          keywords="property sellers, sell property online, property listing platform, list property for sale, property selling website, real estate sellers, sell house online, sell commercial property, sell residential property, property sale platform, property advertising platform, real estate marketplace."
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Property Sellers"
          pagename="Property Sellers"
          description="Browse property sellers by state and city."
          bgimage={bannerImg}
        />

        <div className="section-full p-t40 p-b70 bg-gray mobile-page-padding">
          <div className="container">
            <div className="row m-b30 align-items-end solar-seller-filters">
              <div className="col-md-4 col-sm-12 m-b15">
                <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                  State
                </label>
                <SearchableSelect
                  value={stateId}
                  options={stateOptions}
                  onChange={(value) => {
                    setStateId(value || "");
                    setCityId("");
                    setPage(1);
                  }}
                  placeholder={statesLoading ? "Loading states..." : "Search state..."}
                  isDisabled={statesLoading}
                  isLoading={statesLoading}
                  isClearable
                />
              </div>

              <div className="col-md-4 col-sm-12 m-b15">
                <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                  City
                </label>
                <SearchableSelect
                  value={cityId}
                  options={cityOptions}
                  onChange={(value) => {
                    setCityId(value || "");
                    setPage(1);
                  }}
                  placeholder={
                    !stateId
                      ? "Select state first"
                      : citiesLoading
                        ? "Loading cities..."
                        : "Search city..."
                  }
                  isDisabled={!stateId || citiesLoading}
                  isLoading={citiesLoading}
                  isClearable
                />
              </div>

              <div className="col-md-4 col-sm-12 m-b15 text-md-right">
                <button
                  type="button"
                  className="site-button-link inline-block btn-unstyled"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center p-a30 bg-white radius-md">Loading sellers...</p>
            ) : null}

            <div className="row">
              {!loading && sellers.length === 0 ? (
                <div className="col-12">
                  <p className="text-center p-a30 bg-white radius-md">
                    No sellers match these filters.
                  </p>
                </div>
              ) : (
                sellers.map((seller) => (
                  <div
                    className="col-lg-4 col-md-6 m-b30"
                    key={`${seller.id}-${seller.membername}`}
                  >
                    <NavLink
                      to={`/property-sellers/${seller.id}`}
                      className="solar-seller-card-link"
                      style={{ display: "block" }}
                    >
                      <article
                        className="our-team-2 solar-seller-card"
                        style={{ height: "330px", cursor: "pointer" }}
                      >
                        <div className="profile-image">
                          <img
                            src={seller.image}
                            alt={seller.membername}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="figcaption text-black">
                          <h4 className="m-t0">{seller.membername}</h4>
                          <span className="m-b0 sx-text-primary">
                            {seller.activeproperty}
                          </span>
                          <p className="solar-seller-meta m-b5">
                            <i className="fa fa-map-marker sx-text-primary m-r5" />
                            {seller.location}
                          </p>
                          <p className="font-14 m-b0 solar-seller-address">
                            {seller.description}
                          </p>
                        </div>
                      </article>
                    </NavLink>
                  </div>
                ))
              )}
            </div>

            {error ? <p className="text-center text-danger m-t15">{error}</p> : null}
            <SimplePagination
              page={pagination.currentPage || page}
              perPage={pagination.perPage || PER_PAGE}
              total={pagination.total || sellers.length}
              lastPage={pagination.lastPage || 1}
              loading={loading}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

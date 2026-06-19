import React, { useEffect, useMemo, useState } from "react";
import { SellerCard } from "./Team3";
import SearchableSelect from "./SearchableSelect";
import {
  fallbackPropertyTypeOptions,
  fetchPropertyTypes,
} from "../../api/propertyTypes";
import {
  fetchProperties,
  normalizePropertyPaginationResponse,
} from "../../api/properties";
import SimplePagination from "./SimplePagination";

const PER_PAGE = 20;

export default function SolarSellersBrowse() {
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("Active");
  const [priceRange, setPriceRange] = useState("");
  const [propertyTypes, setPropertyTypes] = useState(
    fallbackPropertyTypeOptions,
  );
  const [apiProperties, setApiProperties] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
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
        setPropertyTypesLoading(true);
        const list = await fetchPropertyTypes();
        if (!cancelled && list.length) setPropertyTypes(list);
      } catch {
        if (!cancelled) setPropertyTypes(fallbackPropertyTypeOptions());
      } finally {
        if (!cancelled) setPropertyTypesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPropertiesLoading(true);
        const response = await fetchProperties({
          property_type_id: propertyType || undefined,
          status: status === "Active" ? 1 : 0,
          search: search || undefined,
          page,
          per_page: PER_PAGE,
        });
        const next = normalizePropertyPaginationResponse(response, {
          page,
          perPage: PER_PAGE,
        });
        if (!cancelled) {
          setApiProperties(next.items);
          setPagination(next.pagination);
        }
      } catch {
        if (!cancelled) setApiProperties([]);
      } finally {
        if (!cancelled) setPropertiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, propertyType, status, page]);

  const resetFilters = () => {
    setSearch("");
    setPropertyType("");
    setStatus("Active");
    setPriceRange("");
    setPage(1);
  };

  const typeOptions = propertyTypes.map((item) => ({
    value: String(item.id || item.name),
    label: item.name,
  }));
  const priceOptions = [
    { value: "0-4000000", label: "Up to Rs. 40 Lac" },
    { value: "4000000-7000000", label: "Rs. 40 Lac - Rs. 70 Lac" },
    { value: "7000000-10000000", label: "Rs. 70 Lac - Rs. 1 Cr" },
  ];

  const properties = useMemo(() => {
    return apiProperties
      .filter((property) => {
        const [minPrice, maxPrice] = priceRange.split("-").map(Number);
        const priceMatch =
          !priceRange ||
          (property.priceValue >= minPrice && property.priceValue <= maxPrice);
        const searchText = [
          property.title,
          property.location,
          property.city,
          property.area,
        ]
          .join(" ")
          .toLowerCase();
        const searchMatch =
          !search.trim() || searchText.includes(search.trim().toLowerCase());
        return (
          searchMatch &&
          (!propertyType ||
            String(property.property_type_id || property.type) ===
              String(propertyType)) &&
          (!status || property.status === status) &&
          priceMatch
        );
      })
      .map((property) => ({
        id: property.id,
        membername: property.title,
        position: `${property.type}`,
        price: property.price,
        status: property.status,
        location: property.location,
        description: property.shortDescription,
        image: property.image,
        fallbackImage: property.image,
        state: { activeNav: "properties" },
      }));
  }, [apiProperties, priceRange, propertyType, search, status]);

  return (
    <div className="section-full p-b50 mobile-page-padding bg-gray solar-sellers-section p-t20">
      <div className="container">
        <div className="section-content">
          <p className="m-b30 max-w900 solar-section-intro">
            Search active properties by name, city, location, type, and budget.
            Listings update instantly from current property data.
          </p>

          <div className="row m-b30 align-items-end solar-seller-filters">
            <div className="col-lg-4 col-md-6 m-b15">
              <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                Search
              </label>
              <input
                className="form-control"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search property name, city, or location..."
              />
            </div>
            <div className="col-lg-3 col-md-6 m-b15">
              <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                Type
              </label>
              <SearchableSelect
                value={propertyType}
                options={typeOptions}
                onChange={(value) => {
                  setPropertyType(value || "");
                  setPage(1);
                }}
                placeholder="All types"
                isLoading={propertyTypesLoading}
                isClearable
              />
            </div>
            <div className="col-lg-3 col-md-6 m-b15">
              {/* <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                Price Range
              </label> */}
              {/* <SearchableSelect
                value={priceRange}
                options={priceOptions}
                onChange={(value) => {
                  setPriceRange(value || "");
                  setPage(1);
                }}
                placeholder="Any budget"
                isClearable
              /> */}
            </div>
            <div className="col-lg-2 col-md-6 m-b15">
              <button
                type="button"
                className="site-button-link inline-block btn-unstyled solar-filter-reset"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="row team-item-four solar-sellers-grid-page">
            {properties.length === 0 ? (
              <div className="col-12">
                <p className="text-center p-a30 bg-white radius-md">
                  {propertiesLoading
                    ? "Loading properties..."
                    : "No active properties match these filters."}
                </p>
              </div>
            ) : (
              properties.map((item) => (
                <div
                  className="col-xl-3 col-lg-4 col-md-6 col-sm-6 m-b30"
                  key={`${item.id}-${item.membername}`}
                >
                  <SellerCard item={item} />
                </div>
              ))
            )}
          </div>
          <SimplePagination
            page={pagination.currentPage || page}
            perPage={pagination.perPage || PER_PAGE}
            total={pagination.total || properties.length}
            lastPage={pagination.lastPage || 1}
            loading={propertiesLoading}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}

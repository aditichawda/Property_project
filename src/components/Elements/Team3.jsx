import React from "react";
import { Link } from "react-router-dom";
import { SELLERS, SELLER_LOCATIONS } from "../../data/solarData";
import {
  fetchSolarUsersList,
  mapApiSellerToCard,
  parseSolarUsersResponse,
} from "../../api/solarUsers";

var bgimg1 = require("./../../images/background/cross-line2.png");

function TrustedSellersHomeCarousel({ scrollRef, onScrollPrev, onScrollNext }) {
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const raw = await fetchSolarUsersList({ page: 1, perPage: 10 });
        const { items } = parseSolarUsersResponse(raw, 1, 10);
        if (!cancelled) {
          setMembers(items.slice(0, 10).map((item, index) => mapApiSellerToCard(item, index)));
        }
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="position-relative solar-sellers-carousel-wrap">
      {members.length === 0 ? (
        <p className="text-center p-a20 bg-white radius-md">
          {loading ? "Loading sellers..." : "No sellers found."}
        </p>
      ) : null}
      <button
        type="button"
        className="solar-carousel-nav solar-carousel-nav--prev"
        onClick={onScrollPrev}
        aria-label="Previous sellers"
        disabled={members.length === 0}
      >
        <i className="fa fa-angle-left" />
      </button>
      <button
        type="button"
        className="solar-carousel-nav solar-carousel-nav--next"
        onClick={onScrollNext}
        aria-label="Next sellers"
        disabled={members.length === 0}
      >
        <i className="fa fa-angle-right" />
      </button>
      <div className="sellers-scroll-track" ref={scrollRef}>
        {members.map((seller) => (
          <div className="sellers-scroll-item" key={seller.id}>
            <PropertySellerCard seller={seller} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertySellerCard({ seller }) {
  return (
    <Link
      to={`/property-sellers/${seller.id}`}
      className="solar-seller-card-link"
      style={{ display: "block" }}
      aria-label={`View ${seller.membername || seller.company || "seller"}`}
    >
      <article
        className="our-team-2 solar-seller-card"
        style={{ height: "330px", cursor: "pointer" }}
      >
        <div className="profile-image">
          <img
            src={seller.image}
            alt={seller.membername || seller.company || "Property seller"}
            loading="lazy"
            decoding="async"
            onError={(ev) => {
              if (
                seller.fallbackImage &&
                ev.currentTarget.src !== seller.fallbackImage
              ) {
                ev.currentTarget.src = seller.fallbackImage;
              }
            }}
          />
        </div>
        <div className="figcaption text-black">
          <h4 className="m-t0">{seller.membername || seller.company}</h4>
          <span className="m-b0 sx-text-primary">
            {seller.activeproperty ||
              `${seller.totalProperties || 0} active properties`}
          </span>
          <p className="solar-seller-meta m-b5">
            <i className="fa fa-map-marker sx-text-primary m-r5" />
            {seller.location ||
              [seller.area, seller.city, seller.state].filter(Boolean).join(", ")}
          </p>
          <p className="font-14 m-b0 solar-seller-address">
            {seller.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

function SellerCard({ item }) {
  return (
    <Link
      to={item.href || `/properties/${item.id}`}
      state={item.state}
      className="solar-seller-card-link solar-property-card-link"
      aria-label={`View ${item.membername}`}
    >
      <div className="our-team-2 solar-seller-card solar-property-card">
        <div className="profile-image">
          <img
            src={item.image}
            alt={item.membername}
            title={item.membername}
            loading="lazy"
            decoding="async"
            onError={(ev) => {
              if (
                item.fallbackImage &&
                ev.currentTarget.src !== item.fallbackImage
              ) {
                ev.currentTarget.src = item.fallbackImage;
              }
            }}
          />
        </div>
        <div className="figcaption text-black">
          <div className="d-flex justify-content-between align-items-center m-b10">
            {item.price ? (
              <span
                className="sx-text-primary"
                style={{ fontWeight: 800, fontSize: 18 }}
              >
                {item.price}
              </span>
            ) : null}
          </div>
          <h4 className="m-t0">
            <span className="solar-seller-name">{item.membername}</span>
          </h4>
          <span className="m-b0 sx-text-primary">{item.position}</span>

          <p className="solar-seller-meta m-b5">
            <i className="fa fa-map-marker sx-text-primary m-r5" />
            {item.location}
          </p>
          <p className="font-14 m-b0 solar-seller-address">
            {item.description}
          </p>
          <span className="solar-property-view-btn">View Details</span>
        </div>
      </div>
    </Link>
  );
}

class Team3 extends React.Component {
  static defaultProps = {
    mode: "home",
    showFilters: false,
  };

  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.state = {
      ratingFilter: "all",
      locationFilter: "All",
    };
  }

  getFilteredMembers() {
    let list = [...SELLERS];
    if (this.state.ratingFilter === "5") {
      list = list.filter((s) => s.rating === 5);
    } else if (this.state.ratingFilter === "4") {
      list = list.filter((s) => s.rating >= 4);
    }
    if (this.state.locationFilter && this.state.locationFilter !== "All") {
      list = list.filter((s) => s.location === this.state.locationFilter);
    }
    return list;
  }

  scrollByDir = (dir) => {
    const el = this.scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 340);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  render() {
    const { mode, showFilters } = this.props;
    const isHome = mode === "home";
    const isPage = mode === "page";
    const members = isHome ? SELLERS : this.getFilteredMembers();

    return (
      <div
        id="sellers"
        className={`section-full p-b50 mobile-page-padding bg-gray scroll-spy-section solar-sellers-section ${isPage ? "p-t20" : ""}`}
      >
        <div className="container">
          {!isPage && (
            <div className="section-head">
              <div className="sx-separator-outer separator-left">
                <div
                  className="sx-separator bg-white bg-moving bg-repeat-x"
                  style={{ backgroundImage: "url(" + bgimg1 + ")" }}
                >
                  <h3 className="sep-line-one">Property Sellers</h3>
                </div>
              </div>
            </div>
          )}
          <div className="section-content">
            <p className="m-b30 max-w900 solar-section-intro">
              Connect with property sellers by location and view only their
              listed flats, houses, plots, and commercial properties.
            </p>

            {showFilters && (
              <div className="row m-b30 align-items-end solar-seller-filters">
                <div className="col-md-4 col-sm-6 m-b15">
                  <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                    Rating
                  </label>
                  <select
                    className=""
                    value={this.state.ratingFilter}
                    onChange={(e) =>
                      this.setState({ ratingFilter: e.target.value })
                    }
                  >
                    <option value="all">All ratings</option>
                    <option value="5">5 stars only</option>
                    <option value="4">4+ stars</option>
                  </select>
                </div>
                <div className="col-md-4 col-sm-6 m-b15">
                  <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                    Location
                  </label>
                  <select
                    className=""
                    value={this.state.locationFilter}
                    onChange={(e) =>
                      this.setState({ locationFilter: e.target.value })
                    }
                  >
                    {SELLER_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 col-sm-12 m-b15 text-md-right">
                  <button
                    type="button"
                    className="site-button-link m-t30 inline-block btn-unstyled"
                    onClick={() =>
                      this.setState({
                        ratingFilter: "all",
                        locationFilter: "All",
                      })
                    }
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            )}

            {isHome ? (
              <TrustedSellersHomeCarousel
                scrollRef={this.scrollRef}
                onScrollPrev={() => this.scrollByDir(-1)}
                onScrollNext={() => this.scrollByDir(1)}
              />
            ) : (
              <div className="row team-item-four solar-sellers-grid-page">
                {members.length === 0 ? (
                  <div className="col-12">
                    <p className="text-center p-a30 bg-white radius-md">
                      No sellers match these filters. Try adjusting rating or
                      location.
                    </p>
                  </div>
                ) : (
                  members.map((item) => (
                    <div
                      className="col-xl-3 col-lg-4 col-md-6 col-sm-6 m-b30"
                      key={item.id}
                    >
                      <SellerCard item={item} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Team3;
export { SellerCard, PropertySellerCard };

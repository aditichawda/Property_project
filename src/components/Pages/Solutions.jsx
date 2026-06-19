import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import SolarServicesCatalog from "../Elements/SolarServicesCatalog";
import SearchableSelect from "../Elements/SearchableSelect";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { fetchSolarCities, fetchSolarStates } from "../../api/solarLocations";

class Solutions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statesList: [],
      citiesList: [],
      statesLoading: true,
      citiesLoading: false,
      stateId: "",
      cityId: "",
    };
  }

  componentDidMount() {
    let cancelled = false;
    (async () => {
      try {
        this.setState({ statesLoading: true });
        const list = await fetchSolarStates();
        if (!cancelled)
          this.setState({ statesList: Array.isArray(list) ? list : [] });
      } catch {
        if (!cancelled) this.setState({ statesList: [] });
      } finally {
        if (!cancelled) this.setState({ statesLoading: false });
      }
    })();
    this._cancelSolutionsLocations = () => {
      cancelled = true;
    };
  }

  componentWillUnmount() {
    if (typeof this._cancelSolutionsLocations === "function")
      this._cancelSolutionsLocations();
  }

  onStateChange = async (e) => {
    const nextId = e.target.value;
    this.setState({ stateId: nextId, cityId: "", citiesList: [] });
    if (!nextId) return;
    try {
      this.setState({ citiesLoading: true });
      const list = await fetchSolarCities(nextId);
      this.setState({ citiesList: Array.isArray(list) ? list : [] });
    } catch {
      this.setState({ citiesList: [] });
    } finally {
      this.setState({ citiesLoading: false });
    }
  };

  onCityChange = (e) => {
    this.setState({ cityId: e.target.value });
  };

  resetFilters = () => {
    this.setState({ stateId: "", cityId: "", citiesList: [] });
  };

  render() {
    const {
      statesList,
      citiesList,
      statesLoading,
      citiesLoading,
      stateId,
      cityId,
    } = this.state;
    const stateOptions = statesList.map((s) => ({
      value: String(s.id),
      label: s.name,
    }));
    const cityOptions = citiesList.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
    return (
      <>
        <SEO
          titleExact
          title="Services – Solar Systems & Services"
          description="Explore our complete set of solar solutions. From design and installation to monitoring and maintenance, find the right option for your home or business."
          canonicalPath="/services"
          keywords="solar solutions, solar systems, solar maintenance, solar monitoring, solar design"
        />
        <Header2 />
        <div className="page-content">
          <Banner
            title="Services"
            pagename="Services"
            description="Explore the complete set of solar services we offer."
            bgimage={SOLAR_IMAGES.bannerSolutions}
          />

          <div className="section-full bg-white p-t20 p-b0">
            <div className="container">
              <div className="row align-items-end solar-seller-filters">
                <div className="col-md-4 col-sm-12 m-b15">
                  <label className="d-block font-12 text-uppercase m-b8 solar-filter-label">
                    State
                  </label>
                  <SearchableSelect
                    className=""
                    value={stateId}
                    options={stateOptions}
                    onChange={(value) =>
                      this.onStateChange({ target: { value } })
                    }
                    placeholder={
                      statesLoading ? "Loading states..." : "Search state..."
                    }
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
                    className=""
                    value={cityId}
                    options={cityOptions}
                    onChange={(value) =>
                      this.onCityChange({ target: { value } })
                    }
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
                    onClick={this.resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <SolarServicesCatalog
            stateId={stateId}
            cityId={cityId}
            hideSectionTitle
          />
        </div>
        <Footer2 />
      </>
    );
  }
}

export default Solutions;

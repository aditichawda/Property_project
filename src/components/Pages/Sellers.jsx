import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import SolarSellersBrowse from "../Elements/SolarSellersBrowse";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { PROPERTY_IMAGES } from "../../data/propertyImages";

class Sellers extends React.Component {
  render() {
    return (
      <>
        <SEO
          titleExact
          title="Properties for Sale | Buy Property Online with Infrio"
          description="Discover residential, commercial, and investment properties on Infrio. Browse property listings, connect with sellers, compare options, and find your ideal property through a secure and user-friendly real estate marketplace."
          canonicalPath="/properties"
          keywords="properties for sale, buy property online, property listings, real estate listings, residential properties for sale, commercial properties for sale, investment properties, property marketplace, buy house online, apartments for sale, flats for sale, plots for sale, land for sale."
        />
        <Header2 />
        <div className="page-content">
          <Banner
            title="Properties"
            pagename="Properties"
            description="Search active properties and send direct seller enquiries."
            bgimage={PROPERTY_IMAGES.bannerDefault}
          />
          <SolarSellersBrowse />
        </div>
        <Footer2 />
      </>
    );
  }
}

export default Sellers;

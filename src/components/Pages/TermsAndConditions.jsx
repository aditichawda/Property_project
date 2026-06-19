import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import Banner from "../Elements/Banner";

const bnrimg = require("./../../images/property/2.jpg");

function TermsAndConditions() {
  return (
    <>
      <Header2 />
      <div className="page-content">
        <Banner
          title="Terms & Conditions"
          pagename="Terms & Conditions"
          description="Please read these terms carefully before using our website."
          bgimage={bnrimg}
        />

        <div className="section-full p-t80 p-b80 bg-white">
          <div className="container">
            <h2>Terms & Conditions</h2>

            <p>
              By using Infrio Property, you agree to these Terms & Conditions.
            </p>

            <h4>Website Purpose</h4>
            <p>
              Our platform connects property buyers and sellers through an
              inquiry-based system.
            </p>

            <h4>User Responsibilities</h4>
            <p>
              Users must provide accurate information and use the website lawfully.
            </p>

            <h4>Property Listings</h4>
            <p>
              Property details are provided by sellers, and we do not guarantee
              their accuracy.
            </p>

            <h4>Intellectual Property</h4>
            <p>
              All website content is owned by Infrio Property and may not be
              copied without permission.
            </p>

            <h4>Limitation of Liability</h4>
            <p>
              We are not liable for any disputes or losses arising from property
              transactions.
            </p>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

export default TermsAndConditions;
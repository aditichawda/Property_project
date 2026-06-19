import React from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import Banner from "../Elements/Banner";

const bnrimg = require("./../../images/property/2.jpg");

function PrivacyPolicy() {
  return (
    <>
      <Header2 />
      <div className="page-content">
        <Banner
          title="Privacy Policy"
          pagename="Privacy Policy"
          description="Your privacy and data protection are important to us."
          bgimage={bnrimg}
        />

        <div className="section-full p-t80 p-b80 bg-white">
          <div className="container">
            <h2>Privacy Policy</h2>
            <p>
              Welcome to Infrio Property. We respect your privacy and are
              committed to protecting the personal information you share with us.
            </p>

            <h4>Information We Collect</h4>
            <p>
              We may collect personal information such as your name, email,
              mobile number, city, and inquiry details submitted through forms.
            </p>

            <h4>How We Use Your Information</h4>
            <p>
              The information collected helps us respond to inquiries, connect
              buyers and sellers, and improve our services.
            </p>

            <h4>Information Sharing</h4>
            <p>
              We do not sell or rent your personal information to third parties.
            </p>

            <h4>Data Security</h4>
            <p>
              We use appropriate security measures to protect your data.
            </p>

            <h4>Contact Us</h4>
            <p>
              If you have any questions regarding this policy, please contact us.
            </p>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

export default PrivacyPolicy;
import React from "react";
import Select from "react-select";
import { submitInfrInquiry } from "../../api/solarInquiry";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";

class ConsultationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      isSubmitting: false,
      showThankYou: false,
      submitError: "",
      statesList: [],
      citiesList: [],
      loadingStates: false,
      loadingCities: false,
    };
  }

  componentDidMount() {
    this.loadStates();
  }

  loadStates = async () => {
    this.setState({ loadingStates: true });
    try {
      const data = await fetchSolarStates();
      this.setState({
        statesList: data.map((s) => ({ value: s.id, label: s.name })),
      });
    } catch (error) {
      console.error("Failed to load states", error);
    } finally {
      this.setState({ loadingStates: false });
    }
  };

  setFormValue = (name, value) => {
    const { handleChange } = this.props;
    if (typeof handleChange === "function") {
      handleChange({ target: { name, value } });
    }
  };

  handleStateChange = async (option) => {
    const stateId = option ? option.value : "";
    const stateName = option ? option.label : "";
    this.setFormValue("stateId", stateId);
    this.setFormValue("state", stateName);
    this.setFormValue("cityId", "");
    this.setFormValue("city", "");
    this.clearErrorsOnChange("state");
    this.clearErrorsOnChange("city");
    this.setState({ citiesList: [] });

    if (!stateId) return;
    this.setState({ loadingCities: true });
    try {
      const data = await fetchSolarCities(stateId);
      this.setState({
        citiesList: data.map((c) => ({ value: c.id, label: c.name })),
      });
    } catch (error) {
      console.error("Failed to load cities", error);
    } finally {
      this.setState({ loadingCities: false });
    }
  };

  handleCityChange = (option) => {
    this.setFormValue("cityId", option ? option.value : "");
    this.setFormValue("city", option ? option.label : "");
    this.clearErrorsOnChange("city");
  };

  validateForm = () => {
    const { formData } = this.props;
    const errors = {};

    if (!String(formData.name || "").trim()) {
      errors.name = "Name is required";
    }

    if (!String(formData.phone || "").trim()) {
      errors.phone = "Phone is required";
    } else if (
      !/^\d{10}$/.test(String(formData.phone || "").replace(/\D/g, ""))
    ) {
      errors.phone = "Phone must be exactly 10 digits";
    }

    if (!String(formData.email || "").trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email || ""))
    ) {
      errors.email = "Please enter a valid email";
    }

    if (!String(formData.city || "").trim()) {
      errors.city = "City is required";
    }

    if (!String(formData.message || "").trim()) {
      errors.message = "Message is required";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  clearErrorsOnChange = (fieldName) => {
    // Clear error for specific field when user starts typing
    if (this.state.errors[fieldName] || this.state.submitError) {
      const newErrors = { ...this.state.errors };
      delete newErrors[fieldName];
      this.setState({ errors: newErrors, submitError: "" });
    }
  };

  handleClick = async (e) => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setState({ isSubmitting: true, submitError: "" });

    const { formData, onResetForm } = this.props;

    try {
      await submitInfrInquiry(formData);
      this.setState({
        isSubmitting: false,
        showThankYou: true,
        submitError: "",
      });
      if (typeof onResetForm === "function") {
        onResetForm();
      }
      setTimeout(() => {
        this.setState({ showThankYou: false });
        this.props.toggleModal();
      }, 3000);
    } catch (error) {
      console.error(error);
      this.setState({
        isSubmitting: false,
        submitError:
          error?.message ||
          "Unable to submit enquiry right now. Please try again.",
      });
    }
  };

  render() {
    const { show, toggleModal, formData, handleChange, handleServiceCheckbox } =
      this.props;
    const {
      errors,
      isSubmitting,
      showThankYou,
      submitError,
      statesList,
      citiesList,
      loadingStates,
      loadingCities,
    } = this.state;
    const selectStyles = {
      menuPortal: (base) => ({ ...base, zIndex: 20000 }),
    };

    const setPhoneDigitsOnly = (e) => {
      const nextDigits = String(e.target.value || "")
        .replace(/\D/g, "")
        .slice(0, 10);
      // keep original handleChange API (event)
      handleChange({ target: { name: "phone", value: nextDigits } });
      this.clearErrorsOnChange("phone");
    };

    if (!show) return null;

    if (showThankYou) {
      return (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: "20px",
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "clamp(15px, 3vw, 30px)",
              borderRadius: "10px",
              width: "clamp(320px, 90vw, 400px)",
              textAlign: "center",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                color: "#28a745",
                marginBottom: "20px",
                fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
              }}
            >
              Thank You!
            </h3>
            <p
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                marginBottom: "10px",
              }}
            >
              Your property enquiry has been submitted successfully
            </p>
            <p style={{ fontSize: "clamp(14px, 2.5vw, 16px)" }}>
              We'll get back to you soon!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: "20px",
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            background: "#fff",
            padding: "clamp(15px, 3vw, 30px)",
            borderRadius: "10px",
            width: "clamp(320px, 95vw, 500px)",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Close Button */}
          <button
            onClick={toggleModal}
            style={{
              position: "absolute",
              top: "clamp(5px, 2vw, 10px)",
              right: "clamp(5px, 2vw, 10px)",
              border: "none",
              background: "transparent",
              fontSize: "clamp(16px, 3vw, 18px)",
              cursor: "pointer",
              padding: "clamp(5px, 1vw, 8px)",
              borderRadius: "50%",
              width: "clamp(30px, 6vw, 35px)",
              height: "clamp(30px, 6vw, 35px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✖
          </button>

          <h3
            className="mb-4 text-center"
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
              marginBottom: "clamp(15px, 4vw, 25px)",
            }}
          >
            Free Property Guidance
          </h3>

          <form onSubmit={this.handleClick}>
            {submitError ? (
              <div className="alert alert-warning mb-3">{submitError}</div>
            ) : null}
            <div className="mb-3">
              <input
                type="text"
                name="name"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => {
                  handleChange(e);
                  this.clearErrorsOnChange("name");
                }}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  padding: "clamp(8px, 2vw, 12px)",
                }}
                required
              />
              {errors.name && (
                <div className="text-danger mt-1">{errors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <input
                type="tel"
                name="phone"
                placeholder="Phone *"
                value={formData.phone}
                onChange={setPhoneDigitsOnly}
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  padding: "clamp(8px, 2vw, 12px)",
                }}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                required
              />
              {errors.phone && (
                <div className="text-danger mt-1">{errors.phone}</div>
              )}
            </div>

            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  this.clearErrorsOnChange("email");
                }}
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  padding: "clamp(8px, 2vw, 12px)",
                }}
                required
              />
              {errors.email && (
                <div className="text-danger mt-1">{errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <input
                type="text"
                name="city"
                placeholder="Select City *"
                value={formData.city}
                onChange={(e) => {
                  handleChange(e);
                  this.clearErrorsOnChange("city");
                }}
                className={`form-control ${errors.city ? "is-invalid" : ""}`}
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  padding: "clamp(8px, 2vw, 12px)",
                }}
                required
              />
              {errors.city && (
                <div className="text-danger mt-1">{errors.city}</div>
              )}
            </div>
            <div className="mb-3">
              <textarea
                name="message"
                placeholder="Message *"
                rows="3"
                value={formData.message}
                onChange={(e) => {
                  handleChange(e);
                  this.clearErrorsOnChange("message");
                }}
                className={`form-control ${errors.message ? "is-invalid" : ""}`}
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  padding: "clamp(8px, 2vw, 12px)",
                }}
                required
              />
              {errors.message && (
                <div className="text-danger mt-1">{errors.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="site-button btn-block"
              disabled={isSubmitting}
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                padding: "clamp(10px, 2.5vw, 15px)",
                minHeight: "clamp(40px, 6vh, 50px)",
                width: "100%",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default ConsultationModal;

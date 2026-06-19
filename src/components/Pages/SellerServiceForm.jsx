import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import SearchableSelect from "../Elements/SearchableSelect";
import {
  fallbackPropertyTypeOptions,
  fetchPropertyTypes,
} from "../../api/propertyTypes";
import {
  createProperty,
  fetchSellerProperties,
  fetchPropertyDetail,
  getCurrentSellerId,
  updateProperty,
} from "../../api/properties";
import { getSellerPostLimit, readSellerPackage } from "../../data/sellerPackages";

const MAX_GALLERY_IMAGES = 10;

function emptyForm() {
  return {
    title: "",
    propertyTypeId: "1",
    type: "Flats",
    purpose: "Sale",
    status: "Active",
    location: "",
    city: "",
    area: "",
    price: "",
    areaSize: "",
    bedrooms: "",
    bathrooms: "",
    parking: "",
    shortDescription: "",
    description: "",
    amenities: "",
    image: "",
    gallery: [],
  };
}

function priceValueFromLabel(value) {
  const text = String(value || "").toLowerCase();
  const numeric = Number(text.replace(/[^\d.]/g, "")) || 0;
  if (!numeric) return 0;
  if (text.includes("cr")) return Math.round(numeric * 10000000);
  if (text.includes("lac") || text.includes("lakh")) {
    return Math.round(numeric * 100000);
  }
  if (text.includes("million")) return Math.round(numeric * 1000000);
  return Math.round(numeric);
}

function priceInputFromProperty(existing) {
  const priceValue = existing.priceValue ?? existing.price_value;
  if (
    priceValue !== undefined &&
    priceValue !== null &&
    String(priceValue).trim()
  ) {
    return String(priceValue);
  }
  return String(existing.price || "").replace(/[₹,]/g, "").trim();
}

function formFromProperty(existing) {
  return {
    title: existing.title || "",
    propertyTypeId:
      existing.property_type_id || existing.propertyTypeId || existing.typeId || "",
    type: existing.property_type_name || existing.type || "Flats",
    purpose: existing.purpose || "Sale",
    status: existing.status || "Active",
    location: existing.location || "",
    city: existing.city || "",
    area: existing.area || "",
    price: priceInputFromProperty(existing),
    areaSize: existing.specifications?.areaSize || "",
    bedrooms: String(existing.specifications?.bedrooms || ""),
    bathrooms: String(existing.specifications?.bathrooms || ""),
    parking: existing.specifications?.parking || "",
    shortDescription:
      existing.shortDescription || (existing.description || "").slice(0, 180),
    description: existing.description || "",
    amenities: Array.isArray(existing.amenities)
      ? existing.amenities.join(", ")
      : "",
    image: existing.image || "",
    gallery: Array.isArray(existing.gallery)
      ? existing.gallery.slice(0, MAX_GALLERY_IMAGES)
      : [],
  };
}

function readFilesAsDataUrls(files) {
  return Promise.all(
    Array.from(files || []).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export default function SellerServiceForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [existing, setExisting] = useState(location.state?.service || null);

  const [form, setForm] = useState(() => {
    if (!isEdit || !existing) return emptyForm();
    return formFromProperty(existing);
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [apiMessageType, setApiMessageType] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryMessage, setGalleryMessage] = useState("");
  const [propertyTypes, setPropertyTypes] = useState(
    fallbackPropertyTypeOptions,
  );
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const detail = await fetchPropertyDetail({
          id,
          sellerId: getCurrentSellerId(),
        });
        if (!cancelled && detail?.id) {
          setExisting(detail);
          setForm(formFromProperty(detail));
        }
      } catch {
        if (!cancelled && !existing) setExisting(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPropertyTypesLoading(true);
        const list = await fetchPropertyTypes();
        if (!cancelled && list.length) {
          setPropertyTypes(list);
        }
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

  const propertyTypeOptions = useMemo(() => {
    const options = propertyTypes.map((item) => ({
        value: String(item.id || item.name),
        label: item.name,
      }));
    const selectedValue = String(form.propertyTypeId || form.type || "");
    if (selectedValue && !options.some((item) => item.value === selectedValue)) {
      return [{ value: selectedValue, label: form.type }, ...options];
    }
    return options;
  }, [form.propertyTypeId, form.type, propertyTypes]);

  const errors = useMemo(() => {
    const next = {};
    if (!form.title.trim()) next.title = "Property title is required.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.price.trim()) next.price = "Price is required.";
    if (!form.shortDescription.trim()) {
      next.shortDescription = "Short description is required.";
    }
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.image) next.image = "Thumbnail image is required.";
    if (!form.gallery.length) {
      next.gallery = "At least one gallery image is required.";
    }
    return next;
  }, [form]);

  const setField = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files?.[0] || null;
    const [image] = await readFilesAsDataUrls(event.target.files);
    event.target.value = "";
    if (!image) return;
    setThumbnailFile(file);
    setForm((prev) => ({ ...prev, image }));
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    const images = await readFilesAsDataUrls(files);
    event.target.value = "";
    if (!images.length) return;
    setForm((prev) => {
      const availableSlots = MAX_GALLERY_IMAGES - prev.gallery.length;
      if (availableSlots <= 0) {
        setGalleryMessage(
          `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed.`,
        );
        return prev;
      }
      const selectedImages = images.slice(0, availableSlots);
      const selectedFiles = files.slice(0, availableSlots);
      const skippedCount = images.length - selectedImages.length;
      setGalleryMessage(
        skippedCount > 0
          ? `Only ${availableSlots} more image${
              availableSlots === 1 ? "" : "s"
            } added. Maximum ${MAX_GALLERY_IMAGES} gallery images allowed.`
          : "",
      );
      setGalleryFiles((prevFiles) =>
        [...prevFiles, ...selectedFiles].slice(0, MAX_GALLERY_IMAGES),
      );
      return { ...prev, gallery: [...prev.gallery, ...selectedImages] };
    });
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryMessage("");
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeThumbnailImage = () => {
    setThumbnailFile(null);
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const toggleStatus = () => {
    setForm((prev) => ({
      ...prev,
      status: prev.status === "Active" ? "Deactive" : "Active",
    }));
  };

  const saveProperty = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setApiMessage("");
    setApiMessageType("");
    if (Object.keys(errors).length) return;

    const currentSellerId = getCurrentSellerId();
    if (!currentSellerId) {
      setApiMessage("Please login again. Seller user id is missing.");
      setApiMessageType("error");
      return;
    }

    if (!isEdit) {
      try {
        const response = await fetchSellerProperties(currentSellerId);
        const propertyCount = Array.isArray(response?.data)
          ? response.data.length
          : Array.isArray(response)
            ? response.length
            : Number(response?.meta?.total || response?.total || 0);
        const postLimit = getSellerPostLimit();
        if (propertyCount >= postLimit) {
          const currentPackage = readSellerPackage();
          setApiMessage(
            currentPackage.id === "free"
              ? "Your 2 free property posts are used. Buy a package to post more properties."
              : `Your ${postLimit}-property package limit is used. Please buy another package.`,
          );
          setApiMessageType("error");
          return;
        }
      } catch {
        // The property API will still validate the request during save.
      }
    }

    const primaryImage = form.image;
    const property = {
      id: isEdit ? existing.id : "",
      seller_id: existing?.seller_id || currentSellerId,
      user_id: existing?.seller_id || currentSellerId,
      property_user_id: existing?.seller_id || currentSellerId,
      title: form.title.trim(),
      location: form.location.trim(),
      city: form.city.trim() || form.location.split(",").pop()?.trim() || "",
      area: form.area.trim(),
      price: form.price.trim(),
      priceValue: priceValueFromLabel(form.price),
      property_type_id: form.propertyTypeId || form.type,
      property_type_name: form.type,
      type: form.type,
      purpose: form.purpose,
      status: form.status,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      image: primaryImage,
      gallery: form.gallery.length
        ? form.gallery.slice(0, MAX_GALLERY_IMAGES)
        : [primaryImage],
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      specifications: {
        areaSize: form.areaSize.trim() || "-",
        bedrooms: form.bedrooms.trim() || "N/A",
        bathrooms: form.bathrooms.trim() || "N/A",
        parking: form.parking.trim() || "N/A",
      },
      seller: existing?.seller || {
        name: "Demo Seller",
        mobile: "+91 90014 57000",
        email: "seller@infrioindia.com",
        company: "Seller Property Desk",
      },
      imageFile: thumbnailFile,
      galleryFiles,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await updateProperty(property);
      } else {
        await createProperty(property);
      }
    } catch (error) {
      setApiMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Property save failed. Please check required fields and try again.",
      );
      setApiMessageType("error");
      return;
    } finally {
      setSaving(false);
    }

    const successMessage = isEdit
      ? "Property updated successfully."
      : "Property added successfully.";
    setApiMessage(successMessage);
    setApiMessageType("success");
    setTimeout(() => {
      setApiMessage("");
      setApiMessageType("");
      navigate("/seller-services", {
        state: {
          type: "success",
          message: successMessage,
        },
      });
    }, 2500);
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">
                  {isEdit ? "Edit property" : "Add property"}
                </h2>
              </div>
              <NavLink to="/seller-services" className="seller-crm-btn-outline">
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden />
                Back
              </NavLink>
            </div>

            {isEdit && !existing ? (
              <div className="seller-table__empty">Property not found.</div>
            ) : (
              <form onSubmit={saveProperty} noValidate>
                <div className="seller-crm-form-grid seller-crm-form-grid--2">
                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <label>Property title *</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={setField("title")}
                    />
                    {submitted && errors.title ? (
                      <span className="seller-crm-field-error">
                        {errors.title}
                      </span>
                    ) : null}
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Property type</label>
                    <SearchableSelect
                      value={form.propertyTypeId || form.type}
                      options={propertyTypeOptions}
                      onChange={(value) => {
                        const selected = propertyTypes.find(
                          (item) => String(item.id || item.name) === String(value),
                        );
                        setForm((prev) => ({
                          ...prev,
                          propertyTypeId: value,
                          type: selected?.name || value,
                        }));
                      }}
                      placeholder="Search property type..."
                      isLoading={propertyTypesLoading}
                      noOptionsMessage="No property type found"
                    />
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Location *</label>
                    <input
                      className="form-control"
                      placeholder="Area, City"
                      value={form.location}
                      onChange={setField("location")}
                    />
                    {submitted && errors.location ? (
                      <span className="seller-crm-field-error">
                        {errors.location}
                      </span>
                    ) : null}
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Price *</label>
                    <input
                      className="form-control"
                      placeholder="Rs. 75 Lac"
                      value={form.price}
                      onChange={setField("price")}
                      onBlur={() =>
                        setForm((prev) => ({
                          ...prev,
                          price: String(priceValueFromLabel(prev.price) || ""),
                        }))
                      }
                    />
                    {submitted && errors.price ? (
                      <span className="seller-crm-field-error">
                        {errors.price}
                      </span>
                    ) : null}
                  </div>

                  {/* <div className="seller-crm-form-field">
                    <label>City</label>
                    <input
                      className="form-control"
                      value={form.city}
                      onChange={setField("city")}
                    />
                  </div> */}

                  {/* <div className="seller-crm-form-field">
                    <label>Area</label>
                    <input
                      className="form-control"
                      value={form.area}
                      onChange={setField("area")}
                    />
                  </div> */}

                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <h4 className="seller-property-form-section-title">
                      Add specifications
                    </h4>
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Area size</label>
                    <input
                      className="form-control"
                      placeholder="1450 sq.ft."
                      value={form.areaSize}
                      onChange={setField("areaSize")}
                    />
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Bedrooms</label>
                    <input
                      className="form-control"
                      value={form.bedrooms}
                      onChange={setField("bedrooms")}
                    />
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Bathrooms</label>
                    <input
                      className="form-control"
                      value={form.bathrooms}
                      onChange={setField("bathrooms")}
                    />
                  </div>

                  <div className="seller-crm-form-field">
                    <label>Parking</label>
                    <input
                      className="form-control"
                      value={form.parking}
                      onChange={setField("parking")}
                    />
                  </div>

                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <label>Short description *</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      maxLength={180}
                      placeholder="Short description"
                      value={form.shortDescription}
                      onChange={setField("shortDescription")}
                    />

                    {submitted && errors.shortDescription ? (
                      <span className="seller-crm-field-error">
                        {errors.shortDescription}
                      </span>
                    ) : null}
                  </div>

                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <label>Description *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.description}
                      onChange={setField("description")}
                    />
                    {submitted && errors.description ? (
                      <span className="seller-crm-field-error">
                        {errors.description}
                      </span>
                    ) : null}
                  </div>

                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <label>Amenities</label>
                    <input
                      className="form-control"
                      placeholder="Lift, Security, Parking"
                      value={form.amenities}
                      onChange={setField("amenities")}
                    />
                  </div>

                  {/* <div className="seller-crm-form-field">
                    <label>Status</label>
                    <button
                      type="button"
                      aria-label={`Property status ${form.status}`}
                      className={`seller-crm-status-switch ${
                        form.status === "Active"
                          ? "seller-crm-status-switch--active"
                          : ""
                      }`}
                      onClick={toggleStatus}
                    >
                      <span />
                    </button>
                  </div> */}

                  <div className="seller-crm-form-field seller-crm-form-field--full">
                    <div className="row">
                      <div className="col-lg-4 m-b15">
                        <div className="seller-crm-image-upload">
                          <span>Thumbnail image *</span>
                          <input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            required={!form.image}
                            onChange={handleThumbnailUpload}
                          />
                          {form.image ? (
                            <div className="seller-crm-thumbnail-preview">
                              <img src={form.image} alt="Property thumbnail" />
                              <button
                                type="button"
                                onClick={removeThumbnailImage}
                                aria-label="Remove thumbnail image"
                              >
                                x
                              </button>
                            </div>
                          ) : null}
                          {submitted && errors.image ? (
                            <div className="seller-crm-field-error">
                              {errors.image}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-lg-8 m-b15">
                        <div className="seller-crm-image-upload">
                          <span>Gallery images *</span>
                          <input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            multiple
                            required={!form.gallery.length}
                            disabled={form.gallery.length >= MAX_GALLERY_IMAGES}
                            onChange={handleGalleryUpload}
                          />
                          <small className="seller-crm-helper-text">
                            Add at least 1 and up to {MAX_GALLERY_IMAGES} gallery
                            images.
                          </small>
                          {galleryMessage ? (
                            <div className="seller-crm-field-error">
                              {galleryMessage}
                            </div>
                          ) : null}
                          {submitted && errors.gallery ? (
                            <div className="seller-crm-field-error">
                              {errors.gallery}
                            </div>
                          ) : null}
                          {form.gallery.length ? (
                            <div className="seller-crm-gallery-preview">
                              {form.gallery.map((image, index) => (
                                <div key={`${image}-${index}`}>
                                  <img
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    aria-label="Remove gallery image"
                                  >
                                    x
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="seller-crm-modal-actions">
                  {apiMessage ? (
                    <span
                      className={
                        apiMessageType === "success"
                          ? "alert alert-success m-b0"
                          : "alert alert-danger m-b0"
                      }
                      style={{ padding: "8px 14px" }}
                    >
                      {apiMessage}
                    </span>
                  ) : null}
                  <NavLink
                    to="/seller-services"
                    className="site-button-secondry"
                  >
                    Cancel
                  </NavLink>
                  
                  <button type="submit" className="site-button" disabled={saving}>
                    <span>
                      {saving
                        ? "Saving..."
                        : isEdit
                          ? "Save property"
                          : "Add property"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}

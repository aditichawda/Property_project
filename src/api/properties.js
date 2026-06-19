import axios from "axios";
import { SOLAR_ENDPOINTS } from "../config/api";
import { safeJsonParse } from "../utils/safeJsonParse";

function normalizeStatus(status) {
  if (status === 1 || status === "1" || status === true) return "Active";
  if (status === 0 || status === "0" || status === false) return "Deactive";
  return status || "Active";
}

function normalizeAmenities(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGallery(item) {
  const raw =
    item.gallery ||
    item.gallery_images ||
    item.galleryImages ||
    item.gallery_urls ||
    item.property_gallery ||
    item.property_images ||
    item.images ||
    item.image_gallery ||
    [];
  const list = Array.isArray(raw) ? raw : String(raw || "").split(",");
  return list
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : entry?.image || entry?.url || entry?.path || entry?.gallery_image || "",
    )
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
}

export function formatPropertyPrice(value) {
  const text = String(value || "").trim();
  const lower = text.toLowerCase();
  const numeric = Number(text.replace(/[^\d.]/g, ""));
  if (numeric && lower.includes("cr")) return `₹${numeric} Cr`;
  if (numeric && (lower.includes("lac") || lower.includes("lakh"))) {
    return `₹${numeric} Lac`;
  }
  if (numeric && lower.includes("million")) return `₹${numeric} Million`;
  if (!numeric) return String(value || "");
  if (numeric >= 10000000) {
    const cr = numeric / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (numeric >= 100000) {
    const lac = numeric / 100000;
    return `₹${Number.isInteger(lac) ? lac : lac.toFixed(2)} Lac`;
  }
  if (numeric < 100000) {
    return String(Number.isInteger(numeric) ? numeric : numeric.toFixed(2));
  }
  if (numeric >= 1000) {
    const k = numeric / 1000;
    return `₹${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `₹${numeric}`;
}

export function getCurrentSellerId() {
  if (typeof window === "undefined") return "";
  const sellerInfo = safeJsonParse(localStorage.getItem("sellerInfo"), null);
  const authInfo = safeJsonParse(localStorage.getItem("infrioAuth"), null);
  return (
    sellerInfo?.sellerId ||
    sellerInfo?.seller_id ||
    sellerInfo?.solar_user_id ||
    sellerInfo?.property_user_id ||
    sellerInfo?.user_id ||
    sellerInfo?.id ||
    sellerInfo?.data?.id ||
    sellerInfo?.user?.id ||
    authInfo?.userId ||
    authInfo?.seller_id ||
    authInfo?.sellerId ||
    authInfo?.solar_user_id ||
    authInfo?.property_user_id ||
    authInfo?.user_id ||
    authInfo?.id ||
    authInfo?.data?.id ||
    authInfo?.user?.id ||
    ""
  );
}

export function normalizeProperty(item = {}) {
  const gallery = normalizeGallery(item);
  const image =
    item.image ||
    item.thumbnail_url ||
    item.thumbnail ||
    item.image_url ||
    item.property_image ||
    gallery[0] ||
    "";
  const specifications = item.specifications || {};
  return {
    id: item.id,
    seller_id: item.seller_id,
    title: item.title || "",
    location: item.location || "",
    city: item.city || "",
    area: item.area || "",
    price: formatPropertyPrice(item.priceValue || item.price_value || item.price),
    priceValue: Number(item.priceValue || item.price_value || 0),
    property_type_id: item.property_type_id || item.type_id || "",
    property_type_name: item.property_type_name || item.type || "",
    type: item.property_type_name || item.type || "",
    purpose: item.purpose || "Sale",
    status: normalizeStatus(item.status),
    shortDescription: item.shortDescription || item.short_description || "",
    description: item.description || "",
    image,
    gallery,
    amenities: normalizeAmenities(item.amenities),
    specifications: {
      areaSize: specifications.areaSize || item.areaSize || item.area_size || "",
      bedrooms: specifications.bedrooms ?? item.bedrooms ?? "",
      bathrooms: specifications.bathrooms ?? item.bathrooms ?? "",
      parking: specifications.parking || item.parking || "",
    },
    seller: item.seller || {},
  };
}

export function normalizePropertyListResponse(response) {
  const data = response?.data ?? response;
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  return list.map(normalizeProperty);
}

export function normalizePropertyPaginationResponse(response, fallback = {}) {
  const data = response?.data ?? response ?? {};
  const root = data?.data ?? data;
  const meta = Array.isArray(root) ? data : root;
  return {
    items: normalizePropertyListResponse(response),
    pagination: {
      currentPage: Number(meta?.current_page || meta?.currentPage || fallback.page || 1),
      perPage: Number(meta?.per_page || meta?.perPage || fallback.perPage || 20),
      total: Number(meta?.total || 0),
      lastPage: Number(meta?.last_page || meta?.lastPage || 1),
    },
  };
}

export async function fetchProperties(params = {}) {
  const { data } = await axios.get(SOLAR_ENDPOINTS.PROPERTY_LIST, { params });
  return data;
}

export async function fetchSellerProperties(sellerId = getCurrentSellerId()) {
  return fetchProperties({ seller_id: sellerId, per_page: 100 });
}

export async function fetchPropertyDetail({ id, sellerId }) {
  const { data } = await axios.get(SOLAR_ENDPOINTS.PROPERTY_DETAIL, {
    params: {
      id,
      ...(sellerId ? { seller_id: sellerId } : {}),
    },
  });
  return normalizeProperty(data?.data || data);
}

export function buildPropertyFormData(property, options = {}) {
  const { includeId = true } = options;
  const fd = new FormData();
  const append = (key, value) => {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, value);
    }
  };
  const sellerId =
    property.seller_id ||
    property.sellerId ||
    property.user_id ||
    property.property_user_id ||
    getCurrentSellerId();

  if (includeId) append("id", property.id);
  append("seller_id", sellerId);
  append("user_id", sellerId);
  append("property_user_id", sellerId);
  append("property_type_id", property.property_type_id);
  append("title", property.title);
  append("location", property.location);
  append("city", property.city);
  append("area", property.area);
  append("price", property.price);
  append("priceValue", property.priceValue);
  append("status", property.status === "Active" ? "1" : "0");
  append("areaSize", property.specifications?.areaSize);
  append("bedrooms", property.specifications?.bedrooms);
  append("bathrooms", property.specifications?.bathrooms);
  append("parking", property.specifications?.parking);
  append("shortDescription", property.shortDescription);
  append("description", property.description);
  append(
    "amenities",
    Array.isArray(property.amenities)
      ? property.amenities.join(", ")
      : property.amenities,
  );
  append("image", property.imageFile);
  (property.galleryFiles || []).slice(0, 10).forEach((file) => {
    append("gallery[]", file);
  });
  return fd;
}

export async function createProperty(property) {
  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PROPERTY_STORE,
    buildPropertyFormData(property, { includeId: false }),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function updateProperty(property) {
  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PROPERTY_UPDATE,
    buildPropertyFormData(property),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function togglePropertyStatus({
  id,
  sellerId = getCurrentSellerId(),
}) {
  const { data } = await axios.post(SOLAR_ENDPOINTS.PROPERTY_STATUS_CHANGE, {
    id,
    seller_id: sellerId,
  });
  return data;
}

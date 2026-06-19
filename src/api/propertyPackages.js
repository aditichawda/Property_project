import axios from "axios";
import { SOLAR_ENDPOINTS } from "../config/api";

function descriptionFeatures(html) {
  const source = String(html || "").trim();
  if (!source) return [];
  if (typeof window !== "undefined" && window.DOMParser) {
    const doc = new window.DOMParser().parseFromString(source, "text/html");
    return Array.from(doc.querySelectorAll("span, li"))
      .map((node) => node.textContent.trim())
      .filter(Boolean);
  }
  return source
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapPropertyPackage(row, index = 0) {
  const propertyCount = Number(row?.no_of_properties || 0);
  const unlimited = Number(row?.is_unlimited) === 1;
  const days = Number(row?.no_of_days || 0);
  return {
    id: String(row?.id ?? index),
    name: row?.title || `Property Package ${index + 1}`,
    price: `₹${Number(row?.price || 0).toLocaleString("en-IN")}`,
    rawPrice: Number(row?.price || 0),
    duration: days ? `${days} days validity` : "Package validity",
    badge: index === 0 ? "Popular" : "Property Pack",
    postLimit: unlimited ? Number.MAX_SAFE_INTEGER : propertyCount,
    listings: unlimited
      ? "Unlimited property posts"
      : `${propertyCount} property posts`,
    enquiries: "Property seller dashboard included",
    features: descriptionFeatures(row?.description),
    bannerUrl:
      row?.banner_url ||
      row?.bannerUrl ||
      row?.banner ||
      row?.banner_image ||
      row?.image ||
      "",
    isUnlimited: unlimited,
    raw: row,
  };
}

export async function fetchPropertyPackages() {
  const { data } = await axios.get(SOLAR_ENDPOINTS.PACKAGES);
  if (!(data?.success || data?.status) || !Array.isArray(data?.data)) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Could not load property packages.",
    );
  }
  return [...data.data].reverse().map(mapPropertyPackage);
}

export async function purchasePropertyPackage({
  propertyUserId,
  packageId,
  paymentMethod = "cod",
  paymentId = "",
  paymentStatus = "",
  razorpayOrderId = "",
}) {
  const body = new FormData();
  body.append("property_user_id", String(propertyUserId || ""));
  body.append("package_id", String(packageId || ""));
  body.append("payment_method", paymentMethod);
  if (paymentId) body.append("payment_id", paymentId);
  if (paymentStatus) body.append("payment_status", paymentStatus);
  if (razorpayOrderId) body.append("razorpay_order_id", razorpayOrderId);

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PACKAGE_PURCHASE,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  if (data?.success === true || data?.status === true) return data;
  throw new Error(
    typeof data?.message === "string"
      ? data.message
      : "Package purchase could not be completed.",
  );
}

export async function createPropertyPackagePaymentOrder({
  propertyUserId,
  packageId,
  paymentMethod = "razorpay",
}) {
  const body = new FormData();
  body.append("property_user_id", String(propertyUserId || ""));
  body.append("package_id", String(packageId || ""));
  body.append("payment_method", paymentMethod);

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PACKAGE_PAYMENT_ORDER,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  if (data?.success === true || data?.status === true) return data;
  throw new Error(
    typeof data?.message === "string"
      ? data.message
      : "Payment order could not be created.",
  );
}

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

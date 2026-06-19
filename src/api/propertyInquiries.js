import axios from "axios";
import { SOLAR_ENDPOINTS } from "../config/api";
import { getCurrentSellerId } from "./properties";

function readList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.follow_ups)) return data.follow_ups;
  if (Array.isArray(data?.followups)) return data.followups;
  if (Array.isArray(data?.followUps)) return data.followUps;
  if (Array.isArray(data?.inquiries)) return data.inquiries;
  if (Array.isArray(data?.enquiries)) return data.enquiries;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data)) return data;
  return [];
}

function readPagination(payload, fallback = {}) {
  const data = payload?.data ?? payload ?? {};
  const meta = data?.pagination || data?.meta || data;
  return {
    currentPage: Number(meta?.current_page || meta?.currentPage || fallback.page || 1),
    perPage: Number(meta?.per_page || meta?.perPage || fallback.perPage || 20),
    total: Number(meta?.total || readList(payload).length || 0),
    lastPage: Number(meta?.last_page || meta?.lastPage || 1),
  };
}

function normalizeStatus(value) {
  const text = String(value || "").trim();
  if (!text) return "New";
  if (text === "0") return "New";
  if (text === "1") return "Contacted";
  if (text === "2") return "Follow-up";
  if (text === "3") return "Closed";
  if (text === "4") return "Closed";
  return text;
}

function okApiResponse(result) {
  return (
    result?.status === true ||
    result?.success === true ||
    String(result?.status || "").toLowerCase() === "true" ||
    String(result?.success || "").toLowerCase() === "true"
  );
}

function optionalParam(value) {
  return value === undefined || value === null || String(value).trim() === ""
    ? undefined
    : value;
}

export function normalizePropertyFollowUp(item = {}) {
  const inquiry = item.inquiry || item.enquiry || item.property_inquiry || {};
  const property = item.property || inquiry.property || {};
  const buyer = item.buyer || item.user || item.customer || inquiry.buyer || {};
  const methods =
    item.types ||
    item.follow_up_types ||
    item.followUpTypes ||
    item.followUpby ||
    item.followUpBy ||
    item.follow_up_by ||
    item.type ||
    [];
  return {
    id: item.id || item.follow_up_id || item.followup_id || item.created_at,
    types: Array.isArray(methods)
      ? methods
      : String(methods || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
    remark: item.remark || item.remarks || item.note || "",
    date:
      item.date ||
      item.next_follow_up_date ||
      item.follow_up_date ||
      item.created_at ||
      "",
    createdAt: item.created_at || item.createdAt || "",
    inquiryId:
      item.inquiry_id ||
      item.enquiry_id ||
      inquiry.id ||
      item.property_inquiry_id ||
      "",
    name:
      item.name ||
      item.buyer_name ||
      buyer.name ||
      inquiry.name ||
      inquiry.buyer_name ||
      "-",
    phone:
      item.phone ||
      item.mobile ||
      item.contact ||
      buyer.mobile ||
      buyer.phone ||
      inquiry.mobile ||
      "-",
    title:
      item.propertyName ||
      item.property_name ||
      item.property_title ||
      property.title ||
      inquiry.propertyName ||
      inquiry.property_name ||
      "-",
    raw: item,
  };
}

export function normalizePropertyInquiry(item = {}) {
  const property =
    item.property ||
    item.property_detail ||
    item.propertyDetails ||
    item.property_data ||
    {};
  const buyer = item.buyer || item.user || item.customer || {};
  const followUps =
    item.followUps ||
    item.followups ||
    item.follow_ups ||
    item.follow_up ||
    item.followup ||
    [];
  return {
    id: item.id || item.inquiry_id || item.enquiry_id || item.created_at,
    propertyId:
      item.property_id ||
      item.propertyId ||
      property.id ||
      item.property?.id ||
      "",
    propertyName:
      item.propertyName ||
      item.property_name ||
      item.property_title ||
      property.title ||
      property.name ||
      "-",
    propertyTitle:
      item.property_title ||
      item.propertyName ||
      item.property_name ||
      property.title ||
      property.name ||
      item.title ||
      "-",
    propertyPrice:
      item.property_price ||
      property.price ||
      item.price ||
      "",
    propertyPriceValue:
      item.property_price_value ||
      property.priceValue ||
      property.price_value ||
      item.priceValue ||
      "",
    propertyCity:
      item.property_city ||
      property.city ||
      "",
    propertyLocation:
      item.property_location ||
      item.location ||
      property.location ||
      "",
    propertyArea:
      item.property_area ||
      property.area ||
      "",
    propertyType:
      item.property_type ||
      item.property_type_name ||
      property.property_type_name ||
      property.type ||
      "",
    propertyImage:
      item.property_image ||
      property.image ||
      property.thumbnail ||
      "",
    name:
      item.name ||
      item.buyer_name ||
      item.full_name ||
      buyer.name ||
      buyer.full_name ||
      "-",
    mobile:
      item.mobile ||
      item.phone ||
      item.phone_number ||
      item.contact ||
      buyer.mobile ||
      buyer.phone ||
      "-",
    email: item.email || buyer.email || "-",
    city: item.city || buyer.city || "",
    message: item.message || item.remark || item.description || "-",
    status: item.status_label || normalizeStatus(item.status || item.inquiry_status),
    statusValue: item.status ?? item.inquiry_status ?? "",
    remarks: item.remarks || item.seller_remark || "",
    assignedStaff:
      item.assignedStaff ||
      item.assigned_staff ||
      item.staff_name ||
      item.staff?.name ||
      "",
    followUps: Array.isArray(followUps)
      ? followUps.map(normalizePropertyFollowUp)
      : [],
    createdAt: item.created_at || item.createdAt || item.date || "",
    raw: item,
  };
}

export function normalizePropertyInquiryResponse(payload, fallback = {}) {
  return {
    items: readList(payload).map(normalizePropertyInquiry),
    pagination: readPagination(payload, fallback),
  };
}

export async function fetchPropertyInquiries({
  sellerId = getCurrentSellerId(),
  propertyId,
  status,
  name,
  page = 1,
  perPage = 20,
} = {}) {
  const { data } = await axios.get(SOLAR_ENDPOINTS.PROPERTY_INQUIRY_LIST, {
    params: {
      seller_id: sellerId,
      property_id: optionalParam(propertyId),
      status: optionalParam(status),
      search: optionalParam(name),
      page,
      per_page: perPage,
    },
  });
  return normalizePropertyInquiryResponse(data, { page, perPage });
}

export async function fetchPropertyInquiryDetail({
  sellerId = getCurrentSellerId(),
  inquiryId,
} = {}) {
  const { data } = await axios.get(SOLAR_ENDPOINTS.PROPERTY_INQUIRY_DETAIL, {
    params: {
      seller_id: sellerId,
      id: inquiryId,
      inquiry_id: inquiryId,
    },
  });
  const root = data?.data ?? data;
  return normalizePropertyInquiry(root);
}

export async function changePropertyInquiryStatus({
  sellerId = getCurrentSellerId(),
  inquiryId,
  status,
} = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  body.append("id", String(inquiryId || ""));
  body.append("inquiry_id", String(inquiryId || ""));
  body.append("status", String(status || ""));

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PROPERTY_INQUIRY_STATUS_CHANGE,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (okApiResponse(data) || data?.data || data?.message) return data;
  throw new Error(data?.message || "Unable to change enquiry status.");
}

export async function storePropertyInquiryFollowUp({
  sellerId = getCurrentSellerId(),
  inquiryId,
  types,
  remark,
  date,
} = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  body.append("id", String(inquiryId || ""));
  body.append("inquiry_id", String(inquiryId || ""));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append("types[]", String(type || ""));
  });
  body.append("remark", String(remark || "").trim());
  body.append("date", String(date || ""));
  body.append("next_follow_up_date", String(date || ""));

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PROPERTY_INQUIRY_FOLLOW_UP_STORE,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (okApiResponse(data) || data?.data || data?.message) return data;
  throw new Error(data?.message || "Unable to save follow-up.");
}

export async function updatePropertyInquiryFollowUp({
  sellerId = getCurrentSellerId(),
  followUpId,
  types,
  remark,
  date,
} = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  body.append("follow_up_id", String(followUpId || ""));
  body.append("id", String(followUpId || ""));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append("types[]", String(type || ""));
  });
  body.append("remark", String(remark || "").trim());
  body.append("date", String(date || ""));
  body.append("next_follow_up_date", String(date || ""));

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.PROPERTY_INQUIRY_FOLLOW_UP_UPDATE,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (okApiResponse(data) || data?.data || data?.message) return data;
  throw new Error(data?.message || "Unable to update follow-up.");
}

export async function fetchPropertyInquiryFollowUpReport({
  sellerId = getCurrentSellerId(),
  from,
  to,
  inquiryId,
} = {}) {
  const { data } = await axios.get(
    SOLAR_ENDPOINTS.PROPERTY_INQUIRY_FOLLOW_UP_REPORT,
    {
      params: {
        seller_id: sellerId,
        inquiry_id: inquiryId || undefined,
        from: from || undefined,
        to: to || undefined,
      },
    },
  );
  return readList(data).map(normalizePropertyFollowUp);
}

export async function fetchUserPropertyInquiries({
  userId = "",
  page = 1,
  perPage = 50,
} = {}) {
  const body = new FormData();
  if (userId) {
    body.append("user_id", String(userId));
    body.append("userId", String(userId));
  }
  body.append("page", String(page));
  body.append("per_page", String(perPage));

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.USER_PROPERTY_INQUIRIES,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return {
    items: readList(data).map(normalizePropertyInquiry),
    pagination: readPagination(data, { page, perPage }),
    raw: data,
  };
}

export async function fetchUserPropertyInquiryDetail({ userId = "", inquiryId = "" } = {}) {
  const body = new FormData();
  if (userId) {
    body.append("user_id", String(userId));
    body.append("userId", String(userId));
  }
  if (inquiryId) {
    body.append("id", String(inquiryId));
    body.append("inquiry_id", String(inquiryId));
  }

  const { data } = await axios.post(
    SOLAR_ENDPOINTS.USER_PROPERTY_INQUIRY_DETAIL,
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return normalizePropertyInquiry(data?.data || data);
}

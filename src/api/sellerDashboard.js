import axios from "axios";
import { SOLAR_ENDPOINTS } from "../config/api";
import { normalizeProperty } from "./properties";
import { normalizePropertyInquiry } from "./propertyInquiries";

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.list)) return value.list;
  }
  return [];
}

function readPayload(payload) {
  const data = payload?.data ?? payload ?? {};
  return data?.data ?? data;
}

function normalizeFollowup(item = {}, index = 0) {
  const enquiry = item.enquiry || item.inquiry || item.property_inquiry || {};
  const property = item.property || enquiry.property || {};
  const buyer = item.buyer || item.customer || item.user || enquiry.buyer || {};
  const date =
    item.date ||
    item.follow_up_date ||
    item.next_follow_up_date ||
    item.nextFollowUpDate ||
    item.created_at ||
    "";

  const methods =
    item.methods ||
    item.types ||
    item.followUpby ||
    item.follow_up_by ||
    item.type ||
    [];

  return {
    id:
      item.id ||
      item.follow_up_id ||
      `${enquiry.id || item.enquiry_id || "followup"}-${date || index}`,
    name:
      item.name ||
      item.buyer_name ||
      buyer.name ||
      enquiry.name ||
      enquiry.buyer_name ||
      "-",
    phone:
      item.phone ||
      item.mobile ||
      item.contact ||
      buyer.mobile ||
      buyer.phone ||
      enquiry.mobile ||
      "-",
    title:
      item.propertyName ||
      item.property_name ||
      item.property_title ||
      property.title ||
      enquiry.propertyName ||
      enquiry.property_name ||
      "-",
    date,
    methods: Array.isArray(methods)
      ? methods
      : String(methods || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
    remark: item.remark || item.remarks || item.note || item.description || "-",
    to: `/seller-enquiries/${item.enquiry_id || item.inquiry_id || enquiry.id || item.id}`,
  };
}

function normalizeDashboardResponse(payload) {
  const root = readPayload(payload);
  const stats = root.stats || root.counts || root.summary || {};
  const recentProperties = firstArray(
    root.recentProperties,
    root.recent_properties,
    root.recentProperty,
    root.recent_property,
    root.latestProperties,
    root.latest_properties,
    root.propertyList,
    root.property_list,
    root.properties,
    root.property,
  ).map(normalizeProperty);
  const recentEnquiries = firstArray(
    root.recentEnquiries,
    root.recent_enquiries,
    root.recentInquiries,
    root.recent_inquiries,
    root.enquiries,
    root.inquiries,
  ).map(normalizePropertyInquiry);
  const todayFollowups = firstArray(
    root.todayFollowups,
    root.today_followups,
    root.followups,
    root.follow_ups,
    root.followUps,
  ).map(normalizeFollowup);

  return {
    stats: {
      totalProperties:
        stats.totalProperties ||
        stats.total_properties ||
        root.totalProperties ||
        root.total_properties ||
        recentProperties.length,
      activeProperties:
        stats.activeProperties ||
        stats.active_properties ||
        root.activeProperties ||
        root.active_properties ||
        recentProperties.filter((item) => item.status === "Active").length,
      totalEnquiries:
        stats.totalEnquiries ||
        stats.total_enquiries ||
        stats.totalInquiries ||
        stats.total_inquiries ||
        root.totalEnquiries ||
        root.total_enquiries ||
        root.totalInquiries ||
        root.total_inquiries ||
        recentEnquiries.length,
      newEnquiries:
        stats.newEnquiries ||
        stats.new_enquiries ||
        stats.newInquiries ||
        stats.new_inquiries ||
        root.newEnquiries ||
        root.new_enquiries ||
        root.newInquiries ||
        root.new_inquiries ||
        recentEnquiries.filter((item) => item.status === "New").length,
    },
    recentProperties,
    recentEnquiries,
    todayFollowups,
  };
}

export async function fetchSellerDashboard({
  sellerId,
  from,
  to,
} = {}) {
  const { data } = await axios.get(SOLAR_ENDPOINTS.SELLER_DASHBOARD, {
    params: {
      seller_id: sellerId,
      from,
      to,
    },
  });
  return normalizeDashboardResponse(data);
}

export async function fetchSellerDetail(sellerId) {
  const body = new FormData();
  body.append("property_user_id", String(sellerId));
  const { data } = await axios.post(SOLAR_ENDPOINTS.DETAIL, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return readPayload(data);
}

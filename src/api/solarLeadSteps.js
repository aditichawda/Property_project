import { SOLAR_ENDPOINTS } from "../config/api";

function parseStatusResponse(response, result, fallbackMessage) {
  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || "").toLowerCase() === "true" ||
    String(result?.success || "").toLowerCase() === "true";
  if (response.ok && okStatus) return result;
  throw new Error(result?.message || result?.error || fallbackMessage);
}

function normalizeLeadStep(row) {
  return {
    id: row?.id,
    sellerId: row?.seller_id ?? row?.sellerId ?? "",
    name: row?.name || "",
    status: Number(row?.status ?? 1),
  };
}

export async function fetchSolarLeadSteps({ sellerId, search, status } = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  if (String(search || "").trim()) {
    body.append("search", String(search).trim());
  }
  if (status !== "" && status != null) {
    body.append("status", String(status));
  }
  const response = await fetch(SOLAR_ENDPOINTS.MASTER_STATUS_GET, {
    method: "POST",
    body,
  });
  const result = await response.json();
  parseStatusResponse(response, result, "Unable to load lead steps.");
  const list = Array.isArray(result?.data) ? result.data : [];
  return list.map(normalizeLeadStep);
}

export async function storeSolarLeadStep({ sellerId, name } = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  body.append("name", String(name || "").trim());
  const response = await fetch(SOLAR_ENDPOINTS.MASTER_STATUS_STORE, {
    method: "POST",
    body,
  });
  const result = await response.json();
  return parseStatusResponse(response, result, "Unable to save lead step.");
}

export async function updateSolarLeadStep({ sellerId, id, name } = {}) {
  const body = new FormData();
  body.append("id", String(id || ""));
  body.append("seller_id", String(sellerId || ""));
  body.append("name", String(name || "").trim());
  const response = await fetch(SOLAR_ENDPOINTS.MASTER_STATUS_UPDATE, {
    method: "POST",
    body,
  });
  const result = await response.json();
  return parseStatusResponse(response, result, "Unable to update lead step.");
}

export async function changeSolarLeadStepStatus({ sellerId, id } = {}) {
  const body = new FormData();
  body.append("seller_id", String(sellerId || ""));
  body.append("id", String(id || ""));
  const response = await fetch(SOLAR_ENDPOINTS.MASTER_STATUS_CHANGE, {
    method: "POST",
    body,
  });
  const result = await response.json();
  return parseStatusResponse(response, result, "Unable to change lead step status.");
}

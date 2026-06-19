import { API_BASE_V2 } from "../config/api";
import { PROPERTY_TYPES } from "../data/propertyDummyData";

export const PROPERTY_TYPES_ENDPOINT = `${API_BASE_V2}/property/property-types`;

export function fallbackPropertyTypeOptions() {
  return PROPERTY_TYPES.map((name) => ({ id: name, name }));
}

export async function fetchPropertyTypes() {
  const response = await fetch(PROPERTY_TYPES_ENDPOINT, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const result = await response.json();
  const data = Array.isArray(result?.data) ? result.data : [];
  return data
    .map((item) => ({
      id: item.id ?? item.name,
      name: String(item.name || "").trim(),
    }))
    .filter((item) => item.name);
}

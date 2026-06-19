import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';
import { SELLER_CITY_ROWS, SELLER_STATE_ROWS } from '../data/sellerStatesCities';

/**
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function fetchSolarStates() {
  try {
    // TODO: Enable this as primary source when state master API is stable.
    const { data } = await axios.get(SOLAR_ENDPOINTS.STATES);
    if (data?.success && Array.isArray(data.data)) {
      return data.data.filter((row) => row && (row.id != null) && row.name);
    }
  } catch {
    // API is currently unreliable, so forms use local demo master data.
  }
  return SELLER_STATE_ROWS;
}

/**
 * @param {string|number} stateId
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function fetchSolarCities(stateId) {
  if (stateId === '' || stateId == null) return [];
  try {
    // TODO: Enable this as primary source when city master API is stable.
    const { data } = await axios.get(SOLAR_ENDPOINTS.CITIES(stateId));
    if (data?.success && Array.isArray(data.data)) {
      return data.data.filter((row) => row && (row.id != null) && row.name);
    }
  } catch {
    // API is currently unreliable, so forms use local demo master data.
  }
  return SELLER_CITY_ROWS[String(stateId)] || [];
}

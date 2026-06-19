import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';

export async function fetchSolarServiceFormOptions() {
  const { data } = await axios.get(SOLAR_ENDPOINTS.FORM_OPTIONS);
  return data;
}


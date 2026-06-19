import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';

export async function createSolarSellerService(formData) {
  const { data } = await axios.post(SOLAR_ENDPOINTS.SERVICES_STORE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateSolarSellerService(formData) {
  const { data } = await axios.post(SOLAR_ENDPOINTS.SERVICES_UPDATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchSolarSellerServicesForUser(solarUserId) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  const { data } = await axios.post(SOLAR_ENDPOINTS.SERVICES_GET_ALL_USER, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteSolarSellerService({ solarUserId, id }) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  fd.append('id', String(id));
  const { data } = await axios.post(SOLAR_ENDPOINTS.SERVICES_DELETE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchSolarSellerServiceView({ solarUserId, id }) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  fd.append('id', String(id));
  const { data } = await axios.post(SOLAR_ENDPOINTS.SERVICES_VIEW, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

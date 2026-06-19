import { SOLAR_ENDPOINTS } from '../config/api';
import { safeJsonParse } from '../utils/safeJsonParse';

function firstFilled(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && String(value).trim(),
  );
}

export function getCurrentInquiryUserId() {
  if (typeof window === 'undefined') return '';

  const auth = safeJsonParse(localStorage.getItem('infrioAuth'), null);
  const seller = safeJsonParse(localStorage.getItem('sellerInfo'), null);
  const user = safeJsonParse(localStorage.getItem('userInfo'), null);
  const partner = safeJsonParse(localStorage.getItem('partnerInfo'), null);

  return String(
    firstFilled(
      auth?.userId,
      auth?.user_id,
      auth?.id,
      seller?.sellerId,
      seller?.seller_id,
      seller?.solar_user_id,
      seller?.user_id,
      seller?.id,
      user?.userId,
      user?.user_id,
      user?.id,
      partner?.userId,
      partner?.user_id,
      partner?.id,
    ) || '',
  );
}

function firstErrorFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return '';

  const errors = payload.errors || payload.data?.errors;
  if (errors && typeof errors === 'object') {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  if (payload.message && typeof payload.message === 'object') {
    for (const value of Object.values(payload.message)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  return '';
}

function firstErrorFromText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return '';
  if (/405|method not allowed/i.test(text)) return 'Enquiry form is not available right now. Please try again shortly.';
  if (/404|not found/i.test(text)) return 'Enquiry service is unavailable right now. Please try again later.';
  if (/500|server error|internal server error/i.test(text)) return 'Server error occurred while submitting the enquiry. Please try again later.';
  return '';
}
export function buildInfrInquiryFormData(formData) {
  const fd = new FormData();
  // const services = Array.isArray(formData?.service) ? formData.service : [];

  fd.append('name', String(formData?.name || '').trim());
  fd.append('email', String(formData?.email || '').trim());
  fd.append('phone', String(formData?.phone || '').trim());
  fd.append('city', String(formData?.city || '').trim());
  fd.append('message', String(formData?.message || '').trim());
  const services = Array.isArray(formData?.service)
    ? formData.service.filter(Boolean)
    : [formData?.service].filter(Boolean);
  const serviceText = services.length ? services.join(', ') : 'All';
  fd.append('service', serviceText);
  fd.append('services', serviceText);
  
  // services.filter(Boolean).forEach((service) => {
  //   fd.append('services[]', String(service).trim());
  // });

  return fd;
}
export function buildSolarInquiryFormData(formData, userId) {
  const fd = new FormData();
  const currentUserId = firstFilled(userId, formData?.userId, getCurrentInquiryUserId());
  fd.append('name', String(formData?.name || '').trim());
  fd.append('email', String(formData?.email || '').trim());
  fd.append('mobile', String(formData?.phone || '').trim());
  fd.append('message', String(formData?.message || '').trim());
  fd.append('city', String(formData?.city || '').trim());

  // const stateId = formData?.stateId ?? formData?.state_id;
  // const cityId = formData?.cityId ?? formData?.city_id;
  // const stateName = formData?.state ?? formData?.stateName;

  // if (stateId !== undefined && stateId !== null && String(stateId).trim()) {
  //   fd.append('state_id', String(stateId).trim());
  // }

  // if (cityId !== undefined && cityId !== null && String(cityId).trim()) {
  //   fd.append('city_id', String(cityId).trim());
  // }

  // if (stateName !== undefined && stateName !== null && String(stateName).trim()) {
  //   fd.append('state', String(stateName).trim());
  // } 

  if (currentUserId) {
    fd.append('user_id', String(currentUserId));
  }
  const sellerId = formData?.sellerId ?? formData?.seller_id;
  if (sellerId) {
    fd.append('sellerId', String(sellerId));
    fd.append('seller_id', String(sellerId));
  }
  const propertyId = formData?.propertyId ?? formData?.serviceId;
  if (propertyId) {
    fd.append('propertyId', String(propertyId));
    fd.append('property_id', String(propertyId));
  }
  if (formData?.propertyName) fd.append('property_name', String(formData.propertyName));
  if (formData?.propertyType) fd.append('property_type', String(formData.propertyType));
  if (formData?.propertyLocation) fd.append('property_location', String(formData.propertyLocation));
 

  return fd;
}
export async function submitInfrInquiry(formData) {
  const response = await fetch(SOLAR_ENDPOINTS.CONTACT_US, {
    method: 'POST',
    body: buildInfrInquiryFormData(formData,),
  });

  const rawText = await response.text();
  let payload = null;
console.log('Raw response text:', rawText);
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  const message = firstErrorFromPayload(payload);
  const textMessage = firstErrorFromText(rawText);
  const isSuccess =
    response.ok &&
    (payload?.status === true ||
      payload?.success === true ||
      payload?.status === 'success' ||
      payload?.success === 'success' ||
      payload?.message);

  if (isSuccess) {
    return payload;
  }

  if (message) {
    throw new Error(message);
  }

  if (textMessage) {
    throw new Error(textMessage);
  }

  throw new Error('Unable to submit enquiry right now. Please check your details and try again.');
}

export async function submitSolarInquiry(formData, userId) {
  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_STORE, {
    method: 'POST',
    body: buildSolarInquiryFormData(formData, userId),
  });

  const rawText = await response.text();
  let payload = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  const message = firstErrorFromPayload(payload);
  const textMessage = firstErrorFromText(rawText);
  const isSuccess = response.ok && (payload?.status === true || payload?.success === true);

  if (isSuccess) {
    return payload;
  }

  if (message) {
    throw new Error(message);
  }

  if (textMessage) {
    throw new Error(textMessage);
  }

  throw new Error('Unable to submit enquiry right now. Please check your details and try again.');
}

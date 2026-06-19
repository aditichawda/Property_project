import { SOLAR_ENDPOINTS } from '../config/api';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

function parseMaybeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const text = value.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeEnquiryServices(input) {
  const rawList =
    Array.isArray(input) || typeof input === 'string'
      ? Array.isArray(input)
        ? input
        : [input]
      : [];
  const expanded = rawList.flatMap((item) => {
    if (item && typeof item === 'object') {
      const label =
        item.name ??
        item.title ??
        item.type ??
        item.followup_type ??
        item.follow_up_type ??
        item.label ??
        '';
      return label ? [String(label)] : [];
    }
    if (typeof item !== 'string') return [];
    const nested = parseMaybeJsonArray(item);
    return nested.length ? nested : [item];
  });

  return expanded
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function normalizeLeadStatus(row) {
  const raw =
    row?.lead_status ??
    row?.convert_status ??
    row?.converted_status ??
    row?.is_converted ??
    row?.status;
  const value = String(raw ?? '').trim().toLowerCase();

  if (value === '1' || value === 'converted') {
    return { id: '1', label: 'Converted' };
  }

  if (
    value === '2' ||
    value === 'under discussion' ||
    value === 'under_discussion' ||
    value === 'under-discussion'
  ) {
    return { id: '2', label: 'Under Discussion' };
  }

  if (value === 'interested') {
    return { id: '3', label: 'Interested' };
  }

  return { id: '0', label: 'Pending' };
}

function normalizeInterestStatus(row) {
  const raw =
    row?.interest_status ??
    row?.interestStatus ??
    row?.lead_state ??
    row?.leadState;
  const rawLabel =
    row?.interest_status_label ??
    row?.interestStatusLabel ??
    row?.lead_state_label ??
    row?.leadStateLabel;
  const value = String(raw ?? '').trim().toLowerCase();

  if (
    value === '2' ||
    value === 'not interested' ||
    value === 'not_interested' ||
    value === 'not-interested'
  ) {
    return {
      id: '2',
      label: rawLabel ? String(rawLabel) : 'Not Interested',
    };
  }

  return {
    id: '1',
    label: rawLabel ? String(rawLabel) : 'Interested',
  };
}

function normalizeFollowUps(input) {
  const list = Array.isArray(input) ? input : [];
  return list.map((item) => {
    const methods =
      item?.followup_types ??
      item?.follow_up_types ??
      item?.followUpby ??
      item?.followupMethods ??
      [];
    return {
      id: item?.id,
      nextFollowUpDate: item?.next_follow_up_date ,
      date:item?.created_at,
      remark: item?.remark ?? item?.note ?? item?.message ?? '',
      followUpby: normalizeEnquiryServices(methods),
      createdAt: item?.created_at || '',
    };
  });
}

function formatFollowupDateForApi(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const parts = text.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return text;
}

export function mapApiFollowUp(row, type = 'crm') {
  const methods =
    row?.types ??
    row?.followup_types ??
    row?.follow_up_types ??
    row?.follow_up_by ??
    row?.followUp ??
    row?.followUpby ??
    [];
  const convertedId =
    row?.converted_id ??
    row?.convertedId ??
    row?.customer_id ??
    row?.inquiry_id ??
    row?.inquery_id ??
    row?.enquiry_id ??
    row?.id;
  return {
    id: convertedId,
    followUpId: row?.follow_up_id ?? row?.id,
    type,
    sourceType: row?.type ?? type,
    name:
      row?.name ??
      row?.customer_name ??
      row?.buyer_name ??
      row?.inquiry_name ??
      'Customer',
    phone: row?.phone ?? row?.customer_phone ?? row?.buyer_phone ?? '',
    followUp: normalizeEnquiryServices(methods),
    remark: row?.remark ?? row?.message ?? row?.note ?? '',
    date: row?.next_follow_up_date ?? row?.follow_up_date ?? row?.created_at ?? '',
    raw: row,
  };
}

export function mapApiEnquiry(row) {
  const services = normalizeEnquiryServices(
    row?.services ??
      row?.service ??
      row?.service_name ??
      row?.service_title ??
      row?.serviceName,
  );
  const leadStatus = normalizeLeadStatus(row);
  const interestStatus = normalizeInterestStatus(row);
  const followUps = normalizeFollowUps(row?.follow_ups ?? row?.followUps);
  const address =
    row?.address ??
    row?.customer_address ??
    row?.buyer_address ??
    row?.user_address ??
    row?.full_address ??
    row?.location ??
    '';
  const installationAddress =
    row?.installation_address ??
    row?.installationAddress ??
    row?.install_address ??
    row?.site_address ??
    row?.project_address ??
    row?.plant_address ??
    '';
  return {
    id: row?.id,
    buyerName: row?.name || '',
    buyerPhone: row?.phone || '',
    buyerEmail: row?.email || '',
    city: row?.city || row?.city_name || '',
    cityId: row?.city_id ?? row?.cityId ?? '',
    stateId: row?.state_id ?? row?.stateId ?? '',
    cityname: row?.city_name || row?.city || '',
    state: row?.state_name || row?.state || '',
    requirement: services.join(', '),
    services,
    message: row?.message || '',
    userId: row?.user_id ? String(row.user_id) : '',
    userName: row?.user_name || '',
    userPhone: row?.user_phone || '',
    address,
    installationAddress,
    dealAmount: row?.deal_amount ?? row?.dealAmount ?? '',
    systemSize: row?.system_size ?? row?.systemSize ?? '',
    serviceId:
      row?.service_id ?? row?.services_id ?? row?.servicesId ?? row?.serviceId ?? '',
    assignedStaffId: row?.assign_staff_id ?? row?.assigned_staff_id ?? '',
    assignedTo:
      row?.assign_staff_name ??
      row?.assigned_staff_name ??
      row?.staff_name ??
      '',
    assignedStaffPhone:
      row?.assign_staff_phone ?? row?.assigned_staff_phone ?? '',
    service_title: row?.service_title || '',
    createdAt: row?.created_at || '',
    crmStatus:
      row?.crm_status ??
      row?.lead_status_name ??
      row?.stage_status ??
      row?.status_name ??
      '',
    createdBy:
      row?.created_staff_name ||
      row?.created_by_staff_name ||
      row?.created_by_name ||
      row?.created_by ||
      '',
    convertStatusId: leadStatus.id,
    convertStatus: leadStatus.label,
    interestStatusId: interestStatus.id,
    interestStatusLabel: interestStatus.label,
    leadState: interestStatus.id === '2' ? 'Not Interested' : 'Interested',
    followUps,
    followupMethods: followUps[0]?.followUpby || [],
    followupNote: followUps[0]?.remark || '',
    nextFollowupDate: followUps[0]?.date || '',
    raw: row,
  };
}

export function mapApiEnquiryToCrmCustomer(row) {
  const enquiry = row?.buyerName ? row : mapApiEnquiry(row);
  const rawStatus =
    row?.crmStatus ??
    row?.crm_status ??
    row?.lead_status_name ??
    row?.stage_status ??
    row?.status_name ??
    row?.status;
  const statusText = String(rawStatus ?? '').trim();
  const status =
    statusText && !['0', '1'].includes(statusText)
      ? statusText
      : enquiry.convertStatus || 'Pending';
  const rawInterestStatus =
    row?.interest_status ??
    row?.interestStatus ??
    row?.interestStatusId ??
    row?.leadState ??
    row?.lead_state ??
    enquiry.interestStatusId ??
    enquiry.leadState;
  const interestStatusLabel =
    row?.interest_status_label ??
    row?.interestStatusLabel ??
    enquiry.interestStatusLabel ??
    '';
  const interestStatusText = String(rawInterestStatus ?? '').trim().toLowerCase();
  const leadState =
    interestStatusText === '2' ||
    interestStatusText === 'not interested' ||
    interestStatusText === 'not_interested' ||
    interestStatusText === 'not-interested'
      ? 'Not Interested'
      : 'Interested';

  return {
    id: enquiry.id,
    sourceEnquiryId: row?.source_enquiry_id ?? row?.enquiry_id ?? enquiry.id,
    enquiryId: row?.enquiry_id ?? enquiry.id,
    convertedId: row?.converted_id ?? row?.convertedId ?? enquiry.id,
    name: enquiry.buyerName || 'Customer',
    phone: enquiry.buyerPhone || '',
    email: enquiry.buyerEmail || '',
    city: enquiry.cityname || enquiry.city || '',
    cityId: enquiry.cityId || '',
    stateId: enquiry.stateId || '',
    state: enquiry.state || row?.state || '',
    address: enquiry.address || '',
    installationAddress: enquiry.installationAddress || '',
    serviceId: enquiry.serviceId || '',
    services:
      enquiry.services?.length || !enquiry.service_title
        ? enquiry.services || []
        : [enquiry.service_title],
    serviceName:
      enquiry.service_title ||
      row?.service_name ||
      row?.serviceName ||
      row?.service ||
      '',
    message: enquiry.message || '',
    systemSize: enquiry.systemSize || enquiry.requirement || '-',
    assignedStaff: enquiry.assignedTo || '',
    assignedStaffId: enquiry.assignedStaffId || '',
    assignedStaffPhone: enquiry.assignedStaffPhone || '',
    createdByStaffId:
      row?.created_by_staff_id ??
      row?.created_staff_id ??
      row?.createdByStaffId ??
      '',
    createdBy:
      row?.created_staff_name ||
      row?.created_by_staff_name ||
      row?.createdBy ||
      row?.created_by_name ||
      row?.created_by ||
      'Enquiry',
    interestStatusId: leadState === 'Not Interested' ? '2' : '1',
    interestStatusLabel: interestStatusLabel || leadState,
    leadState,
    status,
    dealAmount: enquiry.dealAmount || '',
    createdAt: enquiry.createdAt || '',
    followUps: enquiry.followUps || [],
    followupMethods: enquiry.followUps?.[0]?.followUpby || [],
    followupNote: enquiry.followUps?.[0]?.remark || '',
    nextFollowupDate: enquiry.followUps?.[0]?.date || '',
    raw: row?.raw || enquiry.raw || row,
  };
}

function normalizeEnquiryMeta(result, page, perPage, totalFallback) {
  const root =
    result?.meta && typeof result.meta === 'object'
      ? result.meta
      : result?.pagination && typeof result.pagination === 'object'
        ? result.pagination
        : result;
  const total = Number(root?.total ?? totalFallback ?? 0);
  const currentPage = Number(root?.current_page ?? root?.currentPage ?? root?.page ?? page);
  const pageSize = Number(root?.per_page ?? root?.perPage ?? root?.limit ?? perPage);
  const lastPage = Number(
    root?.last_page ??
      root?.lastPage ??
      root?.total_pages ??
      root?.totalPages ??
      (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1),
  );

  return {
    total,
    current_page: currentPage,
    last_page: lastPage,
    per_page: pageSize,
  };
}

export async function fetchSolarEnquiries(options = {}) {
  const page = Number(options.page || DEFAULT_PAGE);
  const perPage = Number(options.perPage || DEFAULT_PER_PAGE);
  const body = new FormData();
  body.append('page', String(page));
  body.append('per_page', String(perPage));
  if (options.sellerId) body.append('seller_id', String(options.sellerId));
  if (String(options.search || '').trim()) {
    body.append('search', String(options.search).trim());
  }
  if (options.assignStaffId) {
    body.append('assign_staff_id', String(options.assignStaffId));
  }
  if (options.status && options.status !== 'all') {
    body.append('status', String(options.status));
  }
  if (options.type) body.append('type', String(options.type));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_GET, {
    method: 'POST',
    body,
  });

  const result = await response.json();

  const list = Array.isArray(result?.data) ? result.data : [];

  const items = list.map(mapApiEnquiry);

  return {
    items,
    meta: normalizeEnquiryMeta(result, page, perPage, items.length),
  };
}

export async function fetchSolarConvertedEnquiries(options = {}) {
  const page = Number(options.page || DEFAULT_PAGE);
  const perPage = Number(options.perPage || DEFAULT_PER_PAGE);
  const body = new FormData();
  body.append('page', String(page));
  body.append('per_page', String(perPage));
  if (options.sellerId) body.append('seller_id', String(options.sellerId));
  if (String(options.search || '').trim()) {
    body.append('search', String(options.search).trim());
  }
  if (options.assignStaffId) {
    body.append('assign_staff_id', String(options.assignStaffId));
  }
  if (options.interestStatus) {
    body.append('interest_status', String(options.interestStatus));
  }

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_GET, {
    method: 'POST',
    body,
  });

  const result = await response.json();
  const list = Array.isArray(result?.data) ? result.data : [];
  const items = list.map(mapApiEnquiry);

  return {
    items,
    meta: normalizeEnquiryMeta(result, page, perPage, items.length),
  };
}

export async function fetchUserSolarEnquiries(options = {}) {
  const page = Number(options.page || DEFAULT_PAGE);
  const perPage = Number(options.perPage || DEFAULT_PER_PAGE);
  const body = new FormData();
  body.append('page', String(page));
  if (options.userId) body.append('user_id', String(options.userId));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_USER_GET, {
    method: 'POST',
    body,
  });

  const result = await response.json();
  const list = Array.isArray(result?.data) ? result.data : [];
  const items = list.map(mapApiEnquiry);

  return {
    items,
    meta: normalizeEnquiryMeta(result, page, perPage, items.length),
  };
}

export async function fetchUserSolarConvertedEnquiries(options = {}) {
  const page = Number(options.page || DEFAULT_PAGE);
  const perPage = Number(options.perPage || DEFAULT_PER_PAGE);
  const body = new FormData();
  body.append('page', String(page));
  if (options.userId) body.append('user_id', String(options.userId));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_USER_GET, {
    method: 'POST',
    body,
  });

  const result = await response.json();
  const list = Array.isArray(result?.data) ? result.data : [];
  const items = list.map(mapApiEnquiryToCrmCustomer);

  return {
    items,
    meta: normalizeEnquiryMeta(result, page, perPage, items.length),
  };
}

export async function fetchSolarConvertedEnquiryDetails({
  sellerId,
  convertedId,
} = {}) {
  const body = new FormData();
  if (sellerId) body.append('seller_id', String(sellerId));
  body.append('converted_id', String(convertedId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_DETAIL, {
    method: 'POST',
    body,
  });

  const result = await response.json();
  const row = Array.isArray(result?.data) ? result.data[0] : result?.data;

  if (response.ok && row) {
    return mapApiEnquiry(row);
  }

  throw new Error(result?.message || 'Unable to load converted enquiry details.');
}

function parseApiResponseOk(response, rawText, fallbackMessage) {
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || '').toLowerCase() === 'true' ||
    String(result?.success || '').toLowerCase() === 'true';

  if (response.ok && okStatus) return result;

  throw new Error(result?.message || result?.error || fallbackMessage);
}

export async function storeSolarConvertedEnquiryLead({
  sellerId,
  createdByStaffId,
  name,
  phone,
  email,
  cityId,
  stateId,
  address,
  message,
  services,
  dealAmount,
  systemSize,
  installationAddress,
  serviceId,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  if (createdByStaffId) {
    body.append('created_by_staff_id', String(createdByStaffId));
  }
  body.append('name', String(name || '').trim());
  body.append('phone', String(phone || '').trim());
  body.append('email', String(email || '').trim());
  body.append('city_id', String(cityId || ''));
  body.append('state_id', String(stateId || ''));
  body.append('address', String(address || '').trim());
  body.append('message', String(message || '').trim());
  (Array.isArray(services) ? services : [services])
    .filter(Boolean)
    .forEach((service) => body.append('services[]', String(service)));
  body.append('deal_amount', String(dealAmount || '').trim());
  body.append('system_size', String(systemSize || '').trim());
  body.append('installation_address', String(installationAddress || '').trim());
  body.append('service_id', String(serviceId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_STORE, {
    method: 'POST',
    body,
  });
  const rawText = await response.text();
  return parseApiResponseOk(
    response,
    rawText,
    'Unable to add CRM lead right now.',
  );
}

export async function updateSolarConvertedEnquiryLead({
  sellerId,
  convertedId,
  name,
  phone,
  email,
  cityId,
  stateId,
  address,
  message,
  services,
  dealAmount,
  systemSize,
  installationAddress,
  serviceId,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('converted_id', String(convertedId || ''));
  body.append('id', String(convertedId || ''));
  body.append('name', String(name || '').trim());
  body.append('phone', String(phone || '').trim());
  body.append('email', String(email || '').trim());
  body.append('city_id', String(cityId || ''));
  body.append('state_id', String(stateId || ''));
  body.append('address', String(address || '').trim());
  body.append('message', String(message || '').trim());
  (Array.isArray(services) ? services : [services])
    .filter(Boolean)
    .forEach((service) => body.append('services[]', String(service)));
  body.append('deal_amount', String(dealAmount || '').trim());
  body.append('system_size', String(systemSize || '').trim());
  body.append('installation_address', String(installationAddress || '').trim());
  body.append('service_id', String(serviceId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_UPDATE, {
    method: 'POST',
    body,
  });
  const rawText = await response.text();
  return parseApiResponseOk(
    response,
    rawText,
    'Unable to update CRM lead right now.',
  );
}

export async function storeSolarConvertedFollowUp({
  sellerId,
  convertedId,
  types,
  remark,
  nextFollowUpDate,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('converted_id', String(convertedId || ''));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append('types[]', String(type || ''));
  });
  body.append('remark', String(remark || '').trim());
  body.append('next_follow_up_date', String(nextFollowUpDate || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_FOLLOW_UP_STORE, {
    method: 'POST',
    body,
  });
  const rawText = await response.text();
  return parseApiResponseOk(
    response,
    rawText,
    'Unable to save CRM follow-up right now.',
  );
}

export async function updateSolarConvertedFollowUp({
  followUpId,
  types,
  remark,
  nextFollowUpDate,
} = {}) {
  const body = new FormData();
  body.append('follow_up_id', String(followUpId || ''));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append('types[]', String(type || ''));
  });
  body.append('remark', String(remark || '').trim());
  body.append('next_follow_up_date', String(nextFollowUpDate || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_FOLLOW_UP_UPDATE, {
    method: 'POST',
    body,
  });
  const rawText = await response.text();
  return parseApiResponseOk(
    response,
    rawText,
    'Unable to update CRM follow-up right now.',
  );
}

export async function fetchSolarFollowUps({
  sellerId,
  type = 'crm',
  from,
  to,
  assignStaffId,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('type', String(type || 'crm'));
  if (from) body.append('from', formatFollowupDateForApi(from));
  if (to) body.append('to', formatFollowupDateForApi(to));
  if (assignStaffId) body.append('assign_staff_id', String(assignStaffId));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_FOLLOW_UP_GET, {
    method: 'POST',
    body,
  });
  const result = await response.json();
  const list = Array.isArray(result?.data) ? result.data : [];

  if (response.ok && (result?.status === true || result?.success === true)) {
    return list.map((row) => mapApiFollowUp(row, type));
  }

  throw new Error(result?.message || 'Unable to load follow-ups right now.');
}

export async function changeSolarConvertedInterestStatus({
  sellerId,
  convertedId,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('converted_id', String(convertedId || ''));

  const response = await fetch(
    SOLAR_ENDPOINTS.INQUERY_CONVERTED_CHANGE_INTEREST_STATUS,
    {
      method: 'POST',
      body,
    },
  );
  const rawText = await response.text();
  return parseApiResponseOk(
    response,
    rawText,
    'Unable to update interest status right now.',
  );
}

export async function fetchSolarEnquiryDetails({ sellerId, enquiryId } = {}) {
  const body = new FormData();
  if (sellerId) body.append('seller_id', String(sellerId));
  body.append('id', String(enquiryId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_DETAILS, {
    method: 'POST',
    body,
  });

  const result = await response.json();
  const row = Array.isArray(result?.data) ? result.data[0] : result?.data;

  if (response.ok && row) {
    return mapApiEnquiry(row);
  }

  throw new Error(result?.message || 'Unable to load enquiry details.');
}

export async function assignSolarEnquiryStaff({
  sellerId,
  enquiryId,
  staffId,
} = {}) {
  const body = new FormData();
  body.append('id', String(enquiryId || ''));
  body.append('assign_staff_id', String(staffId || ''));
  body.append('seller_id', String(sellerId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_ASSIGN_STAFF, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || '').toLowerCase() === 'true' ||
    String(result?.success || '').toLowerCase() === 'true';

  if (response.ok && okStatus) return result;

  throw new Error(
    result?.message || result?.error || 'Unable to assign staff right now.',
  );
}

export async function assignSolarConvertedEnquiryStaff({
  sellerId,
  convertedId,
  staffId,
} = {}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('converted_id', String(convertedId || ''));
  body.append('assign_staff_id', String(staffId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERTED_ASSIGN_STAFF, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || '').toLowerCase() === 'true' ||
    String(result?.success || '').toLowerCase() === 'true';

  if (response.ok && okStatus) return result;

  throw new Error(
    result?.message || result?.error || 'Unable to assign staff right now.',
  );
}

export async function storeSolarEnquiryFollowUp({
  sellerId,
  enquiryId,
  types,
  remark,
  nextFollowUpDate,
} = {}) {
  const body = new FormData();
  body.append('id', String(enquiryId || ''));
  body.append('seller_id', String(sellerId || ''));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append('types[]', String(type || ''));
  });
  body.append('remark', String(remark || '').trim());
  body.append('next_follow_up_date', String(nextFollowUpDate || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_FOLLOW_UP_STORE, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || '').toLowerCase() === 'true' ||
    String(result?.success || '').toLowerCase() === 'true';

  if (response.ok && okStatus) return result;

  throw new Error(
    result?.message || result?.error || 'Unable to save follow-up right now.',
  );
}

export async function updateSolarEnquiryFollowUp({
  followUpId,
  types,
  remark,
  nextFollowUpDate,
} = {}) {
  const body = new FormData();
  body.append('follow_up_id', String(followUpId || ''));
  (Array.isArray(types) ? types : []).forEach((type) => {
    body.append('types[]', String(type || ''));
  });
  body.append('remark', String(remark || '').trim());
  body.append('next_follow_up_date', String(nextFollowUpDate || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_FOLLOW_UP_UPDATE, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  const okStatus =
    result?.status === true ||
    result?.success === true ||
    String(result?.status || '').toLowerCase() === 'true' ||
    String(result?.success || '').toLowerCase() === 'true';

  if (response.ok && okStatus) return result;

  throw new Error(
    result?.message || result?.error || 'Unable to update follow-up right now.',
  );
}

export async function convertSolarEnquiry({
  sellerId,
  enquiryId,
  address,
  dealAmount,
  systemSize,
  createdByStaffId,
}) {
  const body = new FormData();
  body.append('seller_id', String(sellerId || ''));
  body.append('id', String(enquiryId || ''));
  body.append('address', String(address || '').trim());
  body.append('deal_amount', String(dealAmount || '').trim());
  body.append('system_size', String(systemSize || '').trim());
  if (createdByStaffId) {
    body.append('created_by_staff_id', String(createdByStaffId));
  }

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_CONVERT, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (response.ok && (result?.status === true || result?.success === true)) {
    return result;
  }

  const message =
    result?.message ||
    result?.error ||
    'Unable to convert enquiry right now. Please try again.';
  throw new Error(message);
}

export async function markSolarEnquiryUnderDiscussion({
  sellerId,
  enquiryId,
} = {}) {
  const body = new FormData();
  body.append('id', String(enquiryId || ''));
  body.append('seller_id', String(sellerId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.INQUERY_UNDER_DISCUSSION, {
    method: 'POST',
    body,
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (response.ok && (result?.status === true || result?.success === true)) {
    return result;
  }

  throw new Error(
    result?.message ||
      result?.error ||
      'Unable to mark enquiry under discussion right now.',
  );
}

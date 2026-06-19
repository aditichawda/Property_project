// State and city IDs must match admin backend master data where required.
// Update ids here if the API rejects them (see admin panel / API docs).
const STATE_ROWS = [
  { id: 1, name: 'Maharashtra' },
  { id: 2, name: 'Gujarat' },
  { id: 3, name: 'Rajasthan' },
  { id: 4, name: 'Karnataka' },
  { id: 5, name: 'Delhi' },
  { id: 6, name: 'Uttar Pradesh' },
];

const CITY_ROWS = {
  1: [
    { id: 101, name: 'Mumbai' },
    { id: 102, name: 'Pune' },
    { id: 103, name: 'Nagpur' },
    { id: 104, name: 'Nashik' },
  ],
  2: [
    { id: 201, name: 'Ahmedabad' },
    { id: 202, name: 'Surat' },
    { id: 203, name: 'Vadodara' },
    { id: 204, name: 'Rajkot' },
  ],
  3: [
    { id: 301, name: 'Jaipur' },
    { id: 302, name: 'Udaipur' },
    { id: 303, name: 'Jodhpur' },
    { id: 304, name: 'Kota' },
  ],
  4: [
    { id: 401, name: 'Bengaluru' },
    { id: 402, name: 'Mysuru' },
    { id: 403, name: 'Mangaluru' },
    { id: 404, name: 'Hubballi' },
  ],
  5: [{ id: 501, name: 'New Delhi' }],
  6: [
    { id: 601, name: 'Lucknow' },
    { id: 602, name: 'Kanpur' },
    { id: 603, name: 'Ghaziabad' },
    { id: 604, name: 'Varanasi' },
  ],
};

export const SELLER_STATE_ROWS = STATE_ROWS;
export const SELLER_CITY_ROWS = CITY_ROWS;

export function resolveSellerRegistrationIds(stateName, cityName) {
  const state = STATE_ROWS.find((s) => s.name === stateName);
  if (!state) return { stateId: '', cityId: '' };
  const cities = CITY_ROWS[state.id] || [];
  const city = cities.find((c) => c.name === cityName);
  return { stateId: state.id, cityId: city?.id ?? '' };
}

export const SELLER_STATES = STATE_ROWS.map((s) => s.name);

export const SELLER_STATE_TO_CITIES = Object.fromEntries(
  STATE_ROWS.map((s) => [s.name, (CITY_ROWS[s.id] || []).map((c) => c.name)])
);

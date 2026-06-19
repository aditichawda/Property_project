/** Categories and dependent sub-options for seller services management */

export const SERVICE_CATEGORIES = [
  'Solar Installation',
  'Solar Capacity',
  'Inverter Brand',
  'ACDB/DCDB',
];

export const CATEGORY_SUB_OPTIONS = {
  'Solar Installation': [],
  'Solar Capacity': [
    '3KW Solar',
    '5KW Solar',
    '10KW Solar',
    '5KW structure + 3KW plates',
    '10KW structure + 5KW plates',
  ],
  'Inverter Brand': ['Havells', 'Polycab', 'K Solar', 'UTL', 'Microtek', 'Luminous'],
  'ACDB/DCDB': ['Havells', 'Polycab', 'Others'],
};

export function getSubOptionsForCategory(category) {
  return CATEGORY_SUB_OPTIONS[category] || [];
}

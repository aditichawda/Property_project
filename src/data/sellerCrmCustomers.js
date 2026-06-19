export const LEAD_STEP_STORAGE_KEY = 'seller_crm_lead_steps_v1';

export const CRM_STATUSES = [
  'Pending',
  'Document Collected',
  'Portal Registration',
  'Loan Application Submitted',
  'Loan Approved',
  'Loan Disbursed',
  'Material Dispatch',
  'Installation Done',
  'EB File Ready',
  'NoC Done',
  'Plant Started',
  'Balance Payment Follow-up',
  'Subsidy Request Done',
];

export const CRM_LEAD_STATES = ['Interested', 'Not Interested'];

export const CRM_STATUS_BADGE_CLASS = {
  'Interested': 'seller-crm-status seller-crm-status--interested',
  'Not Interested': 'seller-crm-status seller-crm-status--not-interested',
  'Pending': 'seller-crm-status seller-crm-status--pending',
  // Loss: 'seller-crm-status seller-crm-status--loss',
  'Document Collected': 'seller-crm-status seller-crm-status--contacted',
  'Portal Registration': 'seller-crm-status seller-crm-status--survey',
  'Loan Application Submitted': 'seller-crm-status seller-crm-status--proposal',
  'Loan Approved': 'seller-crm-status seller-crm-status--proposal',
  'Loan Disbursed': 'seller-crm-status seller-crm-status--deal',
  'Material Dispatch': 'seller-crm-status seller-crm-status--install',
  'Installation Done': 'seller-crm-status seller-crm-status--install',
  'EB File Ready': 'seller-crm-status seller-crm-status--install',
  'NoC Done': 'seller-crm-status seller-crm-status--install',
  'Plant Started': 'seller-crm-status seller-crm-status--completed',
  'Balance Payment Follow-up': 'seller-crm-status seller-crm-status--proposal',
  'Subsidy Request Done': 'seller-crm-status seller-crm-status--completed',
};

export const CRM_PROGRESS_STEPS = [
  // 'Pending',
  'Document Collected',
  'Portal Registration',
  'Loan Application Submitted',
  'Loan Approved',
  'Loan Disbursed',
  'Material Dispatch',
  'Installation Done',
  'EB File Ready',
  'NoC Done',
  'Plant Started',
  'Balance Payment Follow-up',
  'Subsidy Request Done',
];

export const CRM_STATUS_TO_STEP = {
  // 'Pending': 'Pending',
  // Loss: 'Won / Loss',
  'Document Collected': 'Document Collected',
  'Portal Registration': 'Portal Registration',
  'Loan Application Submitted': 'Loan Application Submitted',
  'Loan Approved': 'Loan Approved',
  'Loan Disbursed': 'Loan Disbursed',
  'Material Dispatch': 'Material Dispatch',
  'Installation Done': 'Installation Done',
  'EB File Ready': 'EB File Ready',
  'NoC Done': 'NoC Done',
  'Plant Started': 'Plant Started',
  'Balance Payment Follow-up': 'Balance Payment Follow-up',
  'Subsidy Request Done': 'Subsidy Request Done',
};
export const getBadgeClass = (status) => {
  return CRM_STATUS_BADGE_CLASS[status] || 'seller-crm-status';
};
export function getCompletedStepIndexByStatus(status) {
  const step = CRM_STATUS_TO_STEP[status] || 'New Enquiry';
  const idx = CRM_PROGRESS_STEPS.indexOf(step);
  return Math.max(0, idx);
}

export const CRM_DUMMY_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rohit Sharma',
    phone: '9876543210',
    city: 'Indore',
    address: 'Vijay Nagar, Indore, MP',
    systemSize: '3KW',
    assignedStaff: 'Demo Manager',
    createdBy: 'Admin',
    status: 'New Enquiry',
    dealAmount: 180000,
    createdAt: '2025-01-15T10:30:00.000Z',
    followUps: [
      { date: '16-01-2025',followUpby:["Email", "Call"], remark: 'Initial contact made. Customer wants a site visit.' },
      { date: '18-01-2025',followUpby: ["Call"], remark: 'Site visit scheduled for tomorrow.' },
    ],
  },
  {
    id: 'cust-2',
    name: 'Neha Verma',
    phone: '9988776655',
    city: 'Bhopal',
    address: 'Arera Colony, Bhopal, MP',
    systemSize: '5KW',
    assignedStaff: 'Sales Executive',
    createdBy: 'Manager',
    status: 'Portal Registration',
    dealAmount: 295000,
    createdAt: '2025-01-15T10:30:00.000Z',
    followUps: [
      { date: '17-01-2025', remark: 'Documents collected. Registration in progress.' },
    ],
  },
  {
    id: 'cust-3',
    name: 'Amit Patel',
    phone: '9123456780',
    city: 'Ujjain',
    address: 'Freeganj, Ujjain, MP',
    systemSize: '10KW',
    assignedStaff: 'Technician',
    createdBy: 'HR',
    status: 'Installation Done',
    dealAmount: 520000,
    createdAt: '2025-01-15T10:30:00.000Z',
    followUps: [],
  },
];

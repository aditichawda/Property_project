export const SELLER_DUMMY_PROFILE = {
  id: 'seller-1',
  fullName: 'Demo Seller',
  phone: '9876543210',
  email: 'demo@seller.com',
  address: '12 Solar Street, Green Hills',
  state: 'Maharashtra',
  city: 'Pune',
};

const now = Date.now();

export const SELLER_DUMMY_LEADS = [
  {
    id: 'lead-101',
    name: 'Aarav Sharma',
    phone: '9012345678',
    city: 'Pune',
    status: 'New',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'lead-102',
    name: 'Neha Verma',
    phone: '9098765432',
    city: 'Mumbai',
    status: 'Contacted',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'lead-103',
    name: 'Rohit Joshi',
    phone: '9123456780',
    city: 'Nagpur',
    status: 'Qualified',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
];

export const SELLER_DUMMY_ENQUIRIES = [
  {
    id: 'enq-201',
    buyerName: 'Priya Singh',
    buyerPhone: '9988776655',
    requirement: 'Residential solar for 3BHK',
    city: 'Ahmedabad',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'enq-202',
    buyerName: 'Vikram Rao',
    buyerPhone: '8877665544',
    requirement: 'Commercial solar for warehouse',
    city: 'Surat',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export const SELLER_DUMMY_ACTIVE_LISTINGS = 3;


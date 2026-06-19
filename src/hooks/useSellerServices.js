import { useCallback, useState } from 'react';
import { safeJsonParse } from '../utils/safeJsonParse';

const STORAGE_KEY = 'seller_services_list';

const defaultServices = [
  {
    id: 'svc-seed-1',
    title: 'Residential 5KW Package',
    category: 'Solar Capacity',
    subOption: '5KW Solar',
    solarServiceCategory: '5KW Solar',
    inverterBrand: 'Havells',
    acdbDcdb: 'Havells',
    price: '',
    capacityKw: '5',
    installationTime: '2–3 days',
    warrantyYears: '5',
    description: 'Complete rooftop solar package with net metering support.',
    thumbnail: '',
    images: [],
  },
];

function load() {
  if (typeof window === 'undefined') return defaultServices;
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw, null);
  if (Array.isArray(parsed)) return parsed;
  return defaultServices;
}

function persist(list) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function useSellerServices() {
  const [services, setServices] = useState(load);

  const addService = useCallback((row) => {
    const id = `svc-${Date.now()}`;
    setServices((prev) => {
      const next = [...prev, { ...row, id }];
      persist(next);
      return next;
    });
    return id;
  }, []);

  const updateService = useCallback((id, row) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...row, id } : s));
      persist(next);
      return next;
    });
  }, []);

  const deleteService = useCallback((id) => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { services, addService, updateService, deleteService };
}

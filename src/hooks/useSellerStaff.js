import { useCallback, useState } from 'react';
import { safeJsonParse } from '../utils/safeJsonParse';

const STORAGE_KEY = 'seller_staff_list';

const defaultStaff = [
  {
    id: 'staff-seed-1',
    name: 'Demo Manager',
    phone: '9876500000',
    email: 'manager@example.com',
    role: 'Manager',
  },
];

function load() {
  if (typeof window === 'undefined') return defaultStaff;
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw, null);
  if (Array.isArray(parsed)) return parsed;
  return defaultStaff;
}

function persist(list) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function useSellerStaff() {
  const [staff, setStaff] = useState(load);

  const addStaff = useCallback((row) => {
    const id = `staff-${Date.now()}`;
    setStaff((prev) => {
      const next = [...prev, { ...row, id }];
      persist(next);
      return next;
    });
    return id;
  }, []);

  const updateStaff = useCallback((id, row) => {
    setStaff((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...row, id } : s));
      persist(next);
      return next;
    });
  }, []);

  const deleteStaff = useCallback((id) => {
    setStaff((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { staff, addStaff, updateStaff, deleteStaff };
}

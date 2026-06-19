import { useState, useEffect } from 'react';
import { SOLAR_ENDPOINTS } from '../config/api';

export function useSolarRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(SOLAR_ENDPOINTS.ROLES_GET)
      .then((r) => r.json())
      .then((result) => {
        if (!alive) return;
        const candidates = [
          result?.data?.roles,
          result?.data?.role_list,
          result?.data?.staff_roles,
          result?.data,
          result?.roles,
          result?.role_list,
          result?.staff_roles,
        ];
        const list = candidates.find((item) => Array.isArray(item)) || [];
        const normalized = list
          .map((role) => {
            if (typeof role === 'string') return { id: role, name: role };
            const id = role?.id ?? role?.role_id ?? role?.value;
            const name = role?.name || role?.role_name || role?.title;
            return id != null && name
              ? { id: String(id), name: String(name).trim() }
              : null;
          })
          .filter(Boolean);
        setRoles(normalized);
      })
      .catch(() => alive && setRoles([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return { roles, loading };
}

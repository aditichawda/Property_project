import React, { useMemo, useState } from 'react';
import SellerDashboardLayout from '../Elements/SellerDashboardLayout';
import { SELLER_DUMMY_LEADS } from '../../data/sellerDummyData';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import Banner from '../Elements/Banner';
import { SOLAR_IMAGES } from '../../data/solarImages';

export default function SellerLeads() {
  const [query, setQuery] = useState('');

  const leads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SELLER_DUMMY_LEADS;
    return SELLER_DUMMY_LEADS.filter((l) => {
      return (
        String(l.name || '').toLowerCase().includes(q) ||
        String(l.phone || '').includes(q) ||
        String(l.city || '').toLowerCase().includes(q) ||
        String(l.status || '').toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
       
        <SellerDashboardLayout>
          <div className="seller-crm-content">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: 'rgba(0,0,0,0.75)' }}>My Leads</h4>
              <div style={{ marginLeft: 'auto', minWidth: 260 }}>
                <input
                  className="form-control"
                  placeholder="Search leads by name, phone, city, status..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ color: 'rgba(0,0,0,0.6)', padding: 18 }}>
                        No leads found for your search.
                      </td>
                    </tr>
                  ) : (
                    leads.map((l) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 800 }}>{l.name}</td>
                        <td>{l.phone}</td>
                        <td>{l.city}</td>
                        <td>
                          <span
                            style={{
                              padding: '6px 10px',
                              borderRadius: 999,
                              background: l.status === 'New' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0,0,0,0.04)',
                              color: l.status === 'New' ? '#d97706' : 'rgba(0,0,0,0.7)',
                              fontWeight: 800,
                              fontSize: 12,
                              display: 'inline-block',
                            }}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(0,0,0,0.55)' }}>
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}


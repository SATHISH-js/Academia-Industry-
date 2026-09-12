import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Handshake, Calendar, CheckCircle2 } from 'lucide-react';

export const IndustryPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await api.get('/institution/partners');
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading corporate partners...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Corporate Industry Partners & MoUs
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Formal agreements, campus hiring arrangements, and sponsored academic laboratory collaborations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {partners.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-primary">{p.partnership_type}</span>
                <span className="badge badge-success">{p.status}</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {p.company_name}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                {p.industry_domain} • {p.city}
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', margin: '1rem 0', lineHeight: 1.5 }}>
                {p.notes || 'Formal memorandum of understanding for reciprocal training and campus recruitment.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              <span>Signed: {p.mou_signed_date ? new Date(p.mou_signed_date).toLocaleDateString() : 'Active'}</span>
              <span>Valid Until: {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : 'Perpetual'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

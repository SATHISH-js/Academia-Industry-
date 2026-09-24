import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  X,
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';

export const InstitutionalDirectivesModal = ({
  onClose
}) => {
  const [directives, setDirectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchDirectives();
  }, [priorityFilter]);

  const fetchDirectives = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/academician/directives?priority=${priorityFilter}`);
      if (res.data.success) {
        setDirectives(res.data.data.directives || []);
      }
    } catch (err) {
      console.error('Failed to load directives', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionDirective = async (id, newStatus = 'ACTIONED') => {
    try {
      setUpdatingId(id);
      const res = await api.put(`/academician/directives/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setDirectives((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      console.error('Failed to update directive status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="badge badge-danger">URGENT</span>;
      case 'HIGH':
        return <span className="badge" style={{ backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}>HIGH PRIORITY</span>;
      case 'MEDIUM':
        return <span className="badge badge-warning">MEDIUM</span>;
      default:
        return <span className="badge badge-neutral">STANDARD</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 16px)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Institutional Commands & Department Directives
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary-200)', marginTop: '0.15rem' }}>
                Official directives issued by the institution administration & department head
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar */}
        <div
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--slate-50)',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--slate-500)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>Priority Filter:</span>
            <select
              className="form-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Standard</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            Showing <strong>{directives.length}</strong> active directive(s)
          </div>
        </div>

        {/* Directive Cards List */}
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
              Fetching institutional commands...
            </div>
          ) : directives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-400)' }}>
              <Building2 size={36} style={{ margin: '0 auto 0.5rem', color: 'var(--slate-300)' }} />
              <div style={{ fontWeight: 600, color: 'var(--slate-600)' }}>No active directives under this filter</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                All institutional commands have been acknowledged or actioned.
              </div>
            </div>
          ) : (
            directives.map((dir) => {
              const isActioned = dir.status === 'ACTIONED';
              const isUrgent = dir.priority === 'URGENT' || dir.priority === 'HIGH';

              return (
                <div
                  key={dir.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: isUrgent ? '4px solid #ef4444' : '4px solid var(--primary-600)',
                    backgroundColor: isActioned ? 'var(--slate-50)' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {dir.directive_code || 'DIR-2026'}
                        </span>
                        {getPriorityBadge(dir.priority)}
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {dir.category || 'ACADEMIC'}
                        </span>
                        {isActioned && (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={11} style={{ marginRight: '0.2rem' }} /> Actioned
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.35rem 0' }}>
                        {dir.title}
                      </h4>
                    </div>

                    {/* Action button */}
                    <div>
                      {!isActioned ? (
                        <button
                          onClick={() => handleActionDirective(dir.id, 'ACTIONED')}
                          disabled={updatingId === dir.id}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <CheckCircle2 size={13} /> {updatingId === dir.id ? 'Updating...' : 'Mark Actioned'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionDirective(dir.id, 'ACTIVE')}
                          disabled={updatingId === dir.id}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0.6rem 0 0.85rem 0' }}>
                    {dir.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-100)', paddingTop: '0.65rem' }}>
                    <div>
                      Issued by: <strong>{dir.issued_by || 'Dean / Principal'}</strong>
                    </div>
                    {dir.target_department && (
                      <div>
                        Target: <strong>{dir.target_department}</strong>
                      </div>
                    )}
                    {dir.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isUrgent ? 'var(--danger-600)' : 'var(--slate-600)', fontWeight: 600 }}>
                        <Clock size={12} />
                        Deadline: {new Date(dir.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid var(--slate-200)',
            backgroundColor: 'var(--slate-50)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

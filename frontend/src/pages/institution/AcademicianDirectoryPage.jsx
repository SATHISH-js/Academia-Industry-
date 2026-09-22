import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Award,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import { InstitutionContactModal } from '../../components/institution/InstitutionContactModal';
import { AddAcademicianModal } from '../../components/institution/AddAcademicianModal';

export const AcademicianDirectoryPage = () => {
  const [academicians, setAcademicians] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contactAcademicianTarget, setContactAcademicianTarget] = useState(null);

  const departmentsList = [
    { label: 'All Departments', value: '' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Information Tech', value: 'Information Technology' },
    { label: 'Data Science / AI', value: 'Data Science' },
    { label: 'Electronics & Comm', value: 'Electronics' }
  ];

  useEffect(() => {
    fetchAcademicians();
  }, [department]);

  const fetchAcademicians = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department) params.department = department;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/institution/academicians', { params });
      if (res.data.success) {
        setAcademicians(res.data.data.academicians || []);
        setTotalCount(res.data.data.totalAcademicians || 0);
      }
    } catch (err) {
      console.error('Failed to load academicians directory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAcademicians();
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    fetchAcademicians();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              📚 Institutional Faculty Roster
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Academician & Faculty Directory
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Browse and connect with professors, researchers, and faculty scholars across departments. Track industry research projects, publications, onboard new staff by Employee / Register Number, and dispatch institutional notices.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                Total Faculty Members
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn"
              style={{
                backgroundColor: '#2dd4bf',
                color: '#042f2e',
                fontWeight: 800,
                fontSize: '0.88rem',
                padding: '0.75rem 1.25rem',
                gap: '0.4rem'
              }}
            >
              <UserPlus size={16} /> + Add Faculty by Reg No.
            </button>
          </div>
        </div>
      </div>

      {/* Department Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.35rem',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {departmentsList.map(dept => {
          const isSelected = dept.value === department;
          return (
            <button
              key={dept.label}
              onClick={() => setDepartment(dept.value)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                whiteSpace: 'nowrap',
                borderRadius: '9999px'
              }}
            >
              {dept.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search faculty by name, employee reg no, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ width: '220px' }}>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science / AI</option>
                <option value="Electronics">Electronics & Communication</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Search size={15} /> Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
          Loading faculty directory...
        </div>
      ) : academicians.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          No faculty members found matching current filter criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {academicians.map(acad => (
            <div key={acad.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {acad.department}
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: '#f0fdfa',
                          color: '#0f766e',
                          border: '1px solid #99f6e4'
                        }}
                      >
                        {acad.employee_id || 'STAFF-ID: PENDING'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {acad.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)', marginTop: '0.15rem' }}>
                      {acad.designation || 'Faculty Member'}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--slate-100)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--slate-800)' }}>
                      {acad.experience_years || 5}+
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                      Yrs Exp
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  {acad.qualification ? `${acad.qualification}. ` : ''}
                  {acad.specialization ? `Specializing in ${acad.specialization}.` : 'Experienced academician focusing on applied research and curriculum alignment.'}
                </p>

                {acad.research_areas && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                      Research & Specialization:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {acad.research_areas.split(', ').map((ra, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem', textTransform: 'none' }}>
                          {ra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--slate-600)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--primary-600)" /> {acad.email}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setContactAcademicianTarget(acad)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.3rem' }}
                  >
                    <Mail size={13} /> Contact Faculty
                  </button>
                  {acad.google_scholar_url && (
                    <a
                      href={acad.google_scholar_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      Scholar <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Academician Modal */}
      {isAddModalOpen && (
        <AddAcademicianModal
          onClose={() => setIsAddModalOpen(false)}
          onAcademicianAdded={() => fetchAcademicians()}
        />
      )}

      {/* Contact Academician Modal */}
      {contactAcademicianTarget && (
        <InstitutionContactModal
          recipient={contactAcademicianTarget}
          type="ACADEMICIAN"
          onClose={() => setContactAcademicianTarget(null)}
          onMessageSent={() => fetchAcademicians()}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  Award,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  PieChart,
  BarChart2,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Cloud,
  Code2,
  Brain
} from 'lucide-react';

export const PlacementAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState('ALL');
  const [rosterSearch, setRosterSearch] = useState('');

  const fetchPlacementAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institution/placements/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load placement analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementAnalytics();
  }, []);

  const getFieldIcon = (field) => {
    const f = (field || '').toLowerCase();
    if (f.includes('ai') || f.includes('data')) return Brain;
    if (f.includes('cloud') || f.includes('devops')) return Cloud;
    if (f.includes('cyber') || f.includes('security')) return ShieldCheck;
    if (f.includes('hardware') || f.includes('embedded') || f.includes('core')) return Cpu;
    return Code2;
  };

  const getFieldColor = (index) => {
    const colors = [
      { bg: 'rgba(99, 102, 241, 0.15)', bar: 'var(--primary-600)', text: 'var(--primary-700)' },
      { bg: 'rgba(14, 165, 233, 0.15)', bar: 'var(--accent-500)', text: 'var(--accent-600)' },
      { bg: 'rgba(16, 185, 129, 0.15)', bar: 'var(--success-500)', text: 'var(--success-700)' },
      { bg: 'rgba(245, 158, 11, 0.15)', bar: 'var(--warning-500)', text: 'var(--warning-700)' },
      { bg: 'rgba(168, 85, 247, 0.15)', bar: '#a855f7', text: '#7e22ce' }
    ];
    return colors[index % colors.length];
  };

  const filteredRoster = (analytics?.placedRoster || []).filter(student => {
    const matchesField = selectedFieldFilter === 'ALL' || student.placement_field === selectedFieldFilter;
    const matchesSearch = !rosterSearch || 
      student.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (student.placed_company && student.placed_company.toLowerCase().includes(rosterSearch.toLowerCase())) ||
      (student.department && student.department.toLowerCase().includes(rosterSearch.toLowerCase()));
    return matchesField && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.85rem' }}>
              <TrendingUp size={14} /> Campus Recruitment & Career Outcomes
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              College Placement Analytics
            </h1>
            <p style={{ color: '#a7f3d0', maxWidth: '750px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Comprehensive visual breakdown of overall students placed in the college categorized by technical domain, average compensation packages, and hiring industry partners.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          Loading placement visual analytics & field distributions...
        </div>
      ) : analytics && (
        <>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Total Students</span>
                <Users size={18} color="var(--primary-600)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {analytics.totalStudents}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                Enrolled across all departments
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Placed Students</span>
                <Briefcase size={18} color="var(--success-600)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success-600)' }}>
                {analytics.placedStudents}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                Verified corporate job offers
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Placement Rate</span>
                <TrendingUp size={18} color="var(--accent-500)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {analytics.placementRate}%
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${analytics.placementRate}%`, height: '100%', backgroundColor: 'var(--success-600)' }} />
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Average CTC</span>
                <Award size={18} color="var(--warning-500)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {analytics.averagePackage}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                Median campus compensation
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Highest Package</span>
                <Sparkles size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6d28d9' }}>
                {analytics.highestPackage}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                Top enterprise recruitment offer
              </div>
            </div>
          </div>

          {/* =========================================================
              RESPONSIVE VISUAL GRAPH: OVERALL PLACEMENTS BY FIELD
              ========================================================= */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={22} color="var(--primary-600)" /> Overall Placements by Technical Field
                </h2>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Visual distribution of students hired across engineering specializations and target technical tracks.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">
                  {analytics.fieldsData?.length || 0} Specialization Fields
                </span>
                <span className="badge badge-success">
                  {analytics.placedStudents} Placed Cohorts
                </span>
              </div>
            </div>

            {/* Visual Bar Graph Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {(analytics.fieldsData || []).map((f, index) => {
                const Icon = getFieldIcon(f.field);
                const colorTheme = getFieldColor(index);
                return (
                  <div
                    key={f.field}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--border-color)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Field Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          backgroundColor: colorTheme.bg,
                          color: colorTheme.bar,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                            {f.field}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginLeft: '0.75rem' }}>
                            Top Hiring: <strong>{f.hiringCompanies.join(', ')}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Average CTC:</span>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                            {f.avgCtc} LPA
                          </div>
                        </div>

                        <div style={{
                          backgroundColor: '#ffffff',
                          padding: '0.35rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'center',
                          minWidth: '90px'
                        }}>
                          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: colorTheme.bar }}>
                            {f.placedCount}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '0.35rem' }}>
                            ({f.percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Visual Representation */}
                    <div style={{
                      width: '100%',
                      height: '14px',
                      backgroundColor: 'var(--slate-200)',
                      borderRadius: '7px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div
                        style={{
                          width: `${Math.max(f.percentage, 5)}%`,
                          height: '100%',
                          backgroundColor: colorTheme.bar,
                          borderRadius: '7px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filterable Placed Students Roster Table */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Placed Students Directory
                </h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                  Filter placed students by engineering specialization domain or search by name.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by student or company..."
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 2.25rem' }}
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-control"
                  style={{ width: '180px', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                  value={selectedFieldFilter}
                  onChange={(e) => setSelectedFieldFilter(e.target.value)}
                >
                  <option value="ALL">All Fields</option>
                  {(analytics.fieldsData || []).map(f => (
                    <option key={f.field} value={f.field}>{f.field}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredRoster.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                No placed students match the selected field filter.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department & Degree</th>
                      <th>CGPA</th>
                      <th>Hiring Company</th>
                      <th>Placement Field</th>
                      <th>Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.department}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.degree} • Batch {s.graduation_year}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{s.cgpa || 'N/A'}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                            <Building2 size={15} color="var(--primary-600)" />
                            {s.placed_company || 'Corporate Partner'}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {s.placement_field}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ fontWeight: 800 }}>
                            {s.placed_package || '12.0 LPA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

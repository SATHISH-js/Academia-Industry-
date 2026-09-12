import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, GraduationCap, CheckCircle2, Search } from 'lucide-react';

export const StudentDirectoryPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/institution/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student directory', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading campus student directory...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Student Roster & Skill Tracking
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Monitor campus cohorts, verified skill scores, and placement outcomes.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search student or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Enrollment #</th>
                <th>Department & Degree</th>
                <th>CGPA</th>
                <th>Overall Skill Score</th>
                <th>Placement Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.email}</div>
                  </td>
                  <td><code>{s.enrollment_number || 'N/A'}</code></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.department}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.degree} • Class of {s.graduation_year}</div>
                  </td>
                  <td><strong>{s.cgpa || 'N/A'}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: 8, backgroundColor: 'var(--slate-200)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: `${s.overall_skill_score || 0}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.overall_skill_score || 0}%</span>
                    </div>
                  </td>
                  <td>
                    {s.is_placed ? (
                      <span className="badge badge-success">Placed</span>
                    ) : (
                      <span className="badge badge-warning">In Training</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

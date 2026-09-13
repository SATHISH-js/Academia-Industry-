import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, UserPlus, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'STUDENT';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    institution_id: ''
  });

  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/institution/public-list')
      .then(res => {
        if (res.data.success) {
          setInstitutions(res.data.data || []);
        }
      })
      .catch(err => console.error('Failed to load institutions list', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      if (formData.role === 'STUDENT' && formData.institution_id) {
        payload.institution_id = formData.institution_id;
      }

      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);

        // Redirect to role dashboard
        switch (user.role) {
          case 'STUDENT':
            navigate('/student/dashboard');
            break;
          case 'ACADEMICIAN':
            navigate('/academician/dashboard');
            break;
          case 'INDUSTRY':
            navigate('/industry/dashboard');
            break;
          case 'INSTITUTION':
            navigate('/institution/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('[Registration Error]', err);
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height) - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Create an Account
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Select your ecosystem role to get started
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-50)',
            border: '1px solid #fca5a5',
            color: 'var(--danger-600)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name / Organization</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Rahul Sharma or TechCorp Solutions"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. name@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="STUDENT">Student (Looking for Skills, Gaps, Internships & Jobs)</option>
              <option value="ACADEMICIAN">Academician (Faculty Training, FDPs & Research)</option>
              <option value="INDUSTRY">Industry (Hiring, Internships & Mentorship)</option>
              <option value="INSTITUTION">Institution (College / University Placement & Analytics)</option>
            </select>
          </div>

          {formData.role === 'STUDENT' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} color="var(--primary-600)" />
                <span>Your College / Educational Institution</span>
              </label>
              <select
                name="institution_id"
                className="form-control"
                value={formData.institution_id}
                onChange={handleChange}
              >
                <option value="">-- Select Your College (Optional during signup) --</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.institution_name} ({inst.city}, {inst.state || 'India'})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Linking your college enables your campus administrators to monitor your skill assessments and roadmap milestones.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Password must have at least 8 characters, with at least one uppercase letter, one lowercase letter, and one number.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register & Continue
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

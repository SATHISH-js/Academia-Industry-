import React, { useState } from 'react';
import api from '../../services/api';
import { UserPlus, X, CheckCircle2, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';

export const AddAcademicianModal = ({ onClose, onAcademicianAdded }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    qualification: 'Ph.D in Computer Science',
    experience_years: '5',
    specialization: 'Artificial Intelligence & Machine Learning'
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id.trim() || !formData.name.trim() || !formData.email.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all mandatory fields.' });
      return;
    }

    try {
      setSaving(true);
      setStatus(null);

      const payload = {
        employee_id: formData.employee_id.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        qualification: formData.qualification.trim(),
        experience_years: parseInt(formData.experience_years, 10) || 1,
        specialization: formData.specialization.trim()
      };

      const res = await api.post('/institution/academicians', payload);
      if (res.data.success) {
        setStatus({
          type: 'success',
          text: `Faculty member ${formData.name} added successfully with Reg No: ${formData.employee_id}!`
        });
        setTimeout(() => {
          if (onAcademicianAdded) onAcademicianAdded();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to add academician', err);
      setStatus({
        type: 'error',
        text: err.response?.data?.error || 'Failed to onboard academician.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 1050,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--slate-900)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <GraduationCap size={22} color="#2dd4bf" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Onboard Faculty by Register Number
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-300)' }}>
                Register Staff & Link to College Department
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-400)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}
        >
          {status && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: status.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
                color: status.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Faculty Register / Employee ID <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <input
                type="text"
                name="employee_id"
                className="form-control"
                placeholder="e.g. FAC-CSE-108"
                value={formData.employee_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Full Name <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Dr. Ramesh Gupta"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Email Address <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. ramesh.cse@institution.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Department <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science / AI">Data Science / AI</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Designation</label>
              <select
                name="designation"
                className="form-control"
                value={formData.designation}
                onChange={handleChange}
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                <option value="Lecturer / Research Fellow">Lecturer / Research Fellow</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Years of Experience</label>
              <input
                type="number"
                name="experience_years"
                min="0"
                max="50"
                className="form-control"
                value={formData.experience_years}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Academic Qualification</label>
            <input
              type="text"
              name="qualification"
              className="form-control"
              placeholder="e.g. Ph.D in Computer Science, M.Tech in Embedded Systems"
              value={formData.qualification}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Research Specialization & Keywords</label>
            <input
              type="text"
              name="specialization"
              className="form-control"
              placeholder="e.g. Machine Learning, Cloud Systems, Internet of Things"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              {saving ? (
                <>
                  <Sparkles size={15} className="animate-spin" /> Adding Faculty...
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Add Faculty Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

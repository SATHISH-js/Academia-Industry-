import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  PlusCircle,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  MapPin,
  Building2,
  Trash2,
  Search,
  ExternalLink
} from 'lucide-react';

export const PostOpportunityPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('POST'); // 'POST' | 'MANAGE'
  const [allSkills, setAllSkills] = useState([]);
  const [postedData, setPostedData] = useState({ internships: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    opportunityType: 'INTERNSHIP', // 'INTERNSHIP' | 'JOB'
    title: '',
    description: '',
    location: 'Bengaluru',
    work_mode: 'HYBRID',
    duration_months: 3,
    stipend_amount: '25,000 / month',
    salary_range: '8 - 14 LPA',
    openings: 2,
    deadline: '',
    education_requirement: 'B.Tech / B.E. / MCA in CSE or allied',
    min_skill_score: 70,
    requiredSkills: [] // Array of { skill_id, skill_name, min_required_score, is_mandatory }
  });

  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');
  const [skillScoreToAdd, setSkillScoreToAdd] = useState(75);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [skillsRes, oppsRes] = await Promise.all([
        api.get('/skills'),
        api.get('/industry/my-opportunities')
      ]);

      if (skillsRes.data.success) {
        setAllSkills(skillsRes.data.data);
      }
      if (oppsRes.data.success) {
        setPostedData(oppsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load skills and opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!selectedSkillToAdd) return;
    const skillObj = allSkills.find(s => String(s.id) === String(selectedSkillToAdd));
    if (!skillObj) return;

    // Check if already added
    if (formData.requiredSkills.some(s => String(s.skill_id) === String(skillObj.id))) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      requiredSkills: [
        ...prev.requiredSkills,
        {
          skill_id: skillObj.id,
          skill_name: skillObj.name,
          min_required_score: skillScoreToAdd,
          is_mandatory: true
        }
      ]
    }));
    setSelectedSkillToAdd('');
  };

  const handleRemoveSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s.skill_id !== skillId)
    }));
  };

  const handleScoreChange = (skillId, score) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.map(s =>
        s.skill_id === skillId ? { ...s, min_required_score: parseInt(score, 10) } : s
      )
    }));
  };

  const handleSubmitOpportunity = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline) {
      setFeedback({ type: 'error', text: 'Please fill all required fields including title, description, and deadline.' });
      return;
    }

    if (formData.requiredSkills.length === 0) {
      setFeedback({ type: 'error', text: 'Please add at least one required skill benchmark for candidate matching.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const endpoint = formData.opportunityType === 'INTERNSHIP' ? '/internships' : '/jobs';
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location,
        work_mode: formData.work_mode,
        openings: parseInt(formData.openings, 10) || 1,
        deadline: formData.deadline,
        skills: formData.requiredSkills.map(s => ({
          skill_id: s.skill_id,
          min_required_score: s.min_required_score,
          is_mandatory: s.is_mandatory
        }))
      };

      if (formData.opportunityType === 'INTERNSHIP') {
        payload.duration_months = parseInt(formData.duration_months, 10) || 3;
        payload.stipend_amount = formData.stipend_amount;
        payload.education_requirement = formData.education_requirement;
        payload.min_skill_score = formData.min_skill_score;
      } else {
        payload.salary_range = formData.salary_range;
        payload.education = formData.education_requirement;
        payload.experience_years = 0;
      }

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        const createdId = res.data.data.id;
        setFeedback({
          type: 'success',
          text: `${formData.opportunityType === 'INTERNSHIP' ? 'Internship' : 'Job'} role posted successfully! You can now match candidates.`,
          createdId,
          createdType: formData.opportunityType
        });

        // Reset form
        setFormData({
          opportunityType: 'INTERNSHIP',
          title: '',
          description: '',
          location: 'Bengaluru',
          work_mode: 'HYBRID',
          duration_months: 3,
          stipend_amount: '25,000 / month',
          salary_range: '8 - 14 LPA',
          openings: 2,
          deadline: '',
          education_requirement: 'B.Tech / B.E. / MCA in CSE or allied',
          min_skill_score: 70,
          requiredSkills: []
        });

        // Refresh posted list
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to post opportunity', err);
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to create opportunity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const allPosted = [
    ...(postedData.internships || []).map(i => ({ ...i, type_badge: 'INTERNSHIP' })),
    ...(postedData.jobs || []).map(j => ({ ...j, type_badge: 'JOB' }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              💼 Role & Opportunity Architecture
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Post Roles & Source Matching Students
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Define technical roles with precise skill benchmark proficiencies. Our engine evaluates candidate assessments in real-time, delivering instant compatibility rankings for each opening.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('POST')}
              style={{
                background: activeTab === 'POST' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Post New Opportunity
            </button>
            <button
              onClick={() => setActiveTab('MANAGE')}
              style={{
                background: activeTab === 'MANAGE' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Briefcase size={15} /> Active Postings ({allPosted.length})
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: feedback.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
          color: feedback.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontWeight: 600 }}>{feedback.text}</span>
          </div>
          {feedback.createdId && (
            <button
              onClick={() => navigate(`/industry/candidates?type=${feedback.createdType}&id=${feedback.createdId}`)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              <Sparkles size={14} /> Search Matching Students Now
            </button>
          )}
        </div>
      )}

      {activeTab === 'POST' ? (
        /* Form: Post Role with Required Skills */
        <form onSubmit={handleSubmitOpportunity} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              1. Role Specifications
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Define the opportunity title, type, location, and compensation parameters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Opportunity Type */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Opportunity Type *</label>
              <select
                className="form-control"
                value={formData.opportunityType}
                onChange={(e) => setFormData({ ...formData, opportunityType: e.target.value })}
              >
                <option value="INTERNSHIP">Internship Opportunity</option>
                <option value="JOB">Full-Time Job Position</option>
              </select>
            </div>

            {/* Title */}
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Role Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Associate Cloud Software Engineer / React Trainee"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Work Mode */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Work Mode *</label>
              <select
                className="form-control"
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Job Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bengaluru, Hyderabad, Pune"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Compensation */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                {formData.opportunityType === 'INTERNSHIP' ? 'Stipend Amount *' : 'Salary Range (CTC) *'}
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.opportunityType === 'INTERNSHIP' ? formData.stipend_amount : formData.salary_range}
                onChange={(e) => {
                  if (formData.opportunityType === 'INTERNSHIP') {
                    setFormData({ ...formData, stipend_amount: e.target.value });
                  } else {
                    setFormData({ ...formData, salary_range: e.target.value });
                  }
                }}
              />
            </div>

            {/* Openings */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Openings Count</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
              />
            </div>

            {/* Deadline */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                className="form-control"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Job Description & Responsibilities *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Outline the core day-to-day engineering duties, team environment, and expected impact..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* SECTION 2: REQUIRED SKILLS & BENCHMARK PROFICIENCIES */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--primary-600)" /> 2. Required Skills & Benchmark Scores
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Set mandatory competencies. Candidates are algorithmically scored based on how closely their verified assessments meet these targets.
                </p>
              </div>
            </div>

            {/* Add Skill Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--slate-50)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <select
                  className="form-control"
                  value={selectedSkillToAdd}
                  onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                >
                  <option value="">Select skill from platform catalog...</option>
                  {allSkills.map(sk => (
                    <option key={sk.id} value={sk.id}>{sk.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Min Target: <strong>{skillScoreToAdd}%</strong>
                </span>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={skillScoreToAdd}
                  onChange={(e) => setSkillScoreToAdd(parseInt(e.target.value, 10))}
                  style={{ width: '130px', cursor: 'pointer' }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!selectedSkillToAdd}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                <PlusCircle size={15} /> Add Benchmark
              </button>
            </div>

            {/* Selected Skills List */}
            {formData.requiredSkills.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--slate-400)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                No required skill benchmarks added yet. Select skills above to enable automated compatibility matching.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {formData.requiredSkills.map((sk) => (
                  <div
                    key={sk.skill_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge badge-primary">{sk.skill_name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        Target Benchmark: <strong>{sk.min_required_score}%</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        step="5"
                        value={sk.min_required_score}
                        onChange={(e) => handleScoreChange(sk.skill_id, e.target.value)}
                        style={{ width: '120px', cursor: 'pointer' }}
                        title="Adjust benchmark score"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk.skill_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger-500)',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                        title="Remove skill benchmark"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              {submitting ? (
                <>
                  <Sparkles size={18} className="animate-spin" /> Publishing Opportunity...
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> Publish Role & Activate Matching
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Tab 2: Manage Active Postings & 1-Click Candidate Matching */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            <span>Managing <strong>{allPosted.length}</strong> active opportunity postings</span>
          </div>

          {allPosted.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No active postings found. Switch to the <strong>Post New Opportunity</strong> tab to create one!
            </div>
          ) : (
            allPosted.map((opp) => (
              <div key={`${opp.type_badge}:${opp.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${opp.type_badge === 'INTERNSHIP' ? 'badge-primary' : 'badge-success'}`}>
                        {opp.type_badge}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {opp.title}
                      </h3>
                      <span className="badge badge-neutral">{opp.work_mode}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
                      <span><MapPin size={13} /> {opp.location}</span>
                      <span>Compensation: <strong>{opp.stipend_amount || opp.salary_range}</strong></span>
                      <span>Openings: <strong>{opp.openings}</strong></span>
                      <span><Clock size={13} /> Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-600)', lineHeight: 1 }}>
                      {opp.applicant_count || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Applications Received
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                  {opp.description}
                </p>

                {opp.skill_names && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>Required Skills:</span>
                    {opp.skill_names.split(', ').map((sk, idx) => (
                      <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => navigate(`/industry/candidates?type=${opp.type_badge}&id=${opp.id}`)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                  >
                    <Sparkles size={15} /> Find Matching Students for this Role
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

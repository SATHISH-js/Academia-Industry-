import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Award, Clock, CheckCircle2, AlertCircle, ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const SkillAssessmentPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments');
      if (res.data.success) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load assessments', err);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (id) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const res = await api.get(`/assessments/${id}`);
      if (res.data.success) {
        setActiveQuiz(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load quiz', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qid, oid]) => ({
          question_id: parseInt(qid, 10),
          option_id: parseInt(oid, 10)
        }))
      };

      const res = await api.post(`/assessments/${activeQuiz.id}/submit`, payload);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading assessments...</div>;
  }

  // If Quiz is active and not submitted yet
  if (activeQuiz && !result) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary">{activeQuiz.category}</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{activeQuiz.title}</h2>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveQuiz(null)}>
              Exit Quiz
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            <span><Clock size={16} style={{ verticalAlign: 'middle' }} /> {activeQuiz.duration_minutes} Mins</span>
            <span>Passing Score: {activeQuiz.passing_score}%</span>
            <span>Questions: {activeQuiz.questions?.length || 0}</span>
          </div>
        </div>

        {/* Questions List */}
        {activeQuiz.questions?.map((q, idx) => (
          <div key={q.id} className="card">
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>
              {idx + 1}. {q.question_text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {q.options?.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(q.id, opt.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--primary-600)' : 'var(--slate-300)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--primary-600)' : '#ffffff'
                    }}>
                      {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary-900)' : 'var(--slate-700)', fontWeight: isSelected ? 600 : 400 }}>
                      {opt.option_text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveQuiz(null)}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmitQuiz}
            disabled={submitting || Object.keys(answers).length === 0}
          >
            {submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    );
  }

  // If Quiz submitted and Result available
  if (result) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: result.passed ? 'var(--success-50)' : 'var(--warning-50)',
            color: result.passed ? 'var(--success-600)' : 'var(--warning-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <Award size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            {result.passed ? 'Assessment Passed!' : 'Assessment Completed'}
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your results have been automatically recorded in your verified skill profile.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)' }}>{result.score}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Proficiency</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '0.4rem' }}>{result.level}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: result.gapStatus === 'STRONG' ? 'var(--success-600)' : 'var(--warning-600)', marginTop: '0.4rem' }}>
                {result.gapStatus}
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => { setActiveQuiz(null); setResult(null); fetchAssessments(); }}>
            Back to Assessments Catalog
          </button>
        </div>
      </div>
    );
  }

  // Catalog View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* AI Verifier Promotion Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <ShieldCheck size={18} color="var(--primary-400)" />
            AI Certificate Verifier (New Feature from Hack 1)
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            Earn an Official Verified Skill Badge from any Course Certificate
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-300)', marginTop: '0.35rem' }}>
            Upload your course certificate image. Our multimodal AI will generate 20 customized aptitude questions and award an instant Verified Skill Badge when you score 90%+.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/student/certificate-verify')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--primary-900)',
              fontWeight: 800,
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <ShieldCheck size={18} color="var(--primary-700)" /> Start AI Verification
          </button>
          <button
            onClick={() => navigate('/student/feed')}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              padding: '0.75rem 1.1rem'
            }}
          >
            View Credential Feed
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>Curated Domain Assessments</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Standardized objective tests to benchmark your knowledge and discover potential skill gaps.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            Curated Tests
          </button>
          <button
            onClick={() => navigate('/student/certificate-verify')}
            className="btn"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-700)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            AI Certificate Verifier
          </button>
          <button
            onClick={() => navigate('/student/feed')}
            className="btn"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-700)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            Credential Feed
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {assessments.map(asmnt => (
          <div key={asmnt.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{asmnt.category}</span>
                <span className="badge badge-neutral">{asmnt.difficulty}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
                {asmnt.title}
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', margin: '0.75rem 0 1.25rem', lineHeight: 1.5 }}>
                {asmnt.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                <span><Clock size={14} style={{ verticalAlign: 'middle' }} /> {asmnt.duration_minutes} Mins</span>
                <span>Pass: {asmnt.passing_score}%</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => startAssessment(asmnt.id)}
            >
              Start Assessment <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Award, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  AlertTriangle 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    profileCompletion: 75,
    overallScore: 72,
    techScore: 78,
    softScore: 65,
    totalApplications: 4,
    shortlisted: 2,
    activeInternships: 1,
    certifications: 3
  });

  const skillData = [
    { skill: 'Python', score: 85, required: 80 },
    { skill: 'SQL', score: 75, required: 70 },
    { skill: 'React', score: 65, required: 75 },
    { skill: 'DSA', score: 50, required: 80 },
    { skill: 'Communication', score: 70, required: 70 },
    { skill: 'Teamwork', score: 85, required: 75 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
        color: '#ffffff',
        padding: '2rem',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
            🎓 Student Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p style={{ color: 'var(--primary-200)', maxWidth: '600px', fontSize: '0.95rem' }}>
            Track your verified skill assessments, address critical skill gaps, and explore algorithm-matched industry internships.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/assessment" className="btn" style={{ background: '#ffffff', color: 'var(--primary-800)' }}>
            <Award size={18} /> Take Assessment
          </Link>
          <Link to="/student/internships" className="btn btn-outline" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}>
            <Briefcase size={18} /> Find Opportunities
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Overall Readiness</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.overallScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Top 15% in Department
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Technical Skills</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.techScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Proficient in Python & SQL
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Applications Submitted</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.totalApplications}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {summary.shortlisted} Shortlisted for Interview
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Profile Completion</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.profileCompletion}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--warning-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Add Portfolio Projects
          </div>
        </div>
      </div>

      {/* Skill Profile vs Industry Demand Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Skill Level vs. Industry Demand
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Comparing your assessed proficiency against market benchmarks
              </p>
            </div>
            <Link to="/student/skill-gap" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              Detailed Gap Analysis
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-200)" />
                <XAxis dataKey="skill" tick={{ fill: 'var(--slate-600)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" name="Your Score" fill="var(--primary-600)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Industry Target" fill="var(--slate-300)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Alert & Recommendations */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                High Priority Skill Gap: DSA (Data Structures)
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Your current DSA score is <strong>50%</strong>, whereas 85% of relevant backend and software engineering internship postings require at least <strong>80%</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)' }}>1. Advanced Data Structures Workshop</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Provider: TechCorp Academy • Duration: 3 Weeks</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)' }}>2. Algorithmic Problem Solving Sprint</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Provider: Campus Hub • Duration: 4 Weeks</div>
              </div>
            </div>
          </div>

          <Link to="/student/learning" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.875rem' }}>
            View All Recommended Programs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

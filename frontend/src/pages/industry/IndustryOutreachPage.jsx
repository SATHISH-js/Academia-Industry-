import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Mail,
  Send,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search,
  ArrowRight
} from 'lucide-react';

export const IndustryOutreachPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/industry/messages');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load outreach messages', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = messages.filter(m =>
    m.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              ✉️ Candidate Outreach Management
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Direct Student Outreach & Messages
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Review all sent interview invitations, role inquiries, and job offers dispatched directly to high-matching student candidates.
            </p>
          </div>

          <Link to="/industry/candidates" className="btn btn-primary">
            <Sparkles size={16} /> Source & Contact New Candidates
          </Link>
        </div>
      </div>

      {/* Messages List Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Outreach Log ({messages.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              Chronological log of messages sent through the in-app recruitment communications layer
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by student or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading outreach messages...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Mail size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <h4 style={{ fontWeight: 700, color: 'var(--slate-800)' }}>No outreach messages found</h4>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Browse candidates and click "Contact Student" to dispatch an interview invitation!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className={`badge ${msg.message_type === 'INTERVIEW_INVITE' ? 'badge-primary' : msg.message_type === 'OFFER' ? 'badge-success' : 'badge-neutral'}`}>
                        {msg.message_type.replace('_', ' ')}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {msg.subject}
                      </h4>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                      Recipient: <strong>{msg.student_name}</strong> ({msg.student_email}) • {msg.student_dept}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    <Clock size={13} /> {new Date(msg.created_at).toLocaleString()}
                    <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>
                      {msg.status}
                    </span>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--slate-700)',
                  lineHeight: 1.5,
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  margin: 0
                }}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

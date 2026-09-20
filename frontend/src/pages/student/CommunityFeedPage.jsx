import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  BadgeCheck,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  Inbox,
  Sparkles,
  ExternalLink,
  Clock,
  Building2,
  GraduationCap,
  X
} from 'lucide-react';

export const CommunityFeedPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificate-verify/feed');
      if (res.data.success) {
        setPosts(res.data.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterVerified && !post.badge_awarded) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (post.student_name || '').toLowerCase().includes(q);
      const titleMatch = (post.course_title || '').toLowerCase().includes(q);
      const captionMatch = (post.caption || '').toLowerCase().includes(q);
      const instMatch = (post.institution_name || '').toLowerCase().includes(q);
      return nameMatch || titleMatch || captionMatch || instMatch;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Feed Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Sparkles size={18} color="var(--primary-400)" />
              Verified Talent Network
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
              Community Credential Feed
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-300)', marginTop: '0.4rem', maxWidth: '580px' }}>
              Real-time feed of course certificates verified through AI aptitude testing. Browse verified credentials from students across partnered universities.
            </p>
          </div>
          <button
            onClick={() => navigate('/student/certificate-verify')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--primary-900)',
              fontWeight: 800,
              padding: '0.85rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <ShieldCheck size={18} color="var(--primary-700)" /> Verify Your Certificate
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--slate-400)" />
          <input
            type="text"
            placeholder="Search by student name, course, or university…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              width: '100%',
              color: 'var(--slate-800)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterVerified(false)}
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xl)',
              backgroundColor: !filterVerified ? 'var(--primary-600)' : 'var(--slate-100)',
              color: !filterVerified ? '#ffffff' : 'var(--slate-600)'
            }}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => setFilterVerified(true)}
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: filterVerified ? 'var(--primary-600)' : 'var(--slate-100)',
              color: filterVerified ? '#ffffff' : 'var(--slate-600)'
            }}
          >
            <BadgeCheck size={14} /> Verified Badges Only
          </button>
        </div>
      </div>

      {/* Feed Posts List */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
          <p style={{ fontWeight: 600 }}>Loading verified credentials feed…</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Inbox size={44} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-800)' }}>
            No credentials found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
            {searchQuery || filterVerified
              ? 'No credential posts match your active search or filter criteria.'
              : 'Be the first student to complete an assessment and earn an official verified badge!'}
          </p>
          <button
            onClick={() => navigate('/student/certificate-verify')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShieldCheck size={18} /> Start Certificate Verification
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredPosts.map((post, idx) => (
            <div key={post.post_id || post.id || idx} className="card" style={{ padding: '1.75rem', transition: 'box-shadow var(--transition-fast)' }}>
              {/* Post Author Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {post.student_name ? post.student_name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                        {post.student_name || 'Student Candidate'}
                      </span>
                      {post.badge_awarded && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-xl)',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          <BadgeCheck size={14} color="var(--primary-600)" /> Verified Skill Badge
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      {post.institution_name && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <GraduationCap size={13} /> {post.institution_name}
                        </span>
                      )}
                      {post.department && (
                        <span>• {post.department}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} />
                  {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <p style={{ fontSize: '0.95rem', color: 'var(--slate-800)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  "{post.caption}"
                </p>
              )}

              {/* Verified Certificate Card Details */}
              <div style={{
                display: 'flex',
                gap: '1.25rem',
                backgroundColor: 'var(--slate-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Certificate Thumbnail with Click to Zoom */}
                {post.certificate_url && (
                  <div
                    onClick={() => setSelectedImage(post.certificate_url)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                      width: 130,
                      height: 95,
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img
                      src={post.certificate_url}
                      alt="Certificate thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.35)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <ExternalLink size={18} />
                    </div>
                  </div>
                )}

                {/* Performance Summary Pill */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', fontWeight: 700 }}>
                    Verified Exam Result
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.15rem' }}>
                    {post.course_title || 'Certified Course Assessment'}
                  </h4>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--slate-800)'
                    }}>
                      Score: <span style={{ color: post.score_percentage >= 90 ? 'var(--primary-600)' : 'var(--success-600)' }}>{post.score_percentage}%</span>
                    </div>

                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--slate-700)'
                    }}>
                      Correct: {post.correct_count} / {post.total_questions || 20}
                    </div>

                    {post.badge_awarded && (
                      <div style={{
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <BadgeCheck size={14} /> 90%+ Verified Badge
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '850px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 700
              }}
            >
              <X size={22} /> Close
            </button>
            <img
              src={selectedImage}
              alt="Full certificate"
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

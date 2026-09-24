import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  Building2,
  GraduationCap,
  Users,
  Award,
  ChevronRight,
  Eye,
  Settings,
  Globe
} from 'lucide-react';
import { RequestGuestLectureModal } from '../../components/academician/RequestGuestLectureModal';

export const AcademicianGuestLecturePage = () => {
  const [activeTab, setActiveTab] = useState('DIRECTORY'); // 'DIRECTORY' or 'MY_LECTURES'
  const [lectureSubTab, setLectureSubTab] = useState('INCOMING'); // 'INCOMING' or 'OUTGOING'

  // Open To Settings state
  const [isOpenToLectures, setIsOpenToLectures] = useState(false);
  const [lectureTopics, setLectureTopics] = useState('');
  const [lectureMode, setLectureMode] = useState('HYBRID');
  const [lectureBio, setLectureBio] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Directory state
  const [speakers, setSpeakers] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');

  // My Lectures state
  const [incomingLectures, setIncomingLectures] = useState([]);
  const [outgoingLectures, setOutgoingLectures] = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(false);

  // Modals & Feedback
  const [selectedSpeakerForRequest, setSelectedSpeakerForRequest] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [updatingLectureId, setUpdatingLectureId] = useState(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState({});

  useEffect(() => {
    fetchProfileSettings();
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (activeTab === 'MY_LECTURES') {
      fetchMyLectures();
    }
  }, [activeTab]);

  const fetchProfileSettings = async () => {
    try {
      const res = await api.get('/academician/profile');
      if (res.data.success) {
        const p = res.data.data;
        setIsOpenToLectures(Boolean(p.is_open_guest_lecture));
        setLectureTopics(p.guest_lecture_topics || p.specialization || '');
        setLectureMode(p.guest_lecture_mode || 'HYBRID');
        setLectureBio(p.guest_lecture_bio || p.research_interests || '');
      }
    } catch (err) {
      console.error('Failed to load guest lecture settings', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.put('/academician/guest-lectures/toggle-availability', {
        is_open_guest_lecture: isOpenToLectures,
        guest_lecture_topics: lectureTopics,
        guest_lecture_mode: lectureMode,
        guest_lecture_bio: lectureBio
      });

      if (res.data.success) {
        setToastMessage('Guest lecture availability preferences saved successfully!');
        setTimeout(() => setToastMessage(null), 4000);
        fetchDirectory(); // Refresh directory to reflect any updates
      }
    } catch (err) {
      console.error('Failed to save settings', err);
      setToastMessage('Failed to update guest lecture preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchDirectory = async () => {
    try {
      setLoadingDirectory(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (modeFilter !== 'ALL') params.append('mode', modeFilter);

      const res = await api.get(`/academician/guest-lectures/speakers?${params.toString()}`);
      if (res.data.success) {
        setSpeakers(res.data.data.speakers || []);
      }
    } catch (err) {
      console.error('Failed to load guest lecture directory', err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const fetchMyLectures = async () => {
    try {
      setLoadingLectures(true);
      const res = await api.get('/academician/guest-lectures');
      if (res.data.success) {
        setIncomingLectures(res.data.data.incoming || []);
        setOutgoingLectures(res.data.data.outgoing || []);
      }
    } catch (err) {
      console.error('Failed to load my guest lectures', err);
    } finally {
      setLoadingLectures(false);
    }
  };

  const handleUpdateLectureStatus = async (lectureId, status) => {
    try {
      setUpdatingLectureId(lectureId);
      const link = meetingLinkInput[lectureId] || null;
      const res = await api.put(`/academician/guest-lectures/${lectureId}/status`, {
        status,
        meeting_link: link
      });

      if (res.data.success) {
        setToastMessage(`Guest lecture updated to ${status}`);
        setTimeout(() => setToastMessage(null), 3500);
        fetchMyLectures();
      }
    } catch (err) {
      console.error('Failed to update lecture status', err);
    } finally {
      setUpdatingLectureId(null);
    }
  };

  const formatScheduledDate = (dateStr) => {
    if (!dateStr) return 'TBD (To Be Determined)';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          borderRadius: 'var(--radius-lg, 16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div>
          <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)', color: '#c7d2fe', marginBottom: '0.65rem' }}>
            🎙️ Inter-College Faculty Exchange Network
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            Guest Lecture Exchange & Speaker Discovery
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '680px', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Connect with distinguished faculty from across top technical colleges. Set your availability to deliver guest sessions, explore keynote topics, and request guest lectures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>Available Speakers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{speakers.length}</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>My Sessions</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{incomingLectures.length + outgoingLectures.length}</div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-50, #ecfdf5)',
            color: 'var(--success-700, #047857)',
            border: '1px solid var(--success-500, #10b981)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* "Open To" Profile Toggle & Settings Card (Requirement 2) */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          border: isOpenToLectures ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
          backgroundColor: isOpenToLectures ? 'var(--primary-50, #f8fafc)' : '#ffffff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: isOpenToLectures ? 'var(--primary-600)' : 'var(--slate-200)',
                color: isOpenToLectures ? '#ffffff' : 'var(--slate-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Globe size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                  Inter-College Guest Lecture Visibility
                </h3>
                <span
                  className={`badge ${isOpenToLectures ? 'badge-success' : 'badge-neutral'}`}
                  style={{ fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {isOpenToLectures ? '● OPEN TO GUEST LECTURES' : 'OFFLINE'}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', margin: '0.25rem 0 0 0' }}>
                Allow other colleges, department chairs, and faculty to discover your technical profile and invite you for keynote sessions or workshops.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              {isOpenToLectures ? 'Visibility: Enabled' : 'Visibility: Disabled'}
            </span>
            <input
              type="checkbox"
              checked={isOpenToLectures}
              onChange={(e) => setIsOpenToLectures(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
            />
          </label>
        </div>

        {/* Extended Settings Form when toggled on */}
        {isOpenToLectures && (
          <form onSubmit={handleSaveSettings} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem', display: 'block' }}>
                  Lecture Topics & Specialized Themes (comma-separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Microservices with Docker, Deep Learning Transformers, Quantum Computing"
                  value={lectureTopics}
                  onChange={(e) => setLectureTopics(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem', display: 'block' }}>
                  Preferred Delivery Mode
                </label>
                <select
                  className="form-control"
                  value={lectureMode}
                  onChange={(e) => setLectureMode(e.target.value)}
                  style={{ fontSize: '0.88rem', fontWeight: 600 }}
                >
                  <option value="HYBRID">Hybrid (Virtual or In-Person)</option>
                  <option value="VIRTUAL">Virtual Only (Webinar / Online)</option>
                  <option value="IN_PERSON">In-Person Only (On-Campus)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem', display: 'block' }}>
                Speaker Bio & Keynote Abstract
              </label>
              <textarea
                className="form-control"
                placeholder="Brief introduction of your academic and industry experience, consulting projects, and lecture highlights..."
                rows={2}
                value={lectureBio}
                onChange={(e) => setLectureBio(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={savingSettings}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', fontWeight: 700 }}
              >
                {savingSettings ? 'Saving...' : 'Save Availability & Topics'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--slate-200)', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          style={{
            padding: '0.75rem 0.5rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.98rem',
            fontWeight: activeTab === 'DIRECTORY' ? 800 : 600,
            color: activeTab === 'DIRECTORY' ? 'var(--primary-600)' : 'var(--slate-500)',
            borderBottom: activeTab === 'DIRECTORY' ? '3px solid var(--primary-600)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Search size={18} /> Inter-College Faculty Directory ({speakers.length})
        </button>

        <button
          onClick={() => setActiveTab('MY_LECTURES')}
          style={{
            padding: '0.75rem 0.5rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.98rem',
            fontWeight: activeTab === 'MY_LECTURES' ? 800 : 600,
            color: activeTab === 'MY_LECTURES' ? 'var(--primary-600)' : 'var(--slate-500)',
            borderBottom: activeTab === 'MY_LECTURES' ? '3px solid var(--primary-600)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Calendar size={18} /> My Guest Lectures & Schedule ({incomingLectures.length + outgoingLectures.length})
        </button>
      </div>

      {/* Tab 1: Faculty Directory */}
      {activeTab === 'DIRECTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search and Filters */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by topic, professor name, or college..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} color="var(--slate-500)" />
                  <select
                    className="form-control"
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    style={{ fontSize: '0.85rem', width: 'auto' }}
                  >
                    <option value="ALL">All Delivery Modes</option>
                    <option value="VIRTUAL">Virtual Only</option>
                    <option value="IN_PERSON">In-Person Only</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <button onClick={fetchDirectory} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  Filter
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Showing <strong>{speakers.length}</strong> available guest lecturers
              </div>
            </div>
          </div>

          {/* Speakers Cards Grid */}
          {loadingDirectory ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
              Connecting to inter-collegiate guest lecture network...
            </div>
          ) : speakers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-500)' }}>
              <Users size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                No guest lecturers match your filter
              </h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                Try broader keywords or reset the mode filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
              {speakers.map((spk) => {
                const topicTags = spk.guest_lecture_topics
                  ? spk.guest_lecture_topics.split(',').map((t) => t.trim())
                  : [];

                return (
                  <div
                    key={spk.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      border: '1px solid var(--slate-200)'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-600)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            {(spk.speaker_name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--slate-900)' }}>
                              {spk.speaker_name}
                            </h4>
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                              {spk.designation} • {spk.department}
                            </div>
                          </div>
                        </div>

                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {spk.guest_lecture_mode || 'VIRTUAL'}
                        </span>
                      </div>

                      {/* Institution info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--slate-700)', marginTop: '0.85rem' }}>
                        <Building2 size={14} color="var(--primary-600)" />
                        <strong>{spk.institution_name}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        <MapPin size={13} /> {spk.city || spk.institution_city}, {spk.state || spk.institution_state || 'India'}
                      </div>

                      {/* Bio */}
                      {spk.guest_lecture_bio && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0.75rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {spk.guest_lecture_bio}
                        </p>
                      )}

                      {/* Topics */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700, marginBottom: '0.35rem' }}>
                          Keynote Topics
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {topicTags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>
                              {tag}
                            </span>
                          ))}
                          {topicTags.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', alignSelf: 'center' }}>
                              +{topicTags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ borderTop: '1px solid var(--slate-100)', marginTop: '1.25rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        <strong>{spk.experience_years || 5}+</strong> yrs exp • <strong>{spk.publications_count || 10}</strong> papers
                      </div>

                      <button
                        onClick={() => setSelectedSpeakerForRequest(spk)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Send size={13} /> Invite Guest Speaker
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Guest Lectures (Incoming & Outgoing) */}
      {activeTab === 'MY_LECTURES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setLectureSubTab('INCOMING')}
              className={`btn ${lectureSubTab === 'INCOMING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1.15rem' }}
            >
              Incoming Invitations ({incomingLectures.length})
            </button>
            <button
              onClick={() => setLectureSubTab('OUTGOING')}
              className={`btn ${lectureSubTab === 'OUTGOING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1.15rem' }}
            >
              Outgoing Requests ({outgoingLectures.length})
            </button>
          </div>

          {loadingLectures ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
              Loading your guest lecture sessions...
            </div>
          ) : lectureSubTab === 'INCOMING' ? (
            // Incoming Invitations
            incomingLectures.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-500)' }}>
                <BookOpen size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  No incoming guest lecture invitations yet
                </h3>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  Keep your "Open to Guest Lectures" toggle active so other colleges can invite you.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingLectures.map((lec) => {
                  const isPending = lec.status === 'PENDING';
                  const isAccepted = lec.status === 'ACCEPTED' || lec.status === 'SCHEDULED';

                  return (
                    <div
                      key={lec.id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        borderLeft: isPending ? '4px solid #f59e0b' : isAccepted ? '4px solid #10b981' : '4px solid var(--slate-300)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                              {lec.delivery_mode}
                            </span>
                            <span
                              className={`badge ${
                                lec.status === 'ACCEPTED' || lec.status === 'SCHEDULED'
                                  ? 'badge-success'
                                  : lec.status === 'DECLINED'
                                  ? 'badge-danger'
                                  : 'badge-warning'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {lec.status}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--slate-900)' }}>
                            {lec.topic}
                          </h3>

                          <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span>Invited by <strong>{lec.requester_name}</strong></span>
                            <span>•</span>
                            <span>{lec.host_institution_name} ({lec.host_institution_city || 'Campus'})</span>
                            <span>•</span>
                            <span>Audience: {lec.target_audience}</span>
                          </div>
                        </div>

                        {/* Status buttons */}
                        {isPending && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleUpdateLectureStatus(lec.id, 'ACCEPTED')}
                              disabled={updatingLectureId === lec.id}
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.95rem' }}
                            >
                              Accept Invitation
                            </button>
                            <button
                              onClick={() => handleUpdateLectureStatus(lec.id, 'DECLINED')}
                              disabled={updatingLectureId === lec.id}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.95rem', color: 'var(--danger-700)' }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>

                      {lec.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: '0.75rem 0 0 0', lineHeight: 1.5 }}>
                          "{lec.description}"
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-100)', marginTop: '0.85rem', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={13} color="var(--primary-600)" />
                          <span>Proposed Date: <strong>{formatScheduledDate(lec.proposed_date)}</strong></span>
                        </div>

                        {lec.meeting_link && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Video size={13} color="var(--primary-600)" />
                            <a href={lec.meeting_link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                              Join Meeting
                            </a>
                          </div>
                        )}

                        {isAccepted && !lec.meeting_link && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Add meeting link (e.g. Google Meet URL)..."
                              value={meetingLinkInput[lec.id] || ''}
                              onChange={(e) =>
                                setMeetingLinkInput({ ...meetingLinkInput, [lec.id]: e.target.value })
                              }
                              style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem', width: '220px' }}
                            />
                            <button
                              onClick={() => handleUpdateLectureStatus(lec.id, 'ACCEPTED')}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                            >
                              Save Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Outgoing Requests
            outgoingLectures.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-500)' }}>
                <Send size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  No outgoing lecture requests yet
                </h3>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  Browse the faculty directory above to invite external experts to your department.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingLectures.map((lec) => (
                  <div key={lec.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-600)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {lec.delivery_mode}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                            {lec.status}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--slate-900)' }}>
                          {lec.topic}
                        </h3>

                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span>Speaker: <strong>{lec.speaker_name}</strong></span>
                          <span>•</span>
                          <span>{lec.speaker_institution_name} ({lec.speaker_institution_city || 'India'})</span>
                          <span>•</span>
                          <span>Target: {lec.target_audience}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-100)', marginTop: '0.85rem', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} color="var(--primary-600)" />
                        <span>Proposed Date: <strong>{formatScheduledDate(lec.proposed_date)}</strong></span>
                      </div>

                      {lec.meeting_link && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Video size={13} color="var(--primary-600)" />
                          <a href={lec.meeting_link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                            Join Session URL
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Request Guest Lecture Modal */}
      {selectedSpeakerForRequest && (
        <RequestGuestLectureModal
          speaker={selectedSpeakerForRequest}
          onClose={() => setSelectedSpeakerForRequest(null)}
          onRequestSent={(spk, top) => {
            setToastMessage(`Guest lecture request on "${top}" sent to ${spk.speaker_name}!`);
            setTimeout(() => setToastMessage(null), 4000);
            fetchMyLectures();
          }}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Award,
  Trophy,
  FileText,
  Flame,
  BookOpen,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  FileSpreadsheet,
  Medal,
  Clock,
  Layers,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Achievements', icon: Award },
  { id: 'PPT', label: 'Paper Presentations (PPT)', icon: FileSpreadsheet },
  { id: 'HACKATHON', label: 'Hackathons & Datathons', icon: Flame },
  { id: 'COMPETITION', label: 'Competitions & Contests', icon: Trophy },
  { id: 'WORKSHOP', label: 'Workshops & Bootcamps', icon: BookOpen },
  { id: 'SPORTS_CULTURAL', label: 'Sports & Cultural', icon: Medal }
];

const ACHIEVEMENT_TYPES = [
  { value: 'WINNER', label: '🏆 1st Prize / Winner', badgeClass: 'badge-warning', bg: 'var(--amber-50)', text: 'var(--amber-800)', border: 'var(--amber-300)' },
  { value: 'RUNNER_UP', label: '🥈 1st Runner Up (2nd Place)', badgeClass: 'badge-primary', bg: 'var(--primary-50)', text: 'var(--primary-800)', border: 'var(--primary-300)' },
  { value: 'THIRD_PLACE', label: '🥉 2nd Runner Up (3rd Place)', badgeClass: 'badge-neutral', bg: 'var(--slate-100)', text: 'var(--slate-800)', border: 'var(--slate-300)' },
  { value: 'FINALIST', label: '🎖️ Finalist / Top 10', badgeClass: 'badge-info', bg: 'var(--sky-50)', text: 'var(--sky-800)', border: 'var(--sky-300)' },
  { value: 'BEST_PAPER', label: '📜 Best Paper / Presentation', badgeClass: 'badge-success', bg: 'var(--emerald-50)', text: 'var(--emerald-800)', border: 'var(--emerald-300)' },
  { value: 'MERIT', label: '⭐ Certificate of Merit', badgeClass: 'badge-primary', bg: 'var(--indigo-50)', text: 'var(--indigo-800)', border: 'var(--indigo-300)' },
  { value: 'PARTICIPATION', label: '🤝 Certificate of Participation', badgeClass: 'badge-neutral', bg: 'var(--slate-50)', text: 'var(--slate-700)', border: 'var(--slate-200)' },
  { value: 'COMPLETED', label: '✅ Successfully Completed', badgeClass: 'badge-success', bg: 'var(--emerald-50)', text: 'var(--emerald-800)', border: 'var(--emerald-300)' }
];

const LEVELS = [
  { value: 'COLLEGE', label: 'College Level' },
  { value: 'INTER_COLLEGE', label: 'Inter-College Level' },
  { value: 'STATE', label: 'State Level' },
  { value: 'NATIONAL', label: 'National Level' },
  { value: 'INTERNATIONAL', label: 'International Level' }
];

export const StudentCertificationsPage = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pptCount: 0,
    hackathonCount: 0,
    competitionCount: 0,
    workshopCount: 0,
    winnerCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Certificate Preview Modal
  const [previewCert, setPreviewCert] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    credential_id: '',
    certificate_url: '',
    category: 'PPT',
    level: 'NATIONAL',
    achievement_type: 'WINNER',
    description: '',
    team_members: '',
    event_location: ''
  });

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/student/certifications');
      if (res.data.success) {
        setCertifications(res.data.data.certifications || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      console.error('[Fetch Certifications Error]', err);
      setError('Failed to load certifications. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openAddModal = () => {
    setEditingCert(null);
    setFormData({
      name: '',
      issuing_organization: '',
      issue_date: new Date().toISOString().split('T')[0],
      credential_id: '',
      certificate_url: '',
      category: selectedCategory !== 'ALL' ? selectedCategory : 'PPT',
      level: 'NATIONAL',
      achievement_type: 'WINNER',
      description: '',
      team_members: '',
      event_location: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cert) => {
    setEditingCert(cert);
    setFormData({
      name: cert.name || '',
      issuing_organization: cert.issuing_organization || '',
      issue_date: cert.issue_date ? cert.issue_date.split('T')[0] : '',
      credential_id: cert.credential_id || '',
      certificate_url: cert.certificate_url || '',
      category: cert.category || 'PPT',
      level: cert.level || 'NATIONAL',
      achievement_type: cert.achievement_type || 'PARTICIPATION',
      description: cert.description || '',
      team_members: cert.team_members || '',
      event_location: cert.event_location || ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this certification?')) return;
    try {
      await api.delete(`/student/certifications/${id}`);
      fetchCertifications();
    } catch (err) {
      alert('Failed to delete certification: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuing_organization.trim()) {
      setModalError('Please provide both the Event/Certificate Title and Issuing Body.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError('');
      if (editingCert) {
        await api.put(`/student/certifications/${editingCert.id}`, formData);
      } else {
        await api.post('/student/certifications', formData);
      }
      setIsModalOpen(false);
      fetchCertifications();
    } catch (err) {
      console.error('[Save Cert Error]', err);
      setModalError(err.response?.data?.message || 'Failed to save certification.');
    } finally {
      setModalLoading(false);
    }
  };

  // Filtered certifications
  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      // Category filter
      if (selectedCategory !== 'ALL' && cert.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'ALL' && cert.level !== selectedLevel) {
        return false;
      }
      // Achievement type filter
      if (selectedType !== 'ALL' && cert.achievement_type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (cert.name || '').toLowerCase().includes(query);
        const matchesOrg = (cert.issuing_organization || '').toLowerCase().includes(query);
        const matchesDesc = (cert.description || '').toLowerCase().includes(query);
        const matchesTeam = (cert.team_members || '').toLowerCase().includes(query);
        if (!matchesName && !matchesOrg && !matchesDesc && !matchesTeam) return false;
      }
      return true;
    });
  }, [certifications, selectedCategory, selectedLevel, selectedType, searchQuery]);

  const getAchievementMeta = (type) => {
    return ACHIEVEMENT_TYPES.find((a) => a.value === type) || {
      label: type || 'Participant',
      bg: 'var(--slate-100)',
      text: 'var(--slate-800)',
      border: 'var(--slate-300)'
    };
  };

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'PPT':
        return { label: 'Paper Presentation (PPT)', color: 'var(--indigo-600)', bg: 'var(--indigo-50)' };
      case 'HACKATHON':
        return { label: 'Hackathon', color: 'var(--purple-600)', bg: 'var(--purple-50)' };
      case 'COMPETITION':
        return { label: 'Coding / Contest', color: 'var(--amber-600)', bg: 'var(--amber-50)' };
      case 'WORKSHOP':
        return { label: 'Workshop', color: 'var(--emerald-600)', bg: 'var(--emerald-50)' };
      case 'SPORTS_CULTURAL':
        return { label: 'Sports & Cultural', color: 'var(--rose-600)', bg: 'var(--rose-50)' };
      default:
        return { label: cat || 'Achievement', color: 'var(--primary-600)', bg: 'var(--primary-50)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: 750 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              <Trophy size={16} color="#fbbf24" /> Extra-Curricular & Collegiate Credentials
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              Certifications & Extra-Curricular Achievements
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#c7d2fe', marginTop: '0.6rem', lineHeight: 1.5 }}>
              Showcase your credentials across Paper Presentations (PPT), Hackathons, Coding Competitions, Project Expos, and Technical Workshops. Verified credentials are automatically highlighted in your recruiter portfolio.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={openAddModal}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--primary-800)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              <Plus size={18} /> Add New Achievement
            </button>

            {/* Quick Link to Skill Certificate Verifier */}
            <button
              onClick={() => navigate('/student/certificate-verify')}
              className="btn"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}
            >
              <ShieldCheck size={16} /> Verify Technical Skills by Test <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Total Credentials</span>
            <Award size={20} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.4rem' }}>
            {stats.total || certifications.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Across all categories
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--indigo-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Paper Presentations (PPT)</span>
            <FileSpreadsheet size={20} color="var(--indigo-600)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.4rem' }}>
            {stats.pptCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Presented at symposiums
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Hackathons</span>
            <Flame size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.4rem' }}>
            {stats.hackathonCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Grand finale & sprints
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--amber-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Competitions Won / Placed</span>
            <Trophy size={20} color="var(--amber-500)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.4rem' }}>
            {stats.winnerCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Podium & prize finishes
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'var(--primary-600)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--slate-700)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: isActive ? 'var(--primary-600)' : 'var(--border-color)'
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
              {cat.id !== 'ALL' && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 999,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--slate-100)',
                  color: isActive ? '#ffffff' : 'var(--slate-600)'
                }}>
                  {cat.id === 'PPT' ? stats.pptCount : cat.id === 'HACKATHON' ? stats.hackathonCount : cat.id === 'COMPETITION' ? stats.competitionCount : cat.id === 'WORKSHOP' ? stats.workshopCount : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by event title, host college, or presentation topic…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Level:</span>
            <select
              className="form-input"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{ minWidth: 140, padding: '0.5rem 0.75rem' }}
            >
              <option value="ALL">All Levels</option>
              {LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Achievement:</span>
            <select
              className="form-input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ minWidth: 160, padding: '0.5rem 0.75rem' }}
            >
              <option value="ALL">All Achievements</option>
              {ACHIEVEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedLevel !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('ALL');
                setSelectedType('ALL');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Certifications Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <div style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Loading your certificates & achievements…</div>
        </div>
      ) : filteredCertifications.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Trophy size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-800)' }}>
            No achievements found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', maxWidth: 500, margin: '0.5rem auto 1.5rem' }}>
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No credentials matched your active search and category filters. Try resetting the filters.'
              : 'You haven’t added any extra-curricular certificates yet. Add your paper presentations, hackathons, or competitions to enrich your profile!'}
          </p>
          <button onClick={openAddModal} className="btn btn-primary" style={{ fontWeight: 700 }}>
            <Plus size={16} /> Add Your First Achievement
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredCertifications.map((cert) => {
            const achMeta = getAchievementMeta(cert.achievement_type);
            const catMeta = getCategoryMeta(cert.category);

            return (
              <div
                key={cert.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.4rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: achMeta.bg,
                      color: achMeta.text,
                      border: `1px solid ${achMeta.border}`
                    }}>
                      {achMeta.label}
                    </span>

                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: catMeta.bg,
                      color: catMeta.color
                    }}>
                      {catMeta.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                    {cert.name}
                  </h3>

                  {/* Host Organization */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                    <Building2 size={15} color="var(--slate-400)" />
                    <span style={{ fontWeight: 600 }}>{cert.issuing_organization}</span>
                  </div>

                  {/* Metadata Row: Level & Date */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.85rem' }}>
                    {cert.level && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--slate-100)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                        <Layers size={13} /> {cert.level.replace('_', ' ')}
                      </span>
                    )}
                    {cert.issue_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--slate-100)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                        <Calendar size={13} /> {new Date(cert.issue_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {cert.event_location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--slate-100)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                        <MapPin size={13} /> {cert.event_location}
                      </span>
                    )}
                  </div>

                  {/* Description / Summary */}
                  {cert.description && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      {cert.description}
                    </p>
                  )}

                  {/* Team Members */}
                  {cert.team_members && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.85rem' }}>
                      <Users size={14} color="var(--slate-400)" />
                      <span>{cert.team_members}</span>
                    </div>
                  )}

                  {/* Credential ID */}
                  {cert.credential_id && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                      Ref: {cert.credential_id}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ImageIcon size={14} /> View Certificate
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => openEditModal(cert)}
                      title="Edit Achievement"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-500)', padding: '0.3rem' }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      title="Delete Achievement"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger-500)', padding: '0.3rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 640,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {editingCert ? 'Edit Certification & Achievement' : 'Add New Certification / Achievement'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Record your achievements in paper presentations (PPT), hackathons, and competitions.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={22} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Event / Certificate Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. National Level PPT on Edge AI, Smart India Hackathon Finalist"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="PPT">Paper Presentation (PPT) / Symposium</option>
                    <option value="HACKATHON">Hackathon & Datathon</option>
                    <option value="COMPETITION">Coding Contest & Competition</option>
                    <option value="WORKSHOP">Workshop & Bootcamp</option>
                    <option value="SPORTS_CULTURAL">Sports, Cultural & Leadership</option>
                    <option value="TECHNICAL">Technical Certification</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Award / Position *</label>
                  <select
                    className="form-input"
                    value={formData.achievement_type}
                    onChange={(e) => setFormData({ ...formData, achievement_type: e.target.value })}
                  >
                    {ACHIEVEMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Event Level</label>
                  <select
                    className="form-input"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Issuing Body / Host College *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. IIT Madras, Anna University, IEEE"
                    value={formData.issuing_organization}
                    onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Event / Issue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Credential ID / Reg No (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SHAASTRA-PPT-2025-104"
                    value={formData.credential_id}
                    onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Certificate Document / Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/... or Google Drive public link"
                  value={formData.certificate_url}
                  onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Team Members & Role (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Team Lead (4 Members) or Co-presenter"
                    value={formData.team_members}
                    onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Location (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chennai, Pune, Online"
                    value={formData.event_location}
                    onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description / Abstract / Project Highlights</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Summarize the presentation topic, problem solved, prototype built, or jury feedback received…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                  style={{ fontWeight: 700 }}
                >
                  {modalLoading ? 'Saving…' : editingCert ? 'Update Achievement' : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CERTIFICATE MODAL */}
      {previewCert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 720,
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <button
              onClick={() => setPreviewCert(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--slate-400)'
              }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
                <Award size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {previewCert.name}
              </h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                Issued by <strong style={{ color: 'var(--slate-800)' }}>{previewCert.issuing_organization}</strong>
              </div>
            </div>

            {previewCert.certificate_url ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={previewCert.certificate_url}
                  alt={previewCert.name}
                  style={{
                    maxHeight: 360,
                    maxWidth: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div style={{
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px dashed var(--slate-300)',
                marginBottom: '1.5rem'
              }}>
                <Trophy size={48} color="var(--primary-500)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '1.1rem' }}>
                  {getAchievementMeta(previewCert.achievement_type).label}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                  {previewCert.level?.replace('_', ' ')} • {previewCert.category}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{previewCert.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Level</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{previewCert.level?.replace('_', ' ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Event Date</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {previewCert.issue_date ? new Date(previewCert.issue_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {previewCert.description && (
              <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                <strong>Abstract / Summary:</strong> {previewCert.description}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {previewCert.certificate_url && (
                <a
                  href={previewCert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
                >
                  <ExternalLink size={16} /> Open Document Link
                </a>
              )}
              <button
                onClick={() => setPreviewCert(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.88rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

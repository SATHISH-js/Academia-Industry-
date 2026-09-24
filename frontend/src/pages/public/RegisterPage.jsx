import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  GraduationCap, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  BookOpen, 
  Briefcase, 
  Compass, 
  Award, 
  Layers, 
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Key,
  MapPin,
  RefreshCw,
  UserCheck,
  Check
} from 'lucide-react';

const REGIONS = [
  'All Regions',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Telangana',
  'Kerala',
  'Rajasthan',
  'Gujarat',
  'West Bengal',
  'Uttar Pradesh',
  'Andhra Pradesh',
  'Other'
];

const POPULAR_STUDENT_ROLES = [
  'Full Stack Developer',
  'Data Scientist / ML Engineer',
  'Cloud DevOps Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Software Engineer (SWE)',
  'Cybersecurity Specialist',
  'Mobile App Developer'
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Other / Interdisciplinary'
];

const DEGREES = [
  'B.Tech / B.E',
  'BCA',
  'B.Sc (Computer Science / IT)',
  'M.Tech / M.E',
  'MCA',
  'M.Sc (Data Science / CS)',
  'Ph.D / Research'
];

const FACULTY_DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor & HOD',
  'Professor',
  'Dean / Director',
  'Research Scholar / Fellow',
  'Adjunct / Visiting Faculty'
];

const SKILL_OPTIONS = [
  { id: 5, name: 'React.js' },
  { id: 6, name: 'Node.js & Express' },
  { id: 1, name: 'Python' },
  { id: 2, name: 'Java' },
  { id: 3, name: 'SQL & Relational DBs' },
  { id: 4, name: 'Data Structures & Algorithms' },
  { id: 7, name: 'Cloud Computing (AWS/GCP)' },
  { id: 8, name: 'Docker & Containers' }
];

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'STUDENT';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: initialRole,
    // College & Region selection
    selectedRegion: 'All Regions',
    collegeSearch: '',
    institution_id: '',
    custom_college: '',
    isCustomCollege: false,
    // Residential address fields (Requirement 3: separate section)
    street_address: '',
    residential_city: '',
    residential_state: '',
    pincode: '',
    // Student specific fields
    target_role: 'Full Stack Developer',
    custom_role: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech / B.E',
    graduation_year: '2026',
    enrollment_number: '',
    selectedSkills: [5, 6, 3],
    // Academician specific fields
    designation: 'Assistant Professor',
    employee_id: '',
    qualification: 'Ph.D. in Engineering',
    experience_years: '5',
    specialization: 'Artificial Intelligence & Systems',
    // Industry specific fields
    company_name: '',
    industry_domain: 'Information Technology',
    // Institution specific fields
    institution_name: '',
    institution_type: 'COLLEGE',
    city: '',
    state: ''
  });

  // Password visibility & generator states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassNotice, setGeneratedPassNotice] = useState(false);
  const [showCollegeList, setShowCollegeList] = useState(false);

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

  // Generate compliant strong password
  const handleGeneratePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';

    let pass = '';
    pass += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pass += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle characters
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData(prev => ({
      ...prev,
      password: pass,
      confirmPassword: pass
    }));

    setShowPassword(true);
    setShowConfirmPassword(true);
    setGeneratedPassNotice(true);
    setTimeout(() => setGeneratedPassNotice(false), 5000);
  };

  const handleRoleSelect = (roleName) => {
    let defaultSkills = [5, 6, 3];
    if (roleName.includes('Data') || roleName.includes('ML')) {
      defaultSkills = [1, 3, 4];
    } else if (roleName.includes('Cloud') || roleName.includes('DevOps')) {
      defaultSkills = [7, 8, 1];
    } else if (roleName.includes('Software') || roleName.includes('SWE')) {
      defaultSkills = [4, 1, 2, 3];
    } else if (roleName.includes('Frontend')) {
      defaultSkills = [5, 3];
    } else if (roleName.includes('Backend')) {
      defaultSkills = [6, 3, 2];
    }

    setFormData(prev => ({
      ...prev,
      target_role: roleName,
      custom_role: roleName === 'Other' ? '' : prev.custom_role,
      selectedSkills: defaultSkills
    }));
  };

  const toggleSkill = (skillId) => {
    setFormData(prev => {
      const exists = prev.selectedSkills.includes(skillId);
      const nextSkills = exists 
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId];
      return { ...prev, selectedSkills: nextSkills };
    });
  };

  // Filtered colleges by region and search term
  const filteredColleges = institutions.filter(inst => {
    const matchesRegion = formData.selectedRegion === 'All Regions' || 
      (inst.state && inst.state.toLowerCase() === formData.selectedRegion.toLowerCase());
    const query = formData.collegeSearch.trim().toLowerCase();
    const matchesQuery = !query || 
      inst.institution_name.toLowerCase().includes(query) ||
      (inst.city && inst.city.toLowerCase().includes(query)) ||
      (inst.state && inst.state.toLowerCase().includes(query));
    return matchesRegion && matchesQuery;
  });

  const selectedCollegeObj = institutions.find(inst => String(inst.id) === String(formData.institution_id));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Password matching validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match. Please verify your confirm password.");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    setLoading(true);

    try {
      const effectiveTargetRole = formData.target_role === 'Other' && formData.custom_role.trim()
        ? formData.custom_role.trim()
        : formData.target_role;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        role: formData.role
      };

      if (formData.role === 'STUDENT') {
        payload.target_role = effectiveTargetRole;
        payload.institution_id = !formData.isCustomCollege && formData.institution_id ? parseInt(formData.institution_id, 10) : null;
        payload.department = formData.department;
        payload.degree = formData.degree;
        payload.graduation_year = parseInt(formData.graduation_year, 10);
        payload.enrollment_number = formData.enrollment_number.trim() || null;
        payload.skills = formData.selectedSkills;
        payload.address = formData.street_address.trim() || null;
        payload.city = formData.residential_city.trim() || null;
        payload.state = formData.residential_state.trim() || null;
        payload.pincode = formData.pincode.trim() || null;
      } else if (formData.role === 'ACADEMICIAN') {
        payload.institution_id = !formData.isCustomCollege && formData.institution_id ? parseInt(formData.institution_id, 10) : null;
        payload.department = formData.department;
        payload.designation = formData.designation;
        payload.employee_id = formData.employee_id.trim() || null;
        payload.qualification = formData.qualification.trim();
        payload.experience_years = parseInt(formData.experience_years, 10) || 5;
        payload.specialization = formData.specialization.trim();
        payload.address = formData.street_address.trim() || null;
        payload.city = formData.residential_city.trim() || null;
        payload.state = formData.residential_state.trim() || null;
        payload.pincode = formData.pincode.trim() || null;
      } else if (formData.role === 'INDUSTRY') {
        payload.company_name = formData.company_name.trim() || formData.name.trim();
        payload.industry_domain = formData.industry_domain;
      } else if (formData.role === 'INSTITUTION') {
        payload.institution_name = formData.institution_name.trim() || formData.name.trim();
        payload.institution_type = formData.institution_type;
        payload.city = formData.city.trim() || null;
        payload.state = formData.state.trim() || null;
      }

      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);

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

  // Helper component to render Separate Address Selection Section (Requirement 3)
  const renderAddressSection = () => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
        <MapPin size={17} color="var(--primary-600)" />
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
            Residential & Permanent Address Selection
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', display: 'block' }}>
            Enter your location address details for portal communication
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            Street Address / Locality
          </label>
          <input
            type="text"
            name="street_address"
            className="form-control"
            placeholder="e.g. 14, Gandhi Road, Anna Nagar"
            value={formData.street_address}
            onChange={handleChange}
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            City / District
          </label>
          <input
            type="text"
            name="residential_city"
            className="form-control"
            placeholder="e.g. Chennai, Bengaluru, Pune"
            value={formData.residential_city}
            onChange={handleChange}
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            State / Region
          </label>
          <select
            name="residential_state"
            className="form-control"
            value={formData.residential_state}
            onChange={handleChange}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">Select State / Region...</option>
            {REGIONS.filter(r => r !== 'All Regions').map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            PIN Code
          </label>
          <input
            type="text"
            name="pincode"
            className="form-control"
            placeholder="e.g. 600025"
            value={formData.pincode}
            onChange={handleChange}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>
    </div>
  );

  // Helper component to render Separate College Selection Section with tap-to-show search (Requirement 3)
  const renderCollegeSelector = () => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, margin: 0 }}>
          <Building2 size={16} color="var(--primary-600)" />
          <span>Affiliated College / University Selection</span>
        </label>
        {selectedCollegeObj && !formData.isCustomCollege && (
          <span className="badge badge-success" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Check size={12} /> Selected: {selectedCollegeObj.institution_name.slice(0, 24)}...
          </span>
        )}
      </div>

      {/* Region Selector & College Search Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)', display: 'block', marginBottom: '0.25rem' }}>
            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} /> Select Region / State:
          </label>
          <select
            name="selectedRegion"
            className="form-control"
            value={formData.selectedRegion}
            onChange={(e) => {
              handleChange(e);
              setShowCollegeList(true);
            }}
            style={{ fontSize: '0.85rem' }}
          >
            {REGIONS.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)', display: 'block', marginBottom: '0.25rem' }}>
            <Search size={12} style={{ display: 'inline', marginRight: 4 }} /> Search College by Name or City:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="collegeSearch"
              className="form-control"
              placeholder="Tap to search and view available colleges..."
              value={formData.collegeSearch}
              onFocus={() => setShowCollegeList(true)}
              onClick={() => setShowCollegeList(true)}
              onChange={(e) => {
                handleChange(e);
                setShowCollegeList(true);
              }}
              style={{ fontSize: '0.85rem' }}
            />
            {showCollegeList && (
              <button
                type="button"
                onClick={() => setShowCollegeList(false)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--slate-200)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.45rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--slate-700)'
                }}
              >
                Hide
              </button>
            )}
          </div>
        </div>
      </div>

      {/* College List Shown On Tap / Focus of Search Bar (Requirement 3) */}
      {(showCollegeList || formData.collegeSearch.trim().length > 0) && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#f8fafc',
          border: '1.5px solid var(--primary-300)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Available Colleges in {formData.selectedRegion} ({filteredColleges.length}):
            </div>
            <button
              type="button"
              onClick={() => setShowCollegeList(false)}
              style={{ background: 'none', border: 'none', color: 'var(--slate-500)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Close list
            </button>
          </div>

          <div style={{
            maxHeight: '190px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            padding: '0.4rem'
          }}>
            {filteredColleges.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--slate-500)', fontSize: '0.82rem' }}>
                No colleges found matching "{formData.collegeSearch}" in {formData.selectedRegion}.
              </div>
            ) : (
              filteredColleges.map(inst => {
                const isSelected = !formData.isCustomCollege && String(formData.institution_id) === String(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        institution_id: String(inst.id),
                        collegeSearch: inst.institution_name,
                        isCustomCollege: false
                      }));
                      setShowCollegeList(false);
                    }}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                      border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary-900)' : 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inst.institution_name}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                        <span>📍 {inst.city ? `${inst.city}, ${inst.state}` : (inst.state || 'India')}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{inst.institution_type}</span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle2 size={12} /> Selected
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Option for Other / Custom College */}
      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          id="customCollegeCheck"
          checked={formData.isCustomCollege}
          onChange={(e) => {
            const checked = e.target.checked;
            setFormData(prev => ({ ...prev, isCustomCollege: checked, institution_id: checked ? '' : prev.institution_id }));
            if (checked) setShowCollegeList(false);
          }}
        />
        <label htmlFor="customCollegeCheck" style={{ fontSize: '0.8rem', color: 'var(--slate-700)', cursor: 'pointer', fontWeight: 500 }}>
          My college is not listed above (Enter custom college name)
        </label>
      </div>

      {formData.isCustomCollege && (
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            name="custom_college"
            className="form-control"
            placeholder="Enter your college / university full name..."
            value={formData.custom_college}
            onChange={handleChange}
            style={{ fontSize: '0.85rem' }}
            required
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height) - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '720px', padding: '2.25rem', transition: 'max-width 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <GraduationCap size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Create an Account
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join the national portal for academia-industry collaboration & career development
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

        {generatedPassNotice && (
          <div style={{
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-300)',
            color: 'var(--primary-900)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <CheckCircle2 size={18} color="var(--primary-600)" />
            <span>
              <strong>Strong Password Generated:</strong> Both password fields have been filled and verified. You can click the eye icons to view it!
            </span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Ecosystem Role Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              1. Select Ecosystem Portal Role
            </label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              style={{ fontWeight: 600, borderColor: 'var(--primary-500)', backgroundColor: 'var(--primary-50)' }}
              required
            >
              <option value="STUDENT">🎓 Student (Personalized Roadmaps, Assessments, Internships, Placements)</option>
              <option value="ACADEMICIAN">🔬 Academician (Faculty Research, Industry Projects, Publications)</option>
              <option value="INDUSTRY">🏢 Industry (Talent Matching, Hiring Drives, MoU Partnerships)</option>
              <option value="INSTITUTION">🏛️ Institution (College Placement Governance, Departments, MoUs)</option>
            </select>
          </div>

          {/* Basic User Credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder={formData.role === 'STUDENT' ? 'e.g. Rahul Sharma' : formData.role === 'ACADEMICIAN' ? 'e.g. Dr. Suresh Nair' : 'e.g. Enterprise or Leader Name'}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address (Login ID) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. yourname@domain.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DYNAMIC SECTION FOR STUDENT */}
          {formData.role === 'STUDENT' && (
            <div style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              margin: '1.25rem 0',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Sparkles size={20} color="var(--primary-600)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                    Student Career & Academic Profile
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Fill necessary details: target role, affiliated college, department, degree, and batch
                  </div>
                </div>
              </div>

              {/* Target Role Selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <Compass size={16} color="var(--primary-600)" />
                  <span>Desired Target Career Role</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  {POPULAR_STUDENT_ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: formData.target_role === r ? 'var(--primary-600)' : 'var(--slate-300)',
                        backgroundColor: formData.target_role === r ? 'var(--primary-600)' : '#ffffff',
                        color: formData.target_role === r ? '#ffffff' : 'var(--slate-700)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('Other')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: formData.target_role === 'Other' ? 'var(--primary-600)' : 'var(--slate-300)',
                      backgroundColor: formData.target_role === 'Other' ? 'var(--primary-600)' : '#ffffff',
                      color: formData.target_role === 'Other' ? '#ffffff' : 'var(--slate-700)',
                      cursor: 'pointer'
                    }}
                  >
                    Custom Role...
                  </button>
                </div>

                {formData.target_role === 'Other' && (
                  <input
                    type="text"
                    name="custom_role"
                    className="form-control"
                    placeholder="Enter custom career aspiration (e.g. Embedded Firmware Engineer)"
                    value={formData.custom_role}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              {/* College Selection (Requirement 3) */}
              {renderCollegeSelector()}

              {/* Separate Address Selection (Requirement 3) */}
              {renderAddressSection()}

              {/* Department & Degree */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={16} color="var(--primary-600)" />
                    <span>Department / Branch <span style={{ color: 'red' }}>*</span></span>
                  </label>
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Degree Program <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="degree"
                    className="form-control"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                  >
                    {DEGREES.map(deg => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grad Year & Roll Number */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Graduation Batch</label>
                  <select
                    name="graduation_year"
                    className="form-control"
                    value={formData.graduation_year}
                    onChange={handleChange}
                    required
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029].map(yr => (
                      <option key={yr} value={yr}>{yr} {yr === 2026 ? '(Expected)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Roll / Register Number</label>
                  <input
                    type="text"
                    name="enrollment_number"
                    className="form-control"
                    placeholder="e.g. 2022CS1049"
                    value={formData.enrollment_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Initial Skill Interests */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <Award size={15} color="var(--primary-600)" />
                  <span>Select Active Skills / Technical Interests:</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {SKILL_OPTIONS.map(skill => {
                    const isChecked = formData.selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          border: isChecked ? '1px solid var(--primary-600)' : '1px solid var(--border-color)',
                          backgroundColor: isChecked ? 'var(--primary-50)' : '#ffffff',
                          color: isChecked ? 'var(--primary-700)' : 'var(--slate-600)',
                          cursor: 'pointer'
                        }}
                      >
                        {isChecked && <CheckCircle2 size={13} color="var(--primary-600)" />}
                        <span>{skill.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC SECTION FOR ACADEMICIAN (Requirement 5) */}
          {formData.role === 'ACADEMICIAN' && (
            <div style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              margin: '1.25rem 0',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <GraduationCap size={20} color="var(--primary-600)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                    Academician & Faculty Profile
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Select your college/institution, department, faculty designation, and research area
                  </div>
                </div>
              </div>

              {/* College Selection for Academician */}
              {renderCollegeSelector()}

              {/* Separate Address Selection for Academician */}
              {renderAddressSection()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department / School <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Faculty Designation <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="designation"
                    className="form-control"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  >
                    {FACULTY_DESIGNATIONS.map(desig => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Highest Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    className="form-control"
                    placeholder="e.g. Ph.D. in Computer Science"
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    name="experience_years"
                    className="form-control"
                    value={formData.experience_years}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Employee / Faculty ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    className="form-control"
                    placeholder="e.g. FAC-2024-019"
                    value={formData.employee_id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Research Specialization / Focus Area</label>
                <input
                  type="text"
                  name="specialization"
                  className="form-control"
                  placeholder="e.g. Deep Learning, Distributed Systems, IoT, Cloud Computing"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* DYNAMIC SECTION FOR INDUSTRY */}
          {formData.role === 'INDUSTRY' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              margin: '1.25rem 0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Company / Enterprise Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="company_name"
                    className="form-control"
                    placeholder="e.g. TechCorp Solutions Ltd"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Industry Domain / Sector</label>
                  <select
                    name="industry_domain"
                    className="form-control"
                    value={formData.industry_domain}
                    onChange={handleChange}
                  >
                    <option value="Information Technology">Information Technology & Software</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & Data</option>
                    <option value="Cloud & DevOps">Cloud & Infrastructure</option>
                    <option value="FinTech">FinTech & Financial Services</option>
                    <option value="Healthcare">Healthcare & BioTech</option>
                    <option value="Manufacturing & Auto">Manufacturing & Automotive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC SECTION FOR INSTITUTION */}
          {formData.role === 'INSTITUTION' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              margin: '1.25rem 0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Institution / College Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="institution_name"
                    className="form-control"
                    placeholder="e.g. National Institute of Technology"
                    value={formData.institution_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Institution Type</label>
                  <select
                    name="institution_type"
                    className="form-control"
                    value={formData.institution_type}
                    onChange={handleChange}
                  >
                    <option value="UNIVERSITY">University</option>
                    <option value="AUTONOMOUS">Autonomous College</option>
                    <option value="COLLEGE">Affiliated College</option>
                    <option value="INSTITUTE">Institute of National Importance</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Region / State</label>
                  <select
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    {REGIONS.filter(r => r !== 'All Regions').map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Password & Confirm Password with Eye Toggle & Generator (Requirements 2 & 3) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            margin: '1.25rem 0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                Security Credentials
              </span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-700)', borderColor: 'var(--primary-300)' }}
              >
                <Sparkles size={13} color="var(--primary-600)" /> Generate Strong Password
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Password field with eye toggle */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Password <span style={{ color: 'red' }}>*</span></span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-500)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.2rem'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field with eye toggle */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Confirm Password <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      paddingRight: '2.5rem',
                      borderColor: formData.confirmPassword
                        ? (formData.password === formData.confirmPassword ? '#22c55e' : '#ef4444')
                        : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-500)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.2rem'
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Password Matching Notification (Requirement 2) */}
            <div style={{ marginTop: '0.6rem' }}>
              {formData.confirmPassword.length > 0 && (
                formData.password === formData.confirmPassword ? (
                  <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> Passwords match
                  </div>
                ) : (
                  <div style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <AlertCircle size={15} /> Passwords do not match
                  </div>
                )
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.4rem', lineHeight: 1.4 }}>
              Must be at least 8 characters long, containing uppercase, lowercase, and numeric characters.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem' }}
            disabled={loading || (formData.confirmPassword && formData.password !== formData.confirmPassword)}
          >
            {loading ? (
              <>
                <Sparkles size={18} className="animate-spin" /> Creating Account & Profile...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register & Continue to Dashboard
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

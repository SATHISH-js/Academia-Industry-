import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock3, GraduationCap } from 'lucide-react';
import api from '../../services/api';

const CourseCard = ({ course, enrolled = false }) => <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
  {course.thumbnail_url ? <img src={course.thumbnail_url} alt="" style={{ width: '100%', height: 165, objectFit: 'cover' }} /> : <div aria-hidden="true" style={{ height: 165, display: 'grid', placeItems: 'center', color: 'white', background: 'linear-gradient(135deg, var(--primary-700), var(--primary-500))' }}><BookOpen size={42} /></div>}
  <div style={{ padding: '1.2rem', display: 'flex', flex: 1, flexDirection: 'column', gap: '.7rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', alignItems: 'center' }}><span className="badge badge-primary">{course.subject || 'General'}</span><span className="badge">{enrolled ? course.progress_status?.replace('_', ' ') : course.status}</span></div>
    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{course.title}</h2>
    <p style={{ color: 'var(--slate-600)', margin: 0, flex: 1 }}>{course.description || 'Course description coming soon.'}</p>
    <div style={{ fontSize: '.9rem', color: 'var(--slate-600)' }}><GraduationCap size={15} style={{ verticalAlign: 'middle' }} /> {course.trainer || 'Training team'} · Published {course.published_date || 'date unavailable'}</div>
    {enrolled && <div><progress value={course.progress_percentage || 0} max="100" style={{ width: '100%' }} />{course.progress_percentage || 0}% complete</div>}
    <Link className="btn btn-primary" to={`/trainee/courses/${course.id}`}>{enrolled ? 'Continue learning' : 'View course'}</Link>
  </div>
</article>;

export const TraineeCoursesPage = ({ myCourses = false }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    api.get(myCourses ? '/trainee/courses/my' : '/trainee/courses')
      .then(res => setCourses(res.data.data || []))
      .catch(err => setError(err.response?.data?.error || 'Could not load courses.'))
      .finally(() => setLoading(false));
  }, [myCourses]);

  return <div className="container" style={{ maxWidth: 1180, padding: '2rem 1rem' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.25rem' }}>
      <div><span className="badge badge-primary">TRAINEE LEARNING</span><h1 style={{ margin: '.55rem 0 .2rem' }}>{myCourses ? 'My Courses' : 'Course catalog'}</h1><p style={{ margin: 0, color: 'var(--slate-600)' }}>{myCourses ? 'Your enrollments and learning progress.' : 'Explore published courses and start learning.'}</p></div>
      <nav style={{ display: 'flex', gap: '.5rem' }}><Link className={`btn ${myCourses ? 'btn-secondary' : 'btn-primary'}`} to="/trainee/courses">Browse courses</Link><Link className={`btn ${myCourses ? 'btn-primary' : 'btn-secondary'}`} to="/trainee/courses/my">My Courses</Link></nav>
    </header>
    {error && <div role="alert" className="badge badge-danger" style={{ padding: '.8rem', marginBottom: '1rem' }}>{error}</div>}
    {loading ? <p>Loading courses…</p> : courses.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1rem' }}>{courses.map(course => <CourseCard key={course.id} course={course} enrolled={myCourses} />)}</div> : <div className="card" style={{ padding: '1.5rem' }}>{myCourses ? 'You have not enrolled in any courses yet.' : 'No published courses are available right now.'}</div>}
  </div>;
};

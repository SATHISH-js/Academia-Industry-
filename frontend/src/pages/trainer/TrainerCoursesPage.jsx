import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const TrainerCoursesPage = () => {
  const [courses, setCourses] = useState([]); const [error, setError] = useState('');
  const load = useCallback(() => api.get('/trainer/courses').then(r => setCourses(r.data.data || [])).catch(e => setError(e.response?.data?.error || 'Could not load courses.')), []);
  useEffect(() => { load(); }, [load]);
  const transition = async (id, action) => { try { setError(''); await api.patch(`/trainer/courses/${id}/${action}`); await load(); } catch (e) { setError(e.response?.data?.error || `Could not ${action} course.`); } };
  return <main className="container" style={{ maxWidth: 1150, padding: '2rem 1rem' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}><div><span className="badge badge-primary">TRAINER WORKSPACE</span><h1 style={{ margin: '.5rem 0' }}>Course management</h1><p>Create and manage your courses.</p></div><Link className="btn btn-primary" to="/trainer/courses/new">Create course</Link></header>
    {error && <div role="alert" className="badge badge-danger" style={{ padding: '.7rem' }}>{error}</div>}
    {courses.length ? <div style={{ display: 'grid', gap: '.9rem' }}>{courses.map(course => <article className="card" key={course.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}><div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>{course.thumbnail_url && <img src={course.thumbnail_url} alt="" style={{ width: 100, height: 65, objectFit: 'cover', borderRadius: 6 }} />}<div><span className="badge badge-primary">{course.status}</span><h2 style={{ margin: '.4rem 0', fontSize: '1.1rem' }}>{course.title}</h2><div>{course.subject}</div></div></div><div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}><Link className="btn btn-secondary" to={`/trainer/courses/${course.id}/edit`}>Edit</Link>{course.status === 'DRAFT' && <button className="btn btn-primary" onClick={() => transition(course.id, 'publish')}>Publish</button>}{course.status === 'PUBLISHED' && <button className="btn btn-secondary" onClick={() => transition(course.id, 'unpublish')}>Unpublish</button>}{course.status !== 'ARCHIVED' && <button className="btn btn-secondary" onClick={() => transition(course.id, 'archive')}>Archive</button>}</div></article>)}</div> : <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>No courses yet. Create your first draft.</div>}
  </main>;
};

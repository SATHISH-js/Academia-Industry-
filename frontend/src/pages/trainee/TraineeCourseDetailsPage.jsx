import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, GraduationCap } from 'lucide-react';
import api from '../../services/api';

export const TraineeCourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const res = await api.get(`/trainee/courses/${courseId}`);
    setCourse(res.data.data);
  }, [courseId]);
  useEffect(() => { load().catch(err => setError(err.response?.data?.error || 'Could not load course.')).finally(() => setLoading(false)); }, [load]);

  const perform = async action => {
    setError(''); setNotice(''); setBusy(true);
    try { const result = await action(); if (result) setNotice(result); await load(); }
    catch (err) { setError(err.response?.data?.error || 'Could not update this course.'); }
    finally { setBusy(false); }
  };
  const openResource = async resource => {
    await perform(async () => { await api.post(`/trainee/courses/${courseId}/resources/${resource.id}/open`); setActiveResource(resource); return 'Resource opened. Progress is now in progress.'; });
  };
  const completeResource = async () => {
    if (!activeResource) return;
    await perform(async () => {
      const res = await api.post(`/trainee/courses/${courseId}/resources/${activeResource.id}/complete`);
      return `Progress saved: ${res.data.data.progress_percentage}% · ${res.data.data.status.replace('_', ' ')}.`;
    });
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading course…</div>;
  if (!course) return <div className="container" style={{ padding: '2rem' }} role="alert">{error || 'Course not found.'}<p><Link to="/trainee/courses">Back to catalog</Link></p></div>;
  const enrolled = Boolean(course.enrollment);
  const progress = course.enrollment?.progress_percentage || 0;
  return <div className="container" style={{ maxWidth: 1000, padding: '2rem 1rem', display: 'grid', gap: '1rem' }}>
    <Link to={enrolled ? '/trainee/courses/my' : '/trainee/courses'}><ArrowLeft size={16} /> {enrolled ? 'My Courses' : 'Course catalog'}</Link>
    <header className="card" style={{ overflow: 'hidden' }}>
      {course.thumbnail_url && <img src={course.thumbnail_url} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />}
      <div style={{ padding: '1.5rem' }}><span className="badge badge-primary">{course.subject}</span><h1 style={{ margin: '.6rem 0' }}>{course.title}</h1><p>{course.description || 'Course description coming soon.'}</p><div style={{ color: 'var(--slate-600)' }}><GraduationCap size={16} /> Trainer: {course.trainer || 'Training team'} · Published {course.published_date}</div>
        {!enrolled ? <button className="btn btn-primary" disabled={busy} onClick={() => perform(async () => { await api.post(`/trainee/courses/${courseId}/enroll`); return 'You are enrolled. Your course is ready.'; })}>Enroll in course</button> : <div style={{ marginTop: '1rem' }}><strong>{course.enrollment.progress_status.replaceAll('_', ' ')}</strong> · Enrolled {new Date(course.enrollment.enrolled_at).toLocaleString()}<progress value={progress} max="100" style={{ width: '100%', display: 'block', marginTop: '.5rem' }} />{progress}% complete</div>}
      </div>
    </header>
    {error && <div role="alert" className="badge badge-danger" style={{ padding: '.8rem' }}>{error}</div>}{notice && <div role="status" className="badge badge-primary" style={{ padding: '.8rem' }}>{notice}</div>}
    <section className="card" style={{ padding: '1.4rem' }}><h2 style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginTop: 0 }}><BookOpen size={20} /> Course resources</h2>
      {course.resources.length ? course.resources.map(resource => <article key={resource.id} style={{ borderTop: '1px solid var(--border-color)', padding: '.9rem 0', display: 'flex', justifyContent: 'space-between', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div><strong>{resource.title}</strong><p style={{ margin: '.25rem 0', color: 'var(--slate-600)' }}>{resource.description}</p>{resource.completed && <span className="badge badge-primary"><CheckCircle2 size={14} /> Completed</span>}</div>
        {enrolled && <button className="btn btn-secondary" disabled={busy || resource.completed} onClick={() => openResource(resource)}>{resource.completed ? 'Completed' : 'Open resource'}</button>}
      </article>) : <p>Course materials are not available yet.</p>}
    </section>
    {activeResource && enrolled && <section className="card" style={{ padding: '1.4rem' }}><h2>{activeResource.title}</h2><p>{activeResource.description || 'This is a starter resource placeholder. Course materials will be added in a later update.'}</p>{activeResource.resource_url && <p><a href={activeResource.resource_url} target="_blank" rel="noreferrer">Open learning material</a></p>}<button className="btn btn-primary" disabled={busy || course.enrollment.progress_status === 'COMPLETED'} onClick={completeResource}><Circle size={16} /> Mark resource complete</button></section>}
  </div>;
};

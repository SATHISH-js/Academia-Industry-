import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const AccountHome = () => {
  const { user } = useAuth();
  return <section className="container" style={{ padding: '2rem 0' }}>
    <span className="badge badge-primary">{user?.role}</span>
    <h1 style={{ margin: '0.75rem 0 0.25rem' }}>Account</h1>
    <p>Signed in as {user?.name} ({user?.email}).</p>
    <p>Account status: <strong>{user?.account_status}</strong></p>
    {user?.role === 'TRAINEE' && <Link className="btn btn-primary" to="/trainee/profile">Open professional profile</Link>}
    {user?.role === 'TRAINER' && <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}><Link className="btn btn-primary" to="/trainer/profile">Edit trainer profile</Link><Link className="btn btn-secondary" to="/trainer/courses">Manage courses</Link></div>}
  </section>;
};

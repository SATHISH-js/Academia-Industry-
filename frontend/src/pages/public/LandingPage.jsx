import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => (
  <main className="container" style={{ maxWidth: 960, padding: '4rem 1rem' }}>
    <section className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <span className="badge badge-primary">Secure account access</span>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '1rem 0' }}>Training and Competency Platform</h1>
      <p style={{ maxWidth: 680, margin: '0 auto 1.5rem', color: 'var(--slate-600)' }}>
        Sign in with a trainee, trainer, or administrator account. Trainer accounts require administrator approval before they can access the platform.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/register" className="btn btn-primary">Create an account</Link>
        <Link to="/login" className="btn btn-secondary">Sign in</Link>
      </div>
    </section>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
      <article className="card" style={{ padding: '1.25rem' }}><h2>Trainee</h2><p>Create an account to sign in.</p></article>
      <article className="card" style={{ padding: '1.25rem' }}><h2>Trainer</h2><p>Request an account. An administrator must approve it before login is enabled.</p></article>
      <article className="card" style={{ padding: '1.25rem' }}><h2>Administrator</h2><p>Accounts are provisioned by an operator and cannot be self-registered.</p></article>
    </section>
  </main>
);

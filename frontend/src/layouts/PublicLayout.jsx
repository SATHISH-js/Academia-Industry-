import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export const PublicLayout = () => {
  return (
    <div className="public-layout-container">
      <Navbar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--slate-500)',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} Academia–Industry Collaboration Portal. Bridging Education & Enterprise.</p>
        </div>
      </footer>
    </div>
  );
};

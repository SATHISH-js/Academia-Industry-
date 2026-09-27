import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

export const DashboardLayout = () => {
  // Start open on desktop (>= 1024px), closed on mobile/tablet (< 1024px)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Track reopen animation triggering
  const [isReopening, setIsReopening] = useState(false);

  // Toggle handler
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        // Trigger entrance animations when reopening
        setIsReopening(true);
        setTimeout(() => setIsReopening(false), 450);
      }
      return nextState;
    });
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Keyboard shortcut listener: Escape to close on mobile, Ctrl+B / Cmd+B to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        handleCloseSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, handleCloseSidebar, handleToggleSidebar]);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-is-open' : 'sidebar-is-closed'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar} 
        isReopening={isReopening}
      />
      <div className="dashboard-main">
        <Navbar 
          onToggleSidebar={handleToggleSidebar} 
          isSidebarOpen={sidebarOpen}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

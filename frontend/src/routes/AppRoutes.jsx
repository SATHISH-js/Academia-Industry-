import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Dashboards
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { AcademicianDashboard } from '../pages/academician/AcademicianDashboard';
import { IndustryDashboard } from '../pages/industry/IndustryDashboard';
import { InstitutionDashboard } from '../pages/institution/InstitutionDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
        </Route>
      </Route>

      {/* Academician Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ACADEMICIAN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
          <Route path="/academician/*" element={<AcademicianDashboard />} />
        </Route>
      </Route>

      {/* Industry Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['INDUSTRY']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/industry/dashboard" element={<IndustryDashboard />} />
          <Route path="/industry/*" element={<IndustryDashboard />} />
        </Route>
      </Route>

      {/* Institution Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['INSTITUTION']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/*" element={<InstitutionDashboard />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

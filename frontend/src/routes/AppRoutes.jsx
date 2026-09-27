import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { TrainingDashboard } from '../pages/training/TrainingDashboard';
import { SettingsPage } from '../pages/common/SettingsPage';

const ROLE_HOME = { TRAINEE: '/trainee/dashboard', TRAINER: '/trainer/dashboard', ADMIN: '/admin/dashboard' };

export const AppRoutes = () => <Routes>
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Route>
  {Object.entries(ROLE_HOME).map(([role, path]) => <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
    <Route element={<DashboardLayout />}>
      <Route path={path} element={<TrainingDashboard role={role} />} />
      {role === 'TRAINEE' && <Route path="/trainee/programs" element={<TrainingDashboard role={role} />} />}
      {role === 'TRAINER' && <Route path="/trainer/programs" element={<TrainingDashboard role={role} />} />}
      {role === 'ADMIN' && <Route path="/admin/users" element={<TrainingDashboard role={role} />} />}
    </Route>
  </Route>)}
  <Route element={<ProtectedRoute allowedRoles={['TRAINEE','TRAINER','ADMIN']} />}>
    <Route element={<DashboardLayout />}><Route path="/settings" element={<SettingsPage />} /></Route>
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>;

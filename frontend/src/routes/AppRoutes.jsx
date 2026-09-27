import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { AccountHome } from '../pages/auth/AccountHome';
import { AdminUsersPage } from '../pages/auth/AdminUsersPage';
import { TraineeProfilePage } from '../pages/trainee/TraineeProfilePage';
import { EditTraineeProfilePage } from '../pages/trainee/EditTraineeProfilePage';
import { TraineeCoursesPage } from '../pages/trainee/TraineeCoursesPage';
import { TraineeCourseDetailsPage } from '../pages/trainee/TraineeCourseDetailsPage';
import { TrainerProfilePage } from '../pages/trainer/TrainerProfilePage';
import { TrainerCoursesPage } from '../pages/trainer/TrainerCoursesPage';
import { TrainerCourseFormPage } from '../pages/trainer/TrainerCourseFormPage';
import { SettingsPage } from '../pages/common/SettingsPage';

export const AppRoutes = () => <Routes>
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Route>
  <Route element={<ProtectedRoute allowedRoles={['TRAINEE']} />}>
    <Route element={<DashboardLayout />}>
      <Route path="/trainee/dashboard" element={<AccountHome />} />
      <Route path="/trainee/profile" element={<TraineeProfilePage />} />
      <Route path="/trainee/profile/edit" element={<EditTraineeProfilePage />} />
      <Route path="/trainee/courses" element={<TraineeCoursesPage />} />
      <Route path="/trainee/courses/my" element={<TraineeCoursesPage myCourses />} />
      <Route path="/trainee/courses/:courseId" element={<TraineeCourseDetailsPage />} />
    </Route>
  </Route>
  <Route element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
    <Route element={<DashboardLayout />}>
      <Route path="/trainer/dashboard" element={<AccountHome />} />
      <Route path="/trainer/profile" element={<TrainerProfilePage />} />
      <Route path="/trainer/courses" element={<TrainerCoursesPage />} />
      <Route path="/trainer/courses/new" element={<TrainerCourseFormPage />} />
      <Route path="/trainer/courses/:courseId/edit" element={<TrainerCourseFormPage />} />
    </Route>
  </Route>
  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
    <Route element={<DashboardLayout />}>
      <Route path="/admin/dashboard" element={<AdminUsersPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
    </Route>
  </Route>
  <Route element={<ProtectedRoute allowedRoles={['TRAINEE','TRAINER','ADMIN']} />}>
    <Route element={<DashboardLayout />}><Route path="/settings" element={<SettingsPage />} /></Route>
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>;

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
import { SkillAssessmentPage } from '../pages/student/SkillAssessmentPage';
import { StudentInternshipsPage } from '../pages/student/StudentInternshipsPage';
import { StudentApplicationsPage } from '../pages/student/StudentApplicationsPage';
import { DigitalPortfolioPage } from '../pages/student/DigitalPortfolioPage';
import { StudentRoadmapPage } from '../pages/student/StudentRoadmapPage';
import { MockInterviewPage } from '../pages/student/MockInterviewPage';
import { ResumeBuilderPage } from '../pages/student/ResumeBuilderPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

import { AcademicianDashboard } from '../pages/academician/AcademicianDashboard';
import { AcademicianOpportunitiesPage } from '../pages/academician/AcademicianOpportunitiesPage';

import { IndustryDashboard } from '../pages/industry/IndustryDashboard';
import { CandidateMatchingPage } from '../pages/industry/CandidateMatchingPage';
import { IndustryApplicationsPage } from '../pages/industry/IndustryApplicationsPage';

import { InstitutionDashboard } from '../pages/institution/InstitutionDashboard';
import { StudentDirectoryPage } from '../pages/institution/StudentDirectoryPage';
import { IndustryPartnersPage } from '../pages/institution/IndustryPartnersPage';

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
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/roadmap" element={<StudentRoadmapPage />} />
          <Route path="/student/mock-interview" element={<MockInterviewPage />} />
          <Route path="/student/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/student/assessment" element={<SkillAssessmentPage />} />
          <Route path="/student/skills" element={<StudentDashboard />} />
          <Route path="/student/skill-gap" element={<StudentDashboard />} />
          <Route path="/student/learning" element={<StudentDashboard />} />
          <Route path="/student/internships" element={<StudentInternshipsPage />} />
          <Route path="/student/jobs" element={<StudentInternshipsPage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
          <Route path="/student/portfolio" element={<DigitalPortfolioPage />} />
          <Route path="/student/*" element={<StudentDashboard />} />
        </Route>
      </Route>

      {/* Academician Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ACADEMICIAN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
          <Route path="/academician/opportunities" element={<AcademicianOpportunitiesPage />} />
          <Route path="/academician/collaboration" element={<AcademicianOpportunitiesPage />} />
          <Route path="/academician/applications" element={<AcademicianDashboard />} />
          <Route path="/academician/*" element={<AcademicianDashboard />} />
        </Route>
      </Route>

      {/* Industry Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['INDUSTRY']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/industry/dashboard" element={<IndustryDashboard />} />
          <Route path="/industry/internships" element={<CandidateMatchingPage />} />
          <Route path="/industry/jobs" element={<CandidateMatchingPage />} />
          <Route path="/industry/candidates" element={<CandidateMatchingPage />} />
          <Route path="/industry/applications" element={<IndustryApplicationsPage />} />
          <Route path="/industry/collaborations" element={<IndustryDashboard />} />
          <Route path="/industry/analytics" element={<IndustryDashboard />} />
          <Route path="/industry/*" element={<IndustryDashboard />} />
        </Route>
      </Route>

      {/* Institution Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['INSTITUTION']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/students" element={<StudentDirectoryPage />} />
          <Route path="/institution/academicians" element={<InstitutionDashboard />} />
          <Route path="/institution/skills" element={<InstitutionDashboard />} />
          <Route path="/institution/placements" element={<InstitutionDashboard />} />
          <Route path="/institution/partners" element={<IndustryPartnersPage />} />
          <Route path="/institution/*" element={<InstitutionDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

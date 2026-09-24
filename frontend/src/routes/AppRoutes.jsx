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
import { CreateDynamicRoadmapPage } from '../pages/student/CreateDynamicRoadmapPage';
import { MockInterviewPage } from '../pages/student/MockInterviewPage';
import { MockInterviewRoomPage } from '../pages/student/MockInterviewRoomPage';
import { ResumeBuilderPage } from '../pages/student/ResumeBuilderPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { CertificateVerificationPage } from '../pages/student/CertificateVerificationPage';
import { StudentCertificationsPage } from '../pages/student/StudentCertificationsPage';
import { CommunityFeedPage } from '../pages/student/CommunityFeedPage';
import { StudentSkillsGapPage } from '../pages/student/StudentSkillsGapPage';

import { AcademicianDashboard } from '../pages/academician/AcademicianDashboard';
import { AcademicianOpportunitiesPage } from '../pages/academician/AcademicianOpportunitiesPage';
import { AcademicianProfilePage } from '../pages/academician/AcademicianProfilePage';

import { IndustryDashboard } from '../pages/industry/IndustryDashboard';
import { CandidateMatchingPage } from '../pages/industry/CandidateMatchingPage';
import { IndustryApplicationsPage } from '../pages/industry/IndustryApplicationsPage';
import { PostOpportunityPage } from '../pages/industry/PostOpportunityPage';
import { InstitutionPlacementPage } from '../pages/industry/InstitutionPlacementPage';
import { IndustryOutreachPage } from '../pages/industry/IndustryOutreachPage';
import { IndustryProfilePage } from '../pages/industry/IndustryProfilePage';

import { InstitutionDashboard } from '../pages/institution/InstitutionDashboard';
import { StudentDirectoryPage } from '../pages/institution/StudentDirectoryPage';
import { AcademicianDirectoryPage } from '../pages/institution/AcademicianDirectoryPage';
import { IndustryPartnersPage } from '../pages/institution/IndustryPartnersPage';
import { SearchCollaborationsPage } from '../pages/institution/SearchCollaborationsPage';
import { TrainingProgramsPage } from '../pages/institution/TrainingProgramsPage';
import { PlacementAnalyticsPage } from '../pages/institution/PlacementAnalyticsPage';
import { InstitutionProfilePage } from '../pages/institution/InstitutionProfilePage';
import { SettingsPage } from '../pages/common/SettingsPage';

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
          <Route path="/student/roadmap/create" element={<CreateDynamicRoadmapPage />} />
          <Route path="/student/mock-interview" element={<MockInterviewPage />} />
          <Route path="/student/mock-interview/room" element={<MockInterviewRoomPage />} />
          <Route path="/student/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/student/skills-gap" element={<StudentSkillsGapPage />} />
          <Route path="/student/skills" element={<StudentSkillsGapPage />} />
          <Route path="/student/skill-gap" element={<StudentSkillsGapPage />} />
          <Route path="/student/certificate-verify" element={<CertificateVerificationPage />} />
          <Route path="/student/certifications" element={<StudentCertificationsPage />} />
          <Route path="/student/achievements" element={<StudentCertificationsPage />} />
          <Route path="/student/feed" element={<CommunityFeedPage />} />
          <Route path="/student/learning" element={<StudentDashboard />} />
          <Route path="/student/opportunities" element={<StudentInternshipsPage />} />
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
          <Route path="/academician/profile" element={<AcademicianProfilePage />} />
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
          <Route path="/industry/profile" element={<IndustryProfilePage />} />
          <Route path="/industry/candidates" element={<CandidateMatchingPage />} />
          <Route path="/industry/opportunities" element={<PostOpportunityPage />} />
          <Route path="/industry/internships" element={<PostOpportunityPage />} />
          <Route path="/industry/jobs" element={<PostOpportunityPage />} />
          <Route path="/industry/placements" element={<InstitutionPlacementPage />} />
          <Route path="/industry/outreach" element={<IndustryOutreachPage />} />
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
          <Route path="/institution/profile" element={<InstitutionProfilePage />} />
          <Route path="/institution/students" element={<StudentDirectoryPage />} />
          <Route path="/institution/academicians" element={<AcademicianDirectoryPage />} />
          <Route path="/institution/partners" element={<IndustryPartnersPage />} />
          <Route path="/institution/training-programs" element={<TrainingProgramsPage />} />
          <Route path="/institution/collaborations-search" element={<Navigate to="/institution/training-programs" replace />} />
          <Route path="/institution/skills" element={<InstitutionDashboard />} />
          <Route path="/institution/placements" element={<PlacementAnalyticsPage />} />
          <Route path="/institution/*" element={<InstitutionDashboard />} />
        </Route>
      </Route>

      {/* Shared Protected Settings Route for All Roles */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ACADEMICIAN', 'INDUSTRY', 'INSTITUTION']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

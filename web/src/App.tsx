import React, { Component } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui";

// Pages
import Landing from "@/pages/index";
import CitizenLogin from "@/pages/citizen.login";
import CitizenSignup from "@/pages/citizen.signup";
import ForgotPin from "@/pages/citizen.forgot-pin";
import CitizenHome from "@/pages/citizen.home";
import NewComplaint from "@/pages/citizen.complaint.new";
import TrackComplaints from "@/pages/citizen.complaints";
import RuleBook from "@/pages/citizen.rulebook";
import Contacts from "@/pages/citizen.contacts";
import Services from "@/pages/citizen.services";
import Profile from "@/pages/citizen.profile";

import AdminLogin from "@/pages/admin.login";
import AdminRegister from "@/pages/admin.register";
import ForgotPassword from "@/pages/admin.forgot-password";
import AdminHome from "@/pages/admin.home";
import ComplaintsReview from "@/pages/admin.complaints.index";
import ComplaintDetail from "@/pages/admin.complaints.id";
import ManageRules from "@/pages/admin.rules";
import ManageAnnouncements from "@/pages/admin.announcements";
import ManageContacts from "@/pages/admin.contacts";
import AdminServicesPage from "@/pages/admin.services";
import AdminProfile from "@/pages/admin.profile";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("GramVoice UI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
          <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The application encountered a temporary display issue. Click below to return home smoothly.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
          >
            Return to GramVoice Home
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { LanguageProvider } from "@/i18n/LanguageContext";

/** Fallback that redirects unknown routes to the appropriate home or landing */
function FallbackRedirect() {
  const adminUser = getUser("admin");
  const citizenUser = getUser("citizen");
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  if (path.startsWith("/admin") && adminUser) {
    return <Navigate to="/admin/home" replace />;
  }
  if (path.startsWith("/citizen") && citizenUser) {
    return <Navigate to="/citizen/home" replace />;
  }
  return <Navigate to="/" replace />;
}

export function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StoreProvider>
          <BrowserRouter>
            <Routes>
              {/* Public / Landing */}
              <Route path="/" element={<Landing />} />

              {/* Citizen Canonical Routes */}
              <Route path="/citizen/login" element={<CitizenLogin />} />
              <Route path="/citizen/signup" element={<CitizenSignup />} />
              <Route path="/citizen/forgot-pin" element={<ForgotPin />} />
              <Route path="/citizen/home" element={<CitizenHome />} />
              <Route path="/citizen/complaint/new" element={<NewComplaint />} />
              <Route path="/citizen/complaints" element={<TrackComplaints />} />
              <Route path="/citizen/rulebook" element={<RuleBook />} />
              <Route path="/citizen/contacts" element={<Contacts />} />
              <Route path="/citizen/services" element={<Services />} />
              <Route path="/citizen/profile" element={<Profile />} />

              {/* Citizen Route Aliases to ensure instant refresh preservation */}
              <Route path="/home" element={<Navigate to="/citizen/home" replace />} />
              <Route path="/dashboard" element={<Navigate to="/citizen/home" replace />} />
              <Route path="/complaint/new" element={<Navigate to="/citizen/complaint/new" replace />} />
              <Route path="/complaints" element={<Navigate to="/citizen/complaints" replace />} />
              <Route path="/rulebook" element={<Navigate to="/citizen/rulebook" replace />} />
              <Route path="/rules" element={<Navigate to="/citizen/rulebook" replace />} />
              <Route path="/contacts" element={<Navigate to="/citizen/contacts" replace />} />
              <Route path="/services" element={<Navigate to="/citizen/services" replace />} />
              <Route path="/profile" element={<Navigate to="/citizen/profile" replace />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/home" element={<AdminHome />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin/home" replace />} />
              <Route path="/admin/complaints" element={<ComplaintsReview />} />
              <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
              <Route path="/admin/rules" element={<ManageRules />} />
              <Route path="/admin/announcements" element={<ManageAnnouncements />} />
              <Route path="/admin/contacts" element={<ManageContacts />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/profile" element={<AdminProfile />} />

              {/* Smart Catch-all fallback */}
              <Route path="*" element={<FallbackRedirect />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
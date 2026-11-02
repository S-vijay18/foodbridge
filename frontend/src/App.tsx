import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreateDonationPage } from './pages/CreateDonationPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { FoodSafetyPage } from './pages/FoodSafetyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './dashboards/DonorDashboard';
import { NgoDashboard } from './dashboards/NgoDashboard';
import { VolunteerDashboard } from './dashboards/VolunteerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const { user } = useAuth();

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <LandingPage onNavigate={setCurrentTab} />;
      case 'marketplace':
        return <MarketplacePage onNavigate={setCurrentTab} />;
      case 'donate':
        return <CreateDonationPage onNavigate={setCurrentTab} />;
      case 'tracking':
        return <LiveTrackingPage onNavigate={setCurrentTab} />;
      case 'safety':
        return <FoodSafetyPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'login':
        return <LoginPage onNavigate={setCurrentTab} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentTab} />;
      case 'donor_dashboard':
        return <DonorDashboard onNavigate={setCurrentTab} />;
      case 'ngo_dashboard':
        return <NgoDashboard onNavigate={setCurrentTab} />;
      case 'volunteer_dashboard':
        return <VolunteerDashboard onNavigate={setCurrentTab} />;
      case 'admin_dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      default:
        return <LandingPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      <Navbar currentTab={currentTab} onNavigate={setCurrentTab} />
      <main className="flex-1">{renderContent()}</main>
      <Footer onNavigate={setCurrentTab} />
      <ChatbotWidget onNavigate={setCurrentTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;

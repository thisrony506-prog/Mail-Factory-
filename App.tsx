import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { HomeView } from './HomeView';
import { ExchangeView } from './ExchangeView';
import { HistoryView } from './HistoryView';
import { SellersView } from './SellersView';
import { ProfileView } from './ProfileView';
import { WithdrawView } from './WithdrawView';
import { PrivacyView } from './PrivacyView';
import { AboutView } from './AboutView';
import { ReviewsView } from './ReviewsView';
import { AdminReviewsView } from './AdminReviewsView';
import { LiveChatDrawer } from './LiveChatDrawer';
import { NotificationDrawer } from './NotificationDrawer';
import { AuthModal } from './AuthModal';
import {
  EditProfileModal,
  ChangePasswordModal,
  FAQModal,
  ContactModal,
  RateAppModal,
} from './Modals';
import { IOSInstallGuideModal } from './IOSInstallGuideModal';
import { usePWAInstall } from './usePWAInstall';
import { MessageSquare, Bell } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    unreadNotifsCount,
    setChatDrawerOpen,
    setNotifDrawerOpen,
    isRateModalOpen,
    setRateModalOpen,
  } = useApp();
  const { showIOSGuide, closeIOSGuide } = usePWAInstall();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState<boolean>(false);
  const [isFAQOpen, setIsFAQOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'exchange' && <ExchangeView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'sellers' && <SellersView />}
        {activeTab === 'privacy' && <PrivacyView />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenChangePass={() => setIsChangePassOpen(true)}
            onOpenFAQ={() => setIsFAQOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
          />
        )}
        {activeTab === 'withdraw' && <WithdrawView />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'admin_reviews' && <AdminReviewsView />}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2.5">
        <button
          onClick={() => setChatDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="Live Support Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => setNotifDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white text-slate-700 border-2 border-slate-200 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Global Modals and Drawers */}
      <AuthModal />
      <LiveChatDrawer />
      <NotificationDrawer />
      <IOSInstallGuideModal isOpen={showIOSGuide} onClose={closeIOSGuide} />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <RateAppModal isOpen={isRateModalOpen} onClose={() => setRateModalOpen(false)} />

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

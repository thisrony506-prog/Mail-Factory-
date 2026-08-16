import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations, LANGUAGES } from './i18n';
import { hapticFeedback } from './haptics';
import { AuthPageView } from './AuthPageView';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  UserPlus,
  LogIn,
  Star,
  Globe,
  DollarSign,
  Lock,
  MessageSquare,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Check,
  Shield,
  Layers
} from 'lucide-react';

export const GuestLandingView: React.FC = () => {
  const {
    language,
    setLanguage,
    isAuthModalOpen,
    authModalMode,
    setAuthModalOpen,
    topSellers,
    allUsers,
    levels,
    reviewShifts,
    appLogo,
    commissionPercent,
    signupBonusUser,
  } = useApp();

  const t = translations[language] || translations['bn'];
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const [authMode, setAuthMode] = useState<'none' | 'register' | 'login'>(() => {
    try {
      const path = window.location.pathname;
      if (path === '/register') return 'register';
      if (path === '/login') return 'login';
      const search = new URLSearchParams(window.location.search);
      if (search.get('mode') === 'register') return 'register';
      if (search.get('mode') === 'login') return 'login';
    } catch {
      // Safe ignore
    }
    return 'none';
  });

  // Sync with triggers from AppContext if any component calls setAuthModalOpen
  useEffect(() => {
    if (isAuthModalOpen && authModalMode) {
      setAuthMode(authModalMode);
      setAuthModalOpen(false); // Render full page AuthPageView instead of popup modal
    }
  }, [isAuthModalOpen, authModalMode, setAuthModalOpen]);

  // Combine real users & topSellers strictly from Real Firebase Data
  const sellersList = React.useMemo(() => {
    // 1. Check if configured topSellers exist in Firebase Realtime Database
    const validTop = (topSellers || []).filter(
      (s) => s && !s.uid?.startsWith('seller_') && s.username !== 'Tanvir Hossain' && s.username !== 'Shakil Ahmed'
    );
    if (validTop.length > 0) {
      return validTop.slice(0, 8).map((s, idx) => ({ ...s, rank: idx + 1 }));
    }

    // 2. Otherwise compute top real users registered in Firebase
    const realUsers = (allUsers || []).filter(
      (u) => u && !u.uid?.startsWith('seller_') && u.username !== 'Tanvir Hossain' && u.username !== 'Shakil Ahmed'
    );
    if (realUsers.length > 0) {
      const computed = realUsers
        .map((u) => {
          const approved = Number(u.manual_approved_count) || Number(u.total_submitted) || 0;
          const earnings = Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0);
          return {
            uid: u.uid || `user_${Math.random()}`,
            username: u.username || (u.email ? u.email.split('@')[0] : 'Real Seller'),
            email: u.email || '',
            photoURL: u.photoURL || '',
            totalEarnings: earnings,
            balance: Number(u.balance) || 0,
            manual_approved_count: approved,
            total_submitted: Number(u.total_submitted) || 0,
            badge: approved >= 100 ? 'VIP Champion' : approved >= 30 ? 'Diamond VIP' : 'Gold Partner',
          };
        })
        .sort((a, b) => b.manual_approved_count - a.manual_approved_count || b.totalEarnings - a.totalEarnings);

      return computed.slice(0, 8).map((s, idx) => ({ ...s, rank: idx + 1 }));
    }

    return [];
  }, [allUsers, topSellers]);

  if (authMode !== 'none') {
    return (
      <AuthPageView
        initialMode={authMode}
        onBackToLanding={() => {
          setAuthMode('none');
          try {
            if (window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
            }
          } catch {}
        }}
      />
    );
  }

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const sampleReviews = [
    {
      name: "আজিমুল ইসলাম",
      role: "টপ সেলার (লেভেল ৫)",
      comment: "Mail Factory-তে জিমেইল দিলে ১০ থেকে ২০ মিনিটের মধ্যে পেআউট পাওয়া যায়। বিকাশ এবং নগদে পেমেন্ট নিয়ে কখনোই কোন সমস্যা হয়নি!",
      rating: 5,
      date: "গতকাল",
      verified: true,
    },
    {
      name: "Tanvir Rahman",
      role: "Gold VIP Seller",
      comment: "The level system is amazing! I started at Level 1 and now I am getting ৳14 per Gmail at Level 5. Highly recommended!",
      rating: 5,
      date: "২ দিন আগে",
      verified: true,
    },
    {
      name: "রাসেল আহমেদ",
      role: "নিয়মিত সেলার",
      comment: "রেফারেল সিস্টেম থেকে বন্ধুক সেল করলেই ১০% কমিশন পাচ্ছি। সত্যি বলতে খুবই লাভজনক প্ল্যাটফর্ম।",
      rating: 5,
      date: "৩ দিন আগে",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <img
                src={appLogo}
                alt="Mail Factory"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                Mail Factory
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-500/30">
                  {t.activeBadge || 'সক্রিয়'}
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400">
                {t.slogan || '★ বিশ্বস্ত ও দ্রুত এক্সচেঞ্জ ★'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentLangObj.flag}</span>
                <span className="uppercase text-[11px] hidden sm:inline">{currentLangObj.code}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-1.5 z-50 text-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-700 mb-1">
                    {t.selectLanguage || 'ভাষা নির্বাচন করুন'}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        hapticFeedback.medium();
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        language === lang.code
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-700/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login & Register Buttons */}
            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('login');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.login || 'লগইন'}</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('register');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.register || 'সাইন আপ'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10 flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 sm:p-10 overflow-hidden shadow-2xl">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                {language === 'bn'
                  ? 'বাংলাদেশের #১ নির্ভরযোগ্য ও দ্রুত জিমেইল বায়িং প্ল্যাটফর্ম'
                  : 'Bangladesh #1 Fast & Trusted Gmail Exchange'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              {language === 'bn' ? (
                <>
                  আপনার জিমেইল বিক্রি করে <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                    প্রতিদিন নিশ্চিত পেমেন্ট ইনকাম করুন
                  </span>
                </>
              ) : (
                <>
                  Sell Your Gmail Accounts & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                    Get Instant Cash Daily
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {language === 'bn'
                ? 'Mail Factory-তে আপনার নতুন বা পুরাতন জিমেইল সাবমিট করুন। আমাদের এক্সপ্রেস ভেরিফিকেশন শেষে সরাসরি বিকাশ, নগদ বা রকেটে ইন্সট্যান্ট টাকা বুঝে নিন।'
                : 'Submit your fresh or aged Gmail accounts on Mail Factory. Receive instant payouts directly to your bKash, Nagad, Rocket or USDT wallet upon quick audit.'}
            </p>

            {/* Main Action Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  hapticFeedback.heavy();
                  setAuthMode('register');
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন (৳৫ বোনাস)' : 'Create Free Account (৳5 Bonus)'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  hapticFeedback.light();
                  setAuthMode('login');
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন' : 'Already have an account? Login'}</span>
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '৳১০-৳১৪ পার জিমেইল' : '৳10-৳14 / Gmail'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? 'বিকাশ / নগদ / রকেট' : 'bKash / Nagad Instant'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '১০% রেফারেল ইনকাম' : '10% Referral Earnings'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '২৪/৭ লাইভ হেল্পডেস্ক' : '24/7 Support Desk'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* APP SITUATION & LIVE STATS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>{language === 'bn' ? 'অ্যাপের পরিস্থিতি ও লাইভ তথ্য' : 'Platform Situation & Overview'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'bn' ? 'Mail Factory-র মূল পরিসংখ্যান এবং লাইভ কার্যক্রম' : 'Current active stats & platform status'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'মোট নিবন্ধিত সেলার' : 'Registered Sellers'}</span>
              </div>
              <p className="text-2xl font-black text-white">
                {allUsers && allUsers.length > 0 ? `${allUsers.length}+` : '১৫,০০০+'}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block">● সক্রিয় সম্প্রদায়</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>{language === 'bn' ? 'সফল জিমেইল প্রসেস' : 'Processed Gmails'}</span>
              </div>
              <p className="text-2xl font-black text-white">৬০,০০০+</p>
              <span className="text-[10px] text-indigo-400 font-bold block">✓ ৯৯.৮% ভেরিফাইড</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <DollarSign className="w-4 h-4" />
                <span>{language === 'bn' ? 'মোট পরিশোধিত টাকা' : 'Total Paid Out'}</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">৳৬,৫০,০০০+</p>
              <span className="text-[10px] text-slate-400 font-bold block">bKash, Nagad, Rocket</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>{language === 'bn' ? 'গড় রিভিও সময়' : 'Avg Review Time'}</span>
              </div>
              <p className="text-2xl font-black text-white">১০ - ৩০ মি.</p>
              <span className="text-[10px] text-amber-400 font-bold block">⚡ দ্রুততম রিভিও</span>
            </div>
          </div>
        </section>

        {/* TOP SELLERS SHOWCASE */}
        <section className="p-5 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {language === 'bn' ? 'আমাদের সেরা সেলারবৃন্দ (Top Sellers)' : 'Top Sellers Leaderboard'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'bn' ? 'যারা প্রতিদিন নিয়মিত জিমেইল বিক্রি করে সর্বোচ্চ ইনকাম করছেন' : 'Highest earning verified sellers on Mail Factory'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'bn' ? 'লাইভ আপডেট' : 'Live Ranking'}
            </span>
          </div>

          {sellersList && sellersList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sellersList.map((seller, idx) => {
                const approvedCount = Number(seller.manual_approved_count) || Number(seller.total_submitted) || 0;
                const totalEarnings = Number(seller.totalEarnings) || Number(seller.balance) || 0;
                const rank = seller.rank || idx + 1;

                return (
                  <div
                    key={seller.uid || idx}
                    className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/70 flex items-center justify-between text-xs hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white">
                            {seller.username || seller.email?.split('@')[0] || 'Top Seller'}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {language === 'bn' ? `অনুমোদিত: ${approvedCount} টি জিমেইল` : `Approved: ${approvedCount} Gmails`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        {language === 'bn' ? 'মোট আর্ন' : 'Total Earned'}
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        ৳{totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center text-xs text-slate-400 font-medium">
              {language === 'bn'
                ? 'বর্তমানে কোনো সক্রিয় সেলার রেকর্ড নেই। এখনই অ্যাকাউন্ট তৈরি করে আপনার পজিশন অর্জন করুন!'
                : 'No leaderboard records found yet. Create an account now to claim your spot!'}
            </div>
          )}

          <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
            <span className="font-semibold">
              {language === 'bn'
                ? 'আপনিও হতে পারেন আমাদের পরবর্তী সেরা সেলার!'
                : 'Become our next top seller today!'}
            </span>
            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('register');
              }}
              className="text-amber-400 font-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সাইন আপ করুন' : 'Sign Up Now'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* LEVEL PRICE CHART */}
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>{language === 'bn' ? 'লেভেল রেট এবং প্রাইজ চার্ট' : 'Level Rate Structure'}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'যত বেশি জিমেইল সাবমিট করবেন, আপনার প্রতি জিমেইলে বোনাস রেট তত বৃদ্ধি পাবে' : 'Submit more Gmails to automatically unlock higher rate perks'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {levels.map((lvl) => (
              <div
                key={lvl.level}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1.5 hover:border-purple-500/50 transition-all"
              >
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold inline-block border border-purple-500/30">
                  Level {lvl.level}
                </span>
                <h4 className="text-xs font-black text-white">{lvl.title}</h4>
                <div className="text-xl font-black text-emerald-400">
                  ৳{lvl.rate} <span className="text-[10px] text-slate-400 font-normal">/Pcs</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {lvl.approved === 0 ? '০ - ৩৯ টি' : `${lvl.approved}+ টি`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
          <h3 className="text-base font-black text-white text-center">
            {language === 'bn' ? '৩টি সহজ ধাপে কাজ শুরু করুন' : 'Start Selling in 3 Simple Steps'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center mx-auto text-sm border border-indigo-500/30">
                1
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '১. ফ্রি অ্যাকাউন্ট খুলুন' : '1. Sign Up Free'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'আপনার নাম ও ইমেইল দিয়ে মাত্র ৩০ সেকেন্ডে রেজিস্ট্রেশন সম্পন্ন করুন এবং ৳৫ জয়েনিং বোনাস নিন।'
                  : 'Register with your email in 30 seconds and instantly get your welcome cash bonus.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-black flex items-center justify-center mx-auto text-sm border border-purple-500/30">
                2
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '২. জিমেইল সাবমিট করুন' : '2. Submit Gmails'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'আপনার কাছে থাকা নতুন বা পুরাতন জিমেইল অ্যাড্রেস এবং পাসওয়ার্ড বাল্ক পেস্ট করে সাবমিট করুন।'
                  : 'Bulk paste or enter your fresh or aged Gmail credentials safely onto our submission forms.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center mx-auto text-sm border border-emerald-500/30">
                3
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '৩. সরাসরি ক্যাশ আউট' : '3. Instant Payout'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'রিভিও সম্পন্ন হলে সাথে সাথে আপনার ব্যালেন্স যুক্ত হবে এবং বিকাশ, নগদ বা রকেটে উইথড্র দিন।'
                  : 'Once audited, earnings hit your main wallet. Withdraw to bKash, Nagad or Rocket anytime.'}
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER REVIEWS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{language === 'bn' ? 'সেলারদের মতামত ও অভিজ্ঞতা' : 'Real Seller Feedback'}</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleReviews.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-white block">{rev.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{rev.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center space-y-4 shadow-2xl shadow-indigo-500/30">
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn'
              ? 'আজই যুক্ত হন Mail Factory পরিবারে এবং আপনার ইনকাম শুরু করুন!'
              : 'Join Mail Factory Today & Start Earning Online!'}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto font-medium">
            {language === 'bn'
              ? 'হাজার হাজার সফল সেলারদের সাথে যুক্ত হয়ে নিশ্চিন্তে নিজের সময় কাজে লাগিয়ে অর্থ উপার্জন করুন।'
              : 'Join thousands of trusted sellers exchanging Gmail accounts daily with instant local payouts.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                hapticFeedback.heavy();
                setAuthModalOpen(true, 'register');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {language === 'bn' ? '🚀 ফ্রিতে রেজিস্ট্রেশন করুন' : '🚀 Register For Free'}
            </button>
            <button
              onClick={() => {
                hapticFeedback.light();
                setAuthModalOpen(true, 'login');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-900 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
            >
              {language === 'bn' ? '🔑 লগইন করুন' : '🔑 Account Login'}
            </button>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="mt-12 text-center text-[11px] text-slate-500 border-t border-slate-800 pt-6">
        <p>© {new Date().getFullYear()} Mail Factory. All rights reserved. Bangladesh #1 Trusted Exchange Platform.</p>
      </footer>
    </div>
  );
};

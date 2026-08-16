import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { ReviewShifts } from './ReviewShifts';
import { PWAInstallBanner } from './PWAInstallBanner';
import { SEO } from './SEO';
import { HomeReviewsPreview } from './HomeReviewsPreview';

import {
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Headphones,
  Lock,
  Sparkles,
  Layers,
  Trophy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GmailType, TopSellerItem } from './types';

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    currentLevel,
    levels,
    maintenanceMode,
    appLogo,
    user,
    profile,
    topSellers,
    allUsers,
    setAuthModalOpen,
  } = useApp();

  const t = translations[language];
  const [selectedType, setSelectedType] = useState<GmailType>('new');

  const availableBalance = profile?.balance || 0;
  const netBalance = availableBalance * 0.94; // 6% fee model
  const netUsd = netBalance / 120; // 1 USD = 120 BDT

  const handleStartExchange = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab('exchange');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      <SEO 
        title="Mail Factory - Best Gmail Exchange Platform"
        description="Exchange fresh and aged Gmail accounts for cash instantly. Bangladesh's most trusted platform with fast payment and multi-tier rewards."
        url="https://www.mailfectory.top"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Mail Factory",
          "url": "https://www.mailfectory.top",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.mailfectory.top/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* 100% Safe Trust Banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="leading-snug">{t.trustedSafe}</p>
      </div>

      {/* Exchange Rate Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-sm text-slate-800">
              {currentLevel.title} {t.levelRateTitle}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.activeBadge}
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {/* New Gmail Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-center relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 text-indigo-900 pointer-events-none font-black text-6xl">
              N
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              {t.newGmail}
            </span>
            <div className="text-3xl font-black text-indigo-700 font-mono">
              ৳{currentLevel.rate}
            </div>
            <span className="text-[10px] font-semibold text-indigo-500 mt-1 inline-block">
              Per Verified Account
            </span>
          </div>

          {/* Old Gmail Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 text-center relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 text-purple-900 pointer-events-none font-black text-6xl">
              O
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              {t.oldGmail}
            </span>
            <div className="text-3xl font-black text-purple-700 font-mono">
              ৳{currentLevel.old_rate}
            </div>
            <span className="text-[10px] font-semibold text-purple-500 mt-1 inline-block">
              Per Aged Account
            </span>
          </div>
        </div>
      </div>

      {/* Start Exchange Quick Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              {language === 'bn' ? 'লেনদেন শুরু করুন' : 'Start Exchange'}
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'সরাসরি জিমেইল বিক্রি করে টাকা নিন' : 'Sell Gmail instantly for cash'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
            {t.chooseGmailType}
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GmailType)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="new">
              {t.newGmail} — ৳{currentLevel.rate} ({currentLevel.title})
            </option>
            <option value="old">
              {t.oldGmail} — ৳{currentLevel.old_rate} ({currentLevel.title})
            </option>
          </select>
        </div>

        <button
          onClick={handleStartExchange}
          disabled={maintenanceMode}
          className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${
            maintenanceMode
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 hover:opacity-95 shadow-indigo-200'
          }`}
        >
          <span>{maintenanceMode ? 'Maintenance Mode' : t.startSelling}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Earnings Conversion Widget */}
      <div className="rounded-3xl bg-indigo-50/50 border border-indigo-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              {language === 'bn' ? 'ব্যালেন্স কনভার্টার' : 'Earnings Converter'}
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              {language === 'bn' ? '৬% ফি বাদ দিয়ে সম্ভাব্য আয় (১ USD = ১২০ BDT)' : 'Est. after 6% fee (1 USD = 120 BDT)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* BDT Gross */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">BDT (Gross)</span>
            <span className="text-sm font-black text-slate-800 font-mono">৳{availableBalance.toFixed(2)}</span>
          </div>
          
          {/* Net BDT */}
          <div className="bg-white rounded-2xl p-3 border border-emerald-200 text-center flex flex-col justify-center">
             <span className="text-[10px] font-extrabold text-emerald-500 uppercase mb-0.5">BDT (Net)</span>
             <span className="text-sm font-black text-emerald-700 font-mono">৳{netBalance.toFixed(2)}</span>
          </div>

          {/* USDT */}
          <div className="bg-white rounded-2xl p-3 border border-amber-200 text-center flex flex-col justify-center">
             <span className="text-[10px] font-extrabold text-amber-500 uppercase mb-0.5">USD/USDT</span>
             <span className="text-sm font-black text-amber-600 font-mono">${netUsd.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Live Review Shifts */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.liveReviewShifts}</span>
          </h3>
        </div>
        <ReviewShifts />
      </div>

      {/* Level Perks Quick Carousel */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide uppercase text-amber-300">
              {language === 'bn' ? 'ভিআইপি লেভেল রিওয়ার্ড' : 'VIP Level Perks'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Level 1 - 5</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {levels.map((lvl) => {
            const isCurrent = currentLevel.level === lvl.level;
            return (
              <div
                key={lvl.level}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-white/20 border-amber-400 text-white shadow-inner'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase">
                  {lvl.title} {isCurrent && '👑'}
                </div>
                <div className="text-base font-black text-amber-300 my-0.5">
                  ৳{lvl.rate} <span className="text-[10px] font-normal text-white/70">/mail</span>
                </div>
                <div className="text-[9px] text-white/60 truncate">
                  {lvl.approved === 0 ? 'Start' : `${lvl.approved}+ approved`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews Preview */}
      <HomeReviewsPreview />

      {/* Top Sellers Leaderboard Spotlight */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                {language === 'bn' ? 'টপ সেলার লিডারবোর্ড 🏆' : 'Top Sellers Leaderboard 🏆'}
              </h3>
              <span className="text-[11px] font-medium text-slate-400">
                {language === 'bn' ? 'সর্বোচ্চ আয়কারী এক্সচেঞ্জ পার্টনারগণ' : 'Highest verified earning partners'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('sellers');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 bg-indigo-50 px-2.5 py-1 rounded-xl"
          >
            <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-1">
          {(() => {
            let sellersList: TopSellerItem[] = [];

            // 1. Prioritize configured topSellers from Firebase (filtering any demo items)
            const validTop = (topSellers || []).filter(
              (s) => s && !s.uid?.startsWith('seller_') && s.username !== 'Tanvir Hossain' && s.username !== 'Shakil Ahmed'
            );
            if (validTop.length > 0) {
              sellersList = validTop.slice(0, 3).map((seller, idx) => {
                let photo = seller.photoURL;
                if (!photo && allUsers && allUsers.length > 0) {
                  const matched = allUsers.find(
                    (u) =>
                      (u.uid && u.uid === seller.uid) ||
                      (u.email && seller.email && u.email.toLowerCase() === seller.email.toLowerCase()) ||
                      (u.username && seller.username && u.username.toLowerCase() === seller.username.toLowerCase())
                  );
                  if (matched && matched.photoURL) {
                    photo = matched.photoURL;
                  }
                }
                return {
                  ...seller,
                  photoURL: photo || '',
                  rank: idx + 1,
                };
              });
            } else {
              const realUsers = (allUsers || []).filter(
                (u) => u && !u.uid?.startsWith('seller_') && u.username !== 'Tanvir Hossain' && u.username !== 'Shakil Ahmed'
              );
              if (realUsers.length > 0) {
                sellersList = realUsers
                  .sort((a, b) => {
                    const earnA = Number(a.totalEarnings) || (Number(a.balance || 0) + Number(a.total_withdrawn || 0)) || Number(a.balance || 0);
                    const earnB = Number(b.totalEarnings) || (Number(b.balance || 0) + Number(b.total_withdrawn || 0)) || Number(b.balance || 0);
                    return earnB - earnA;
                  })
                  .slice(0, 3)
                  .map((u, idx) => ({
                    uid: u.uid || `user_${idx + 1}`,
                    username: u.username || (u.email ? u.email.split('@')[0] : `Seller ${idx + 1}`),
                    email: u.email || '',
                    photoURL: u.photoURL || '',
                    totalEarnings: Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0),
                    balance: Number(u.balance) || 0,
                    manual_approved_count: Number(u.manual_approved_count) || Number(u.total_submitted) || 0,
                    total_submitted: Number(u.total_submitted) || 0,
                    badge: idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner',
                    rank: idx + 1,
                  }));
              }
            }

            const top3 = sellersList.slice(0, 3);

            if (top3.length === 0) {
              return (
                <div className="py-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 px-4">
                  <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1.5 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">
                    {language === 'bn' ? 'এখনও কোনো সেলার যুক্ত হননি' : 'No Leaderboard Sellers Yet'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">
                    {language === 'bn' ? 'আজই জিমেইল জমা দিয়ে ১ম স্থান অর্জন করুন!' : 'Submit Gmails today to take 1st place!'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('exchange');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs inline-flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{language === 'bn' ? 'জিমেইল এক্সচেঞ্জ করুন' : 'Start Exchange'}</span>
                  </button>
                </div>
              );
            }

            const gridCols = top3.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : top3.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

            return (
              <div className={`grid ${gridCols} gap-2`}>
                {top3.map((seller, idx) => {
                  const medals = ['👑 1st', '🥈 2nd', '🥉 3rd'];
                  const bgStyles = [
                    'bg-gradient-to-b from-amber-50 to-amber-100/80 border-amber-300 text-amber-950',
                    'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-300 text-slate-900',
                    'bg-gradient-to-b from-orange-50 to-orange-100/70 border-orange-200 text-orange-950',
                  ];
                  const earn = Number(seller.totalEarnings) || Number(seller.balance) || 0;
                  const name = seller.username || seller.email?.split('@')[0] || 'User';
                  const photo = seller.photoURL || '';
                  return (
                    <div
                      key={seller.uid || idx}
                      className={`p-2.5 rounded-2xl border text-center relative flex flex-col items-center justify-between ${bgStyles[idx] || 'bg-slate-50 border-slate-200'}`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded-full bg-white/80 shadow-xs">
                        {medals[idx]}
                      </span>
                      {photo ? (
                        <img src={photo} alt={name} className="w-8 h-8 rounded-full object-cover my-0.5 shadow-sm border border-white/60" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center my-0.5 shadow-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-[11px] font-extrabold truncate w-full mt-1">
                        {name}
                      </div>
                      <div className="text-xs font-black text-indigo-700 font-mono mt-0.5">
                        ৳{earn.toLocaleString('en-US')}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
        <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{t.whyChooseUs}</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.fastPayment}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.safeData}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.support247}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

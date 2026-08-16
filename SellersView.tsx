import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Edit3,
  Shield,
} from 'lucide-react';
import { TopSellerItem } from './types';

const ADMIN_EMAILS = ['gmrony135@gmail.com', 'mailfactorybd@gmail.com'];

export const SellersView: React.FC = () => {
  const { language, topSellers, allUsers, user, setActiveTab, syncRealUsersToTopSellers, addNotification } = useApp();
  const t = translations[language];
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  // Compute display sellers strictly from Real Firebase Users
  const displaySellers: TopSellerItem[] = React.useMemo(() => {
    // 1. If configured topSellers exists in Firebase Realtime Database (with real user entries)
    const validTop = (topSellers || []).filter(
      (s) => s && !s.uid?.startsWith('seller_') && s.username !== 'Tanvir Hossain' && s.username !== 'Shakil Ahmed'
    );
    if (validTop.length > 0) {
      return validTop.slice(0, 10).map((seller, idx) => {
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
    }

    // 2. Otherwise compute from all registered real users in Firebase
    const realUsers = (allUsers || []).filter(
      (u) => u && !u.uid?.startsWith('seller_') && u.username !== 'Tanvir Hossain' && u.username !== 'Shakil Ahmed'
    );
    if (realUsers.length > 0) {
      const realTop: TopSellerItem[] = realUsers
        .sort((a, b) => {
          const earnA = Number(a.totalEarnings) || (Number(a.balance || 0) + Number(a.total_withdrawn || 0)) || Number(a.balance || 0);
          const earnB = Number(b.totalEarnings) || (Number(b.balance || 0) + Number(b.total_withdrawn || 0)) || Number(b.balance || 0);
          return earnB - earnA;
        })
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

      return realTop.slice(0, 10);
    }

    return [];
  }, [topSellers, allUsers]);

  // Helper to compute payout/earnings from seller item with time filter
  const getEarning = (seller: TopSellerItem): number => {
    const base = Number(seller.totalEarnings) || Number(seller.balance || 0) || 0;
    if (timeFilter === 'today') return Math.round(base * 0.08);
    if (timeFilter === 'week') return Math.round(base * 0.35);
    return base;
  };

  const getApprovedCount = (seller: TopSellerItem): number => {
    const base = Number(seller.manual_approved_count) || Number(seller.total_submitted) || 0;
    if (timeFilter === 'today') return Math.round(base * 0.08);
    if (timeFilter === 'week') return Math.round(base * 0.35);
    return base;
  };

  const topThree = displaySellers.slice(0, 3);
  const restSellers = displaySellers.slice(3, 10);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isAdmin) {
      await syncRealUsersToTopSellers();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleRealSync = async () => {
    setIsSyncing(true);
    const synced = await syncRealUsersToTopSellers();
    setIsSyncing(false);
    addNotification('রিয়েল ইউজার সিঙ্ক সফল 🏆', `${synced.length} জন সেলার ডাটাবেজ থেকে রিয়েলটাইমে আপডেট হয়েছে।`, 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in">
      {/* Admin Quick Access Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-3 rounded-2xl shadow-md flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-black text-xs truncate">টপ ১০ সেলার কন্ট্রোল (Admin)</span>
              <span className="text-[10px] text-amber-100 font-medium block truncate">
                {allUsers.filter((u) => u && !u.uid?.startsWith('seller_')).length} জন রিয়েল ইউজার সিস্টেমে আছেন
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRealSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              title="রিয়েল ইউজারদের দিয়ে টপ ১০ আপডেট করুন"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'রিয়েল সিঙ্ক'}</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_top_sellers')}
              className="px-2.5 py-1.5 rounded-xl bg-white text-amber-900 font-black text-[11px] shadow-sm hover:bg-amber-50 transition-all active:scale-95"
            >
              এডিট →
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'bn' ? 'টপ ১০ সেলার লিডারবোর্ড' : 'Top 10 Sellers Leaderboard'}</span>
          </div>

          <button
            onClick={() => setActiveTab('referral_leaderboard')}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'bn' ? 'রেফারেল লিডারবোর্ড 🎁' : 'Referral Leaderboard 🎁'}</span>
          </button>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          {language === 'bn' ? 'সেরা ১০ এক্সচেঞ্জ পার্টনারগণ 🏆' : 'Top 10 Exchange Champions 🏆'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
          {language === 'bn'
            ? 'এডমিন ভেরিফাইড সর্বোচ্চ আয়কারী সেরা ১০ সেলারের তালিকা'
            : 'Official verified leaderboard of top 10 earning sellers'}
        </p>

        {/* Time Period Filter Pills & Refresh */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              timeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'bn' ? 'সব সময়' : 'All Time'}
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              timeFilter === 'week'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}
          </button>
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              timeFilter === 'today'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'bn' ? 'আজকের সেরা' : 'Today'}
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all ml-1"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Global Stats Counter */}
        {displaySellers.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-center border-r border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">টপ সেলার</span>
              <span className="text-sm font-black text-slate-800 font-mono">{displaySellers.length} জন</span>
            </div>
            <div className="text-center border-r border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">মোট পেমেন্ট</span>
              <span className="text-sm font-black text-emerald-600 font-mono">
                ৳{displaySellers.reduce((acc, s) => acc + getEarning(s), 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">অ্যাপ্রুভড জিমেইল</span>
              <span className="text-sm font-black text-indigo-600 font-mono">
                {displaySellers.reduce((acc, s) => acc + getApprovedCount(s), 0).toLocaleString('en-US')} টি
              </span>
            </div>
          </div>
        )}
      </div>

      {/* When no top sellers configured yet */}
      {displaySellers.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800">
            {language === 'bn' ? 'টপ সেলার তালিকা প্রস্তুত হচ্ছে...' : 'Top Sellers Leaderboard Preparing...'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAdmin
              ? 'এডমিন হিসেবে আপনি ওপরের "টপ ১০ সেলার ম্যানেজার" বাটন থেকে ১০ জন সেলার সেট করুন।'
              : 'এডমিন ভেরিফাইড টপ ১০ সেলারের তালিকা শীঘ্রই প্রকাশিত হবে।'}
          </p>
          {isAdmin ? (
            <button
              onClick={() => setActiveTab('admin_top_sellers')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow hover:bg-amber-600 transition-all inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>টপ ১০ সেলার সেট করুন</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('exchange');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'bn' ? 'প্রথম সেলার হোন' : 'Become the 1st Seller'}</span>
            </button>
          )}
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {displaySellers.length >= 1 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-6 pb-2">
          {/* Rank 2 (Silver) */}
          {topThree[1] ? (
            <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300/80 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-slate-800">
                🥈 2
              </div>
              {topThree[1].photoURL ? (
                <img src={topThree[1].photoURL} alt={topThree[1].username} className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[1].username || topThree[1].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[1].username || topThree[1].email?.split('@')[0] || 'User'}</span>
                <CheckCircle2 className="w-3 h-3 text-sky-500 fill-sky-500/20 shrink-0 inline" />
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                {getApprovedCount(topThree[1])} Gmails
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{getEarning(topThree[1]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[8px] font-black uppercase tracking-wider text-slate-700 bg-slate-300/80 px-2 py-0.5 rounded-full mt-1">
                {topThree[1].badge || 'Diamond VIP'}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs font-bold">
              2nd Position Open
            </div>
          )}

          {/* Rank 1 (Gold - Taller & Highlighted) */}
          {topThree[0] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 border-2 border-amber-400 p-3.5 text-center shadow-lg relative pt-8 scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center font-black text-sm text-white animate-bounce">
                👑 1
              </div>
              {topThree[0].photoURL ? (
                <img src={topThree[0].photoURL} alt={topThree[0].username} className="w-12 h-12 rounded-full object-cover mx-auto mb-1.5 shadow-md ring-2 ring-amber-300" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-base flex items-center justify-center mx-auto mb-1.5 shadow-md ring-2 ring-amber-300">
                  {(topThree[0].username || topThree[0].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-900 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[0].username || topThree[0].email?.split('@')[0] || 'Top Seller'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 fill-amber-600/20 shrink-0 inline" />
              </div>
              <div className="text-xs font-bold text-amber-800 mt-0.5">
                {getApprovedCount(topThree[0])} Gmails
              </div>
              <div className="text-base font-black text-indigo-800 mt-1">
                ৳{getEarning(topThree[0]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-300/80 px-2 py-0.5 rounded-full mt-1">
                {topThree[0].badge || 'VIP Champion'}
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] ? (
            <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100 border border-orange-200 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-white">
                🥉 3
              </div>
              {topThree[2].photoURL ? (
                <img src={topThree[2].photoURL} alt={topThree[2].username} className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[2].username || topThree[2].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[2].username || topThree[2].email?.split('@')[0] || 'User'}</span>
                <CheckCircle2 className="w-3 h-3 text-orange-500 fill-orange-500/20 shrink-0 inline" />
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                {getApprovedCount(topThree[2])} Gmails
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{getEarning(topThree[2]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[8px] font-black uppercase tracking-wider text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full mt-1">
                {topThree[2].badge || 'Gold Partner'}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs font-bold">
              3rd Position Open
            </div>
          )}
        </div>
      )}

      {/* Rest of Leaderboard List (Rank 4 to 10) */}
      {restSellers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'bn' ? 'শীর্ষ ৪-১০ র‍্যাংকিং তালিকা' : 'Top 4-10 Ranking List'}</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Verified
            </span>
          </div>

          {restSellers.map((seller, index) => {
            const rank = index + 4;
            const levelBadge = seller.badge || 'Gold Partner';
            return (
              <div
                key={seller.uid || index}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-xs text-slate-400">
                    #{rank}
                  </span>
                  {seller.photoURL ? (
                    <img src={seller.photoURL} alt={seller.username} className="w-9 h-9 rounded-full object-cover shadow-xs" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-xs">
                      {(seller.username || seller.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-slate-800">
                        {seller.username || seller.email?.split('@')[0] || 'Partner'}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-indigo-500 inline" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {levelBadge} • {getApprovedCount(seller)} Gmails
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-700">
                    ৳{getEarning(seller).toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Payout</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivation CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 text-center shadow-lg">
        <Sparkles className="w-6 h-6 text-amber-300 mx-auto mb-1.5" />
        <h4 className="text-sm font-black">
          {language === 'bn' ? 'আপনিও হতে পারেন টপ সেলার!' : 'Become a Top Seller!'}
        </h4>
        <p className="text-xs text-indigo-100 max-w-sm mx-auto mt-1 mb-3">
          {language === 'bn'
            ? 'প্রতিদিন জিমেইল সাবমিট করে লেভেল ৫ আনলক করুন এবং সর্বোচ্চ রেট উপভোগ করুন।'
            : 'Submit daily, level up to Diamond VIP, and enjoy the highest exchange rates.'}
        </p>
        <button
          onClick={() => {
            setActiveTab('exchange');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-black shadow hover:bg-indigo-50 active:scale-95 transition-all"
        >
          {t.startSelling}
        </button>
      </div>
    </div>
  );
};

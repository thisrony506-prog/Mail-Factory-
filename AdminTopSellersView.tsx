import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { db } from './firebase';
import { ref, set } from 'firebase/database';
import { TopSellerItem } from './types';
import { hapticFeedback } from './haptics';
import { uploadToImgBB } from './imgbb';
import {
  Trophy,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Medal,
  RefreshCw,
  Edit3,
  Image,
  UploadCloud,
} from 'lucide-react';

const ADMIN_EMAILS = ['gmrony135@gmail.com', 'mailfactorybd@gmail.com'];

export const AdminTopSellersView: React.FC = () => {
  const { user, topSellers, allUsers, setActiveTab, language } = useApp();
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const [sellers, setSellers] = useState<TopSellerItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedUserUid, setSelectedUserUid] = useState<string>('');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingIndex(index);
      hapticFeedback.light();
      const imageUrl = await uploadToImgBB(file);
      handleSellerChange(index, 'photoURL', imageUrl);
      hapticFeedback.success();
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      alert('Image upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingIndex(null);
    }
  };

  useEffect(() => {
    const validTop = (topSellers || []).filter(
      (s) => s && !s.uid?.startsWith('seller_') && s.username !== 'Tanvir Hossain' && s.username !== 'Shakil Ahmed'
    );
    if (validTop.length > 0) {
      setSellers(
        validTop.map((s, idx) => ({
          ...s,
          rank: idx + 1,
          totalEarnings: Number(s.totalEarnings) || Number(s.balance) || 0,
          manual_approved_count: Number(s.manual_approved_count) || Number(s.total_submitted) || 0,
          badge: s.badge || (idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner'),
        }))
      );
    } else if (allUsers && allUsers.length > 0) {
      // Initialize from registered real users
      autoFillFromUsers();
    } else {
      setSellers([]);
    }
  }, [topSellers, allUsers]);

  const autoFillFromUsers = () => {
    hapticFeedback.light();
    const sorted = [...allUsers]
      .filter((u) => u && !u.uid?.startsWith('seller_') && u.username !== 'Tanvir Hossain' && u.username !== 'Shakil Ahmed')
      .sort((a, b) => {
        const earnA = Number(a.totalEarnings) || (Number(a.balance || 0) + Number(a.total_withdrawn || 0)) || Number(a.balance || 0);
        const earnB = Number(b.totalEarnings) || (Number(b.balance || 0) + Number(b.total_withdrawn || 0)) || Number(b.balance || 0);
        return earnB - earnA;
      })
      .slice(0, 10);

    const filled: TopSellerItem[] = sorted.map((u, idx) => ({
      uid: u.uid || `user_${idx + 1}`,
      username: u.username || u.email?.split('@')[0] || `Seller ${idx + 1}`,
      email: u.email || '',
      photoURL: u.photoURL || '',
      totalEarnings: Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0),
      balance: Number(u.balance) || 0,
      manual_approved_count: Number(u.manual_approved_count) || Number(u.total_submitted) || 0,
      total_submitted: Number(u.total_submitted) || 0,
      badge: idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner',
      rank: idx + 1,
    }));

    setSellers(filled);
  };

  const handleSellerChange = (index: number, field: keyof TopSellerItem, value: any) => {
    setSellers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAddSlot = () => {
    if (sellers.length >= 10) return;
    hapticFeedback.light();
    setSellers((prev) => [
      ...prev,
      {
        uid: `seller_${Date.now()}`,
        username: `New Seller ${prev.length + 1}`,
        totalEarnings: 1000,
        manual_approved_count: 25,
        badge: 'Gold Partner',
        rank: prev.length + 1,
      },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    hapticFeedback.medium();
    setSellers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    hapticFeedback.light();
    setSellers((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === sellers.length - 1) return;
    hapticFeedback.light();
    setSellers((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handlePickUser = (index: number, userUid: string) => {
    const selected = allUsers.find((u) => u.uid === userUid);
    if (!selected) return;
    hapticFeedback.light();
    const earn = Number(selected.totalEarnings) || (Number(selected.balance || 0) + Number(selected.total_withdrawn || 0)) || Number(selected.balance || 0);
    const count = Number(selected.manual_approved_count) || Number(selected.total_submitted) || 0;

    setSellers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        uid: selected.uid,
        username: selected.username || selected.email?.split('@')[0] || 'Seller',
        email: selected.email || '',
        photoURL: selected.photoURL || '',
        totalEarnings: earn,
        balance: Number(selected.balance) || 0,
        manual_approved_count: count,
      };
      return updated;
    });
  };

  const handleSaveToDatabase = async () => {
    if (!isAdmin) {
      alert('Only admins can save Top Sellers.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    hapticFeedback.medium();

    try {
      const cleanList = sellers.slice(0, 10).map((s, index) => ({
        uid: s.uid || `seller_${index + 1}`,
        username: s.username?.trim() || `Seller ${index + 1}`,
        email: s.email || '',
        photoURL: s.photoURL || '',
        totalEarnings: Number(s.totalEarnings) || 0,
        balance: Number(s.balance) || 0,
        total_submitted: Number(s.total_submitted) || Number(s.manual_approved_count) || 0,
        manual_approved_count: Number(s.manual_approved_count) || 0,
        badge: s.badge || (index === 0 ? 'VIP Champion' : index < 3 ? 'Diamond VIP' : 'Gold Partner'),
        rank: index + 1,
      }));

      await set(ref(db, 'top_sellers'), cleanList);
      try {
        localStorage.setItem('mf_top_sellers_list', JSON.stringify(cleanList));
      } catch {}

      setSaveSuccess(true);
      hapticFeedback.success();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save top sellers:', err);
      alert('Error saving: ' + (err.message || 'Permission denied'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-800">Admin Access Required</h2>
        <p className="text-xs text-slate-500 mt-1">Please log in as an administrator to manage top sellers.</p>
        <button
          onClick={() => setActiveTab('profile')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-28 space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('sellers')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors"
            title="Back to Sellers"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>টপ ১০ সেলার ম্যানেজার (Admin)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              এখানে যে ১০ জন সেলার সেট করবেন, লিডারবোর্ডে হুবহু তারাই থাকবে।
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs rounded-2xl shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>টপ ১০ সেলার সফলভাবে ডাটাবেজে আপডেট হয়েছে! অ্যাপে সরাসরি লাইভ দেখাচ্ছে।</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl">
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={autoFillFromUsers}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:brightness-105 active:scale-95"
            title="Auto Populate from actual database users"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>সব রিয়েল ইউজার এক ক্লিকে আনুন</span>
          </button>

          <button
            onClick={autoFillFromUsers}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Refresh from registered database users"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>রিফ্রেশ করুন</span>
          </button>

          {sellers.length < 10 && (
            <button
              onClick={handleAddSlot}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সেলার যোগ ({sellers.length}/10)</span>
            </button>
          )}
        </div>

        <span className="text-[11px] font-bold text-indigo-900">
          সিস্টেমের রিয়েল ইউজার: <span className="font-mono text-indigo-700">{allUsers.filter(u => u && !u.uid?.startsWith('seller_')).length}</span> জন
        </span>
      </div>

      {/* Sellers List Editor */}
      <div className="space-y-3">
        {sellers.map((seller, index) => {
          const rank = index + 1;
          const isPodium = rank <= 3;
          const medals = ['👑 #1 (গোল্ড)', '🥈 #2 (সিলভার)', '🥉 #3 (ব্রোঞ্জ)'];

          return (
            <div
              key={index}
              className={`rounded-3xl border p-4 shadow-sm transition-all ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
                  : rank === 2
                  ? 'bg-gradient-to-r from-slate-50 to-slate-100/60 border-slate-300'
                  : rank === 3
                  ? 'bg-gradient-to-r from-orange-50/60 to-amber-50/40 border-orange-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 3
                        ? 'bg-orange-300 text-orange-950'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isPodium ? medals[index] : `#${rank} পজিশন`}
                  </span>

                  {seller.username && (
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                      {seller.username}
                    </span>
                  )}
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sellers.length - 1}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveSlot(index)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors ml-1"
                    title="Remove Slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Select from Registered DB User */}
              {allUsers.length > 0 && (
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ডাটাবেজ থেকে রিয়েল ইউজার সিলেক্ট করুন (অপশনাল):
                  </label>
                  <select
                    value={seller.uid || ''}
                    onChange={(e) => handlePickUser(index, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="">-- কাস্টম টাইপ করুন অথবা ইউজার বাছুন --</option>
                    {allUsers.map((u) => {
                      const earn = Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0);
                      return (
                        <option key={u.uid} value={u.uid}>
                          {u.username || u.email} (৳{earn.toLocaleString('en-US')}, {u.manual_approved_count || 0} Gmails)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5">
                    সেলার নাম / ইউজারনেম:
                  </label>
                  <input
                    type="text"
                    value={seller.username || ''}
                    onChange={(e) => handleSellerChange(index, 'username', e.target.value)}
                    placeholder="সেলার নাম"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5">
                    মোট আয় (৳):
                  </label>
                  <input
                    type="number"
                    value={seller.totalEarnings || ''}
                    onChange={(e) => handleSellerChange(index, 'totalEarnings', Number(e.target.value))}
                    placeholder="৳ আয়"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-700 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5">
                    অ্যাপ্রুভড জিমেইল সংখ্যা:
                  </label>
                  <input
                    type="number"
                    value={seller.manual_approved_count || ''}
                    onChange={(e) => handleSellerChange(index, 'manual_approved_count', Number(e.target.value))}
                    placeholder="জিমেইল সংখ্যা"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5">
                    ব্যাজ / লেভেল:
                  </label>
                  <input
                    type="text"
                    value={seller.badge || ''}
                    onChange={(e) => handleSellerChange(index, 'badge', e.target.value)}
                    placeholder="VIP Champion / Diamond VIP"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Photo / Avatar / Logo Section */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3">
                <div className="shrink-0">
                  {seller.photoURL ? (
                    <img
                      src={seller.photoURL}
                      alt={seller.username || 'Seller Logo'}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold">
                      {(seller.username || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                      প্রোফাইল ছবি / লোগো URL:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={uploadingIndex === index}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>{uploadingIndex === index ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={seller.photoURL || ''}
                    onChange={(e) => handleSellerChange(index, 'photoURL', e.target.value)}
                    placeholder="https://... অথবা 'ছবি আপলোড করুন' চাপুন"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="pt-3">
        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isSaving ? 'ডাটাবেজে সেভ হচ্ছে...' : 'টপ ১০ সেলার ডাটাবেজে সেভ ও পাবলিশ করুন'}</span>
        </button>
      </div>
    </div>
  );
};

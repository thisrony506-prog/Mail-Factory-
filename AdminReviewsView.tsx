import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { firestore } from './firebase';
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShieldCheck, Check, X, Trash2, ArrowLeft } from 'lucide-react';
import { Review } from './types';
import { hapticFeedback } from './haptics';

// Replace with actual admin emails
const ADMIN_EMAILS = ['gmrony135@gmail.com', 'mailfactorybd@gmail.com'];

export const AdminReviewsView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (isAdmin) fetchAllReviews();
  }, [isAdmin]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const q = query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await setDoc(doc(firestore, 'reviews', reviewId), { status, updatedAt: Date.now() }, { merge: true });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
      hapticFeedback.success();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(firestore, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      hapticFeedback.medium();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-slate-500">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('profile')} className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Review Moderation</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4">No reviews found.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{r.userName}</span>
                    <span className="text-xs text-slate-400">({r.rating} Stars)</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{r.text}</p>
                  <div className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button onClick={() => updateStatus(r.id, 'approved')} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => updateStatus(r.id, 'rejected')} className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id)} className="p-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

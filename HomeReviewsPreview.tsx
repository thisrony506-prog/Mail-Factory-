import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { firestore } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { Star, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Review } from './types';

export const HomeReviewsPreview: React.FC = () => {
  const { setActiveTab } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        // Fetch stats if available
        try {
          const statsDoc = await getDoc(doc(firestore, 'system', 'reviewStats'));
          if (statsDoc.exists()) {
            const data = statsDoc.data();
            setAvgRating(data.avgRating || 5.0);
            setTotalCount(data.totalCount || 0);
          }
        } catch {
          // Ignore stats permission error in dev/uninitialized state
        }

        // Fetch top 2 latest reviews
        const q = query(
          collection(firestore, 'reviews'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(2)
        );
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map(d => ({ ...(d.data() as any), id: d.id } as Review)));
      } catch (err: any) {
        // If rules not yet published in console or empty, gracefully silent
        if (err?.code !== 'permission-denied') {
          console.warn("Home reviews preview status:", err?.message || err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-black text-slate-800">{avgRating.toFixed(1)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-bold">({totalCount})</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('reviews')}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {r.userPhoto ? (
                    <img src={r.userPhoto} alt={r.userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-700 text-xs flex items-center gap-1">
                    {r.userName}
                    {r.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

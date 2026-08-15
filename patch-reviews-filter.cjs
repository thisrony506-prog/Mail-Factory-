const fs = require('fs');
let code = fs.readFileSync('ReviewsView.tsx', 'utf-8');

// 1. Add filter state
const stateTarget = `const [isSubmitting, setIsSubmitting] = useState<boolean>(false);`;
const stateReplacement = `const [isSubmitting, setIsSubmitting] = useState<boolean>(false);\n  const [filterRating, setFilterRating] = useState<number | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add filter to fetchReviews
const fetchTarget = `const fetchReviews = async (isLoadMore = false) => {
    try {
      let q = query(
        collection(firestore, 'reviews'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );`;
const fetchReplacement = `const fetchReviews = async (isLoadMore = false, rating: number | null = filterRating) => {
    try {
      if (!isLoadMore) setLoading(true);
      let q;
      if (rating) {
        q = query(
          collection(firestore, 'reviews'),
          where('status', '==', 'approved'),
          where('rating', '==', rating),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      } else {
        q = query(
          collection(firestore, 'reviews'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }`;
code = code.replace(fetchTarget, fetchReplacement);

// 3. Reset hasMore when filter changes
const resetHasMoreTarget = `if (docs.length < 10) {
        setHasMore(false);
      }`;
const resetHasMoreReplacement = `if (docs.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }`;
code = code.replace(resetHasMoreTarget, resetHasMoreReplacement);

// 4. Hook dependency for filter
const effectTarget = `useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);`;
const effectReplacement = `useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews(false, filterRating);
  }, [filterRating]);`;
code = code.replace(effectTarget, effectReplacement);

// 5. Add UI for filters
const uiTarget = `<div className="space-y-4">
        <h3 className="font-black text-slate-800 px-2">Latest Reviews</h3>`;
const uiReplacement = `<div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-3">
          <h3 className="font-black text-slate-800">Latest Reviews</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setFilterRating(null)}
              className={\`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors \${filterRating === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(r => (
              <button 
                key={r}
                onClick={() => setFilterRating(r)}
                className={\`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors \${filterRating === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
              >
                {r} <Star className={\`w-3 h-3 \${filterRating === r ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}\`} />
              </button>
            ))}
          </div>
        </div>`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('ReviewsView.tsx', code);

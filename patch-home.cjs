const fs = require('fs');
let code = fs.readFileSync('HomeView.tsx', 'utf-8');

const target = `      {/* Why Choose Us */}`;
const replacement = `      {/* Customer Reviews Preview */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
        <h3 className="text-sm font-extrabold text-slate-800 mb-2 flex items-center justify-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Customer Reviews</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">See what thousands of users are saying about us.</p>
        <button 
          onClick={() => setActiveTab('reviews')}
          className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs shadow-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 mx-auto"
        >
          View All Reviews <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Why Choose Us */}`;

code = code.replace(target, replacement);

fs.writeFileSync('HomeView.tsx', code);

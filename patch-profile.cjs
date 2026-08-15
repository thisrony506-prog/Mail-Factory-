const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

const target = `{t.support} & Advanced
        </div>`;
const replacement = `{t.support} & Advanced
        </div>
        
        {user && ['gmrony135@gmail.com', 'mailfactorybd@gmail.com'].includes(user.email || '') && (
          <button
            onClick={() => setActiveTab('admin_reviews')}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-slate-800">Admin Review Moderation</h5>
                <span className="text-[10px] text-slate-400 font-medium">Approve or reject customer reviews</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}`;

code = code.replace(target, replacement);
fs.writeFileSync('ProfileView.tsx', code);

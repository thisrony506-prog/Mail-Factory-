const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const importReplacement = `import { ReviewsView } from './ReviewsView';\nimport { AdminReviewsView } from './AdminReviewsView';`;
code = code.replace(`import { ReviewsView } from './ReviewsView';`, importReplacement);

const routeReplacement = `{activeTab === 'reviews' && <ReviewsView />}\n        {activeTab === 'admin_reviews' && <AdminReviewsView />}`;
code = code.replace(`{activeTab === 'reviews' && <ReviewsView />}`, routeReplacement);

fs.writeFileSync('App.tsx', code);

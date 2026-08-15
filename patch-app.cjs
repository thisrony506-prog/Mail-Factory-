const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const importTarget = `import { AboutView } from './AboutView';`;
const importReplacement = `import { AboutView } from './AboutView';\nimport { ReviewsView } from './ReviewsView';`;
code = code.replace(importTarget, importReplacement);

const routeTarget = `{activeTab === 'withdraw' && <WithdrawView />}`;
const routeReplacement = `{activeTab === 'withdraw' && <WithdrawView />}\n        {activeTab === 'reviews' && <ReviewsView />}`;
code = code.replace(routeTarget, routeReplacement);

fs.writeFileSync('App.tsx', code);

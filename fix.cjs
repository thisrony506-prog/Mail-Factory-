const fs = require('fs');

let homeCode = fs.readFileSync('HomeView.tsx', 'utf-8');
const importsToAdd = `import { SEO } from './SEO';
import { HomeReviewsPreview } from './HomeReviewsPreview';\n`;

// Insert after other imports
homeCode = homeCode.replace(`import { PWAInstallBanner } from './PWAInstallBanner';`, `import { PWAInstallBanner } from './PWAInstallBanner';\n${importsToAdd}`);
fs.writeFileSync('HomeView.tsx', homeCode);

let reviewCode = fs.readFileSync('ReviewsView.tsx', 'utf-8');
// Fix spread type
reviewCode = reviewCode.replace(`const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Review));`, `const docs = snapshot.docs.map(d => ({ ...(d.data() as any), id: d.id } as Review));`);
fs.writeFileSync('ReviewsView.tsx', reviewCode);


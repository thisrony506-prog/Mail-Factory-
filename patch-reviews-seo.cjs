const fs = require('fs');
let code = fs.readFileSync('ReviewsView.tsx', 'utf-8');

const importReplacement = `import { SEO } from './SEO';\nimport { Star,`;
code = code.replace(`import { Star,`, importReplacement);

const returnReplacement = `  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-in fade-in">
      <SEO 
        title="Customer Reviews - Mail Factory"
        description="Read real customer reviews and ratings about Mail Factory. See why thousands of users trust us for exchanging Gmail accounts."
        url="https://www.mailfectory.top/?tab=reviews"
        schemaData={totalCount > 0 ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Mail Factory",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": totalCount
          }
        } : undefined}
      />`;

code = code.replace(`  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-in fade-in">`, returnReplacement);

fs.writeFileSync('ReviewsView.tsx', code);

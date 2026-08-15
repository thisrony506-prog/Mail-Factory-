const fs = require('fs');
let code = fs.readFileSync('HomeView.tsx', 'utf-8');

const importReplacement = `import { SEO } from './SEO';\nimport {  ShieldCheck,`;
code = code.replace(`import {  ShieldCheck,`, importReplacement);

const returnReplacement = `  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      <SEO 
        title="Mail Factory - Best Gmail Exchange Platform"
        description="Exchange fresh and aged Gmail accounts for cash instantly. Bangladesh's most trusted platform with fast payment and multi-tier rewards."
        url="https://www.mailfectory.top"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Mail Factory",
          "url": "https://www.mailfectory.top",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.mailfectory.top/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />`;

code = code.replace(`  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">`, returnReplacement);

fs.writeFileSync('HomeView.tsx', code);

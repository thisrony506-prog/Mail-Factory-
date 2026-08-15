const fs = require('fs');
let code = fs.readFileSync('firebase.ts', 'utf-8');

const importTarget = `import {
  getDatabase,`;
const importReplacement = `import { getFirestore } from 'firebase/firestore';\nimport {
  getDatabase,`;

code = code.replace(importTarget, importReplacement);

const exportTarget = `export const db: Database = getDatabase(app);`;
const exportReplacement = `export const db: Database = getDatabase(app);\nexport const firestore = getFirestore(app);`;

code = code.replace(exportTarget, exportReplacement);

fs.writeFileSync('firebase.ts', code);

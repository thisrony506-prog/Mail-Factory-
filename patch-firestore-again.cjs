const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const target = `      allow read: if resource.data.status == 'approved' || (request.auth != null && request.auth.uid == userId);
      allow list: if request.query.limit <= 20 && resource.data.status == 'approved';`;

const replacement = `      allow get: if resource.data.status == 'approved' || (request.auth != null && request.auth.uid == userId);
      allow list: if resource.data.status == 'approved';`;

code = code.replace(target, replacement);
fs.writeFileSync('firestore.rules', code);

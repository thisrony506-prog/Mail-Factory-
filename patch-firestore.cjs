const fs = require('fs');

const rulesTarget = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews Collection
    match /reviews/{userId} {
      // Anyone can read approved reviews. User can read their own.
      allow read: if resource.data.status == 'approved' || request.auth.uid == userId;`;

const rulesReplacement = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews Collection
    match /reviews/{userId} {
      // Anyone can read approved reviews. User can read their own.
      // We allow list queries where status == 'approved'
      allow read: if resource.data.status == 'approved' || (request.auth != null && request.auth.uid == userId);
      allow list: if request.query.limit <= 20 && resource.data.status == 'approved';`;

let rulesCode = fs.readFileSync('firestore.rules', 'utf-8');
rulesCode = rulesCode.replace(rulesTarget, rulesReplacement);
fs.writeFileSync('firestore.rules', rulesCode);

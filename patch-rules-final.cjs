const fs = require('fs');

const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email != null &&
             (request.auth.token.email == 'gmrony135@gmail.com' || request.auth.token.email == 'mailfactorybd@gmail.com');
    }

    match /reviews/{userId} {
      // For single document fetch
      allow get: if isAdmin() || resource.data.status == 'approved' || (request.auth != null && request.auth.uid == userId);
      
      // For collection queries
      allow list: if isAdmin() || resource.data.status == 'approved';
      
      allow create: if request.auth != null 
                    && request.auth.uid == userId 
                    && request.resource.data.status == 'pending'
                    && request.resource.data.rating >= 1 
                    && request.resource.data.rating <= 5;
                    
      allow update: if isAdmin() || (
                      request.auth != null 
                      && request.auth.uid == userId 
                      && request.resource.data.status == 'pending'
                      && request.resource.data.rating >= 1 
                      && request.resource.data.rating <= 5
                    );
                    
      allow delete: if isAdmin() || (request.auth != null && request.auth.uid == userId);
    }

    match /system/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
`;

fs.writeFileSync('firestore.rules', rulesCode);

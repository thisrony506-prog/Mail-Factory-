const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const target = `const userRef = ref(db, \`users/\${currUser.uid}\`);`;
const replacement = `const userRef = ref(db, \`users/\${currUser.uid}\`);
          const notifsRef = ref(db, \`users/\${currUser.uid}/notifications\`);
          
          const unsubNotifs = onValue(notifsRef, (snap) => {
            if (snap.exists()) {
              const data = snap.val();
              const fbNotifs = Object.entries(data).map(([key, val]) => ({
                ...(val as any),
                id: key,
              }));
              
              setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const newNotifs = fbNotifs.filter(n => !existingIds.has(n.id));
                if (newNotifs.length > 0) {
                  const updated = [...newNotifs, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
                  localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
                  return updated;
                }
                return prev;
              });
            }
          });
`;

code = code.replace(target, replacement);

fs.writeFileSync('AppContext.tsx', code);

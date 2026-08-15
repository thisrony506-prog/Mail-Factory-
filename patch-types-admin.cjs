const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf-8');

const target = `export type ActiveTab = 'home' | 'exchange' | 'history' | 'sellers' | 'profile' | 'withdraw' | 'privacy' | 'about' | 'reviews';`;
const replacement = `export type ActiveTab = 'home' | 'exchange' | 'history' | 'sellers' | 'profile' | 'withdraw' | 'privacy' | 'about' | 'reviews' | 'admin_reviews';`;
code = code.replace(target, replacement);

fs.writeFileSync('types.ts', code);

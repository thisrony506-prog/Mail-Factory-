const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf-8');

const target = `export type Language = 'bn' | 'en';`;
const replacement = `export type ActiveTab = 'home' | 'exchange' | 'history' | 'sellers' | 'profile' | 'withdraw' | 'privacy' | 'about' | 'reviews';
export type Language = 'bn' | 'en';

export interface Review {
  id: string; // Document ID (usually same as userId)
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt: number;
  isVerified?: boolean;
}
`;

code = code.replace(`export type ActiveTab = 'home' | 'exchange' | 'history' | 'sellers' | 'profile' | 'withdraw' | 'privacy' | 'about';`, ``);
code = code.replace(target, replacement);

fs.writeFileSync('types.ts', code);

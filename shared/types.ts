export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface CTFUser {
  id: string;
  username: string;
  email: string;
  score: number;
  solvedChallenges: string[];
  isAdmin: boolean;
  isApproved: boolean;
  passwordHash: string;
  joinedAt: number;
}
export type ChallengeCategory = 'ZTNA' | 'SWG' | 'CASB' | 'WAAP' | 'Network' | 'Identity' | 'DLP';
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  flag?: string; // Optional because we strip it for players
  category: ChallengeCategory;
  isVisible: boolean;
}
export interface SubmissionResponse {
  correct: boolean;
  message: string;
  newScore?: number;
}
export interface LeaderboardEntry {
  username: string;
  score: number;
  solvedCount: number;
  rank: number;
}
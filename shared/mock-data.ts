import type { CTFUser, Challenge } from './types';
export const MOCK_USERS: CTFUser[] = [
  {
    id: 'admin-id',
    username: 'orange_admin',
    email: 'admin@cloudflare.com',
    score: 0,
    solvedChallenges: [],
    isAdmin: true,
    isApproved: true,
    passwordHash: '00000000000000000000000000000000:mock_hash_admin',
    joinedAt: Date.now()
  },
  {
    id: 'player-1',
    username: 'flare_runner',
    email: 'flare_runner@example.com',
    score: 500,
    solvedChallenges: ['ch1'],
    isAdmin: false,
    isApproved: true,
    passwordHash: '00000000000000000000000000000000:mock_hash_player',
    joinedAt: Date.now() - 86400000
  }
];
export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'ch1',
    title: 'Warp Speed',
    description: 'Install the WARP client and connect to the Cloudflare network. What is the public IP address of the Cloudflare Gateway?',
    points: 500,
    flag: 'CF{warp_connected_1337}',
    category: 'ZTNA',
    isVisible: true
  },
  {
    id: 'ch2',
    title: 'Tunnel Vision',
    description: 'Expose a local service using cloudflared. What is the default hostname provided by Cloudflare for your tunnel?',
    points: 750,
    flag: 'CF{tunnel_expert_2024}',
    category: 'Network',
    isVisible: true
  },
  {
    id: 'ch3',
    title: 'Access Denied',
    description: 'Configure an Access Policy to block everyone except specific emails. Find the policy ID in the dashboard audit logs.',
    points: 1000,
    flag: 'CF{zero_trust_hero}',
    category: 'ZTNA',
    isVisible: true
  },
  {
    id: 'ch4',
    title: 'Gatekeeper',
    description: 'Set up an HTTP policy to inspect SSL traffic. What is the name of the root certificate used by Gateway?',
    points: 600,
    flag: 'CF{gateway_inspector}',
    category: 'SWG',
    isVisible: true
  },
  {
    id: 'ch5',
    title: 'Secret Agent',
    description: 'Use a Device Posture check to verify disk encryption. What is the status code returned when the check fails?',
    points: 800,
    flag: 'CF{posture_perfect}',
    category: 'ZTNA',
    isVisible: true
  },
  {
    id: 'ch6',
    title: 'Data Leaks',
    description: 'Create a DLP profile to detect credit card numbers. What is the regex used for Visa cards in the predefined list?',
    points: 1200,
    flag: 'CF{dlp_master_99}',
    category: 'DLP',
    isVisible: true
  },
  {
    id: 'ch7',
    title: 'Shadow IT',
    description: 'Use CASB to find a security risk in a connected SaaS app. What is the finding ID?',
    points: 900,
    flag: 'CF{casb_finder_x}',
    category: 'CASB',
    isVisible: true
  },
  {
    id: 'ch8',
    title: 'Magic Wand',
    description: 'Deploy Magic Transit for a test IP. What is the Anycast IP address assigned to your account?',
    points: 1500,
    flag: 'CF{magic_transit_wand}',
    category: 'Network',
    isVisible: true
  },
  {
    id: 'ch9',
    title: 'The Shield',
    description: 'Enable WAF Managed Rules. Which rule ID blocks common Log4j attacks?',
    points: 1100,
    flag: 'CF{waf_defender_01}',
    category: 'WAAP',
    isVisible: true
  },
  {
    id: 'ch10',
    title: 'Identity Crisis',
    description: 'Federate an external IdP with Cloudflare Access. What is the SAML entity ID?',
    points: 1000,
    flag: 'CF{idp_unlocked}',
    category: 'Identity',
    isVisible: true
  },
  {
    id: 'ch11',
    title: 'Bot Slayer',
    description: 'Analyze bot traffic in the Analytics tab. What is the Bot Score for verified search engines?',
    points: 700,
    flag: 'CF{bot_score_expert}',
    category: 'WAAP',
    isVisible: true
  },
  {
    id: 'ch12',
    title: 'Orange Cloud',
    description: 'Find the hidden flag in the Cloudflare Page source of this CTF site!',
    points: 300,
    flag: 'CF{orange_cloud_power}',
    category: 'Network',
    isVisible: true
  }
];
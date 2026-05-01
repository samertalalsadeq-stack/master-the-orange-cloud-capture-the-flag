import { IndexedEntity, Env } from "./core-utils";
import type { CTFUser, Challenge } from "@shared/types";
import { MOCK_CHALLENGES, MOCK_USERS } from "@shared/mock-data";
export class CTFUserEntity extends IndexedEntity<CTFUser> {
  static readonly entityName = "ctf-user";
  static readonly indexName = "ctf-users";
  static readonly initialState: CTFUser = { 
    id: "", 
    username: "", 
    score: 0, 
    solvedChallenges: [], 
    isAdmin: false, 
    joinedAt: 0 
  };
  static seedData = MOCK_USERS;
  async submitFlag(env: Env, challengeId: string, flag: string): Promise<{ correct: boolean; message: string }> {
    const user = await this.getState();
    if (user.solvedChallenges.includes(challengeId)) {
      return { correct: false, message: "Challenge already solved!" };
    }
    const challengeEntity = new ChallengeEntity(env, challengeId);
    if (!await challengeEntity.exists()) {
      return { correct: false, message: "Challenge not found!" };
    }
    const challenge = await challengeEntity.getState();
    if (challenge.flag === flag) {
      await this.mutate(s => ({
        ...s,
        score: s.score + challenge.points,
        solvedChallenges: [...s.solvedChallenges, challengeId]
      }));
      return { correct: true, message: "Correct! Points added." };
    }
    return { correct: false, message: "Incorrect flag. Try again!" };
  }
}
export class ChallengeEntity extends IndexedEntity<Challenge> {
  static readonly entityName = "challenge";
  static readonly indexName = "challenges";
  static readonly initialState: Challenge = { 
    id: "", 
    title: "", 
    description: "", 
    points: 0, 
    flag: "", 
    category: "Network", 
    isVisible: true 
  };
  static seedData = MOCK_CHALLENGES;
}
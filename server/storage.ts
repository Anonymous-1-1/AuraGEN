import {
  users,
  posts,
  timeCapsules,
  moodCircles,
  circleMembers,
  vibes,
  auraActivities,
  globalMoodStats,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type TimeCapsule,
  type InsertTimeCapsule,
  type MoodCircle,
  type InsertMoodCircle,
  type Vibe,
  type InsertVibe,
  type AuraActivity,
  type InsertAuraActivity,
  type GlobalMoodStat,
  type MoodType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByMood(mood: MoodType, limit?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number): Promise<Post[]>;
  getPostsByLocation(country?: string, region?: string, limit?: number): Promise<Post[]>;
  
  // Time capsule operations
  createTimeCapsule(capsule: InsertTimeCapsule): Promise<TimeCapsule>;
  getUserTimeCapsules(userId: string): Promise<TimeCapsule[]>;
  getUnlockedCapsules(userId: string): Promise<TimeCapsule[]>;
  unlockTimeCapsule(id: string): Promise<TimeCapsule>;
  getCommunityCapsulesReadyToUnlock(limit?: number): Promise<TimeCapsule[]>;
  
  // Mood circle operations
  createMoodCircle(circle: InsertMoodCircle): Promise<MoodCircle>;
  getMoodCircles(mood?: MoodType, limit?: number): Promise<MoodCircle[]>;
  joinMoodCircle(circleId: string, userId: string): Promise<void>;
  leaveMoodCircle(circleId: string, userId: string): Promise<void>;
  
  // Vibe operations
  addVibe(vibe: InsertVibe): Promise<Vibe>;
  removeVibe(postId: string, userId: string): Promise<void>;
  getPostVibes(postId: string): Promise<Vibe[]>;
  
  // Aura activities
  addAuraActivity(activity: InsertAuraActivity): Promise<AuraActivity>;
  getUserAuraActivities(userId: string, limit?: number): Promise<AuraActivity[]>;
  
  // Global mood stats
  updateGlobalMoodStats(mood: MoodType, country?: string, region?: string): Promise<void>;
  getGlobalMoodStats(date?: Date): Promise<GlobalMoodStat[]>;
  getMoodTrendsByRegion(country?: string): Promise<GlobalMoodStat[]>;
  
  // File upload helpers
  uploadImage(file: Buffer, filename: string): Promise<string>;
  uploadAudio(file: Buffer, filename: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    
    // Award aura points for sharing experience
    await this.addAuraActivity({
      userId: post.userId,
      type: 'shared_experience',
      points: 10,
      description: 'Shared a new experience',
    });
    
    // Update global mood stats
    if (post.location) {
      await this.updateGlobalMoodStats(post.mood, post.location);
    }
    
    return newPost;
  }

  async getPosts(limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.isAnonymous, false))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostsByMood(mood: MoodType, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(eq(posts.mood, mood), eq(posts.isAnonymous, false)))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostsByUser(userId: string, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostsByLocation(country?: string, region?: string, limit = 20): Promise<Post[]> {
    let query = db.select().from(posts).where(eq(posts.isAnonymous, false));
    
    if (country) {
      query = query.where(sql`${posts.location} ILIKE ${`%${country}%`}`);
    }
    
    return await query.orderBy(desc(posts.createdAt)).limit(limit);
  }

  // Time capsule operations
  async createTimeCapsule(capsule: InsertTimeCapsule): Promise<TimeCapsule> {
    const [newCapsule] = await db.insert(timeCapsules).values(capsule).returning();
    
    // Award aura points for creating time capsule
    await this.addAuraActivity({
      userId: capsule.userId,
      type: 'time_capsule',
      points: 15,
      description: 'Created a time capsule',
    });
    
    return newCapsule;
  }

  async getUserTimeCapsules(userId: string): Promise<TimeCapsule[]> {
    return await db
      .select()
      .from(timeCapsules)
      .where(eq(timeCapsules.userId, userId))
      .orderBy(desc(timeCapsules.createdAt));
  }

  async getUnlockedCapsules(userId: string): Promise<TimeCapsule[]> {
    return await db
      .select()
      .from(timeCapsules)
      .where(and(
        eq(timeCapsules.userId, userId),
        eq(timeCapsules.isOpened, true)
      ))
      .orderBy(desc(timeCapsules.openedAt));
  }

  async unlockTimeCapsule(id: string): Promise<TimeCapsule> {
    const [capsule] = await db
      .update(timeCapsules)
      .set({
        isOpened: true,
        openedAt: new Date(),
      })
      .where(eq(timeCapsules.id, id))
      .returning();
    return capsule;
  }

  async getCommunityCapsulesReadyToUnlock(limit = 10): Promise<TimeCapsule[]> {
    return await db
      .select()
      .from(timeCapsules)
      .where(and(
        eq(timeCapsules.isPublic, true),
        gte(timeCapsules.unlockDate, new Date()),
        eq(timeCapsules.isOpened, false)
      ))
      .orderBy(timeCapsules.unlockDate)
      .limit(limit);
  }

  // Mood circle operations
  async createMoodCircle(circle: InsertMoodCircle): Promise<MoodCircle> {
    const [newCircle] = await db.insert(moodCircles).values(circle).returning();
    
    // Auto-join creator to the circle
    await db.insert(circleMembers).values({
      circleId: newCircle.id,
      userId: circle.createdBy,
    });
    
    // Update member count
    await db
      .update(moodCircles)
      .set({ memberCount: 1 })
      .where(eq(moodCircles.id, newCircle.id));
    
    return newCircle;
  }

  async getMoodCircles(mood?: MoodType, limit = 20): Promise<MoodCircle[]> {
    let query = db.select().from(moodCircles);
    
    if (mood) {
      query = query.where(eq(moodCircles.mood, mood));
    }
    
    return await query.orderBy(desc(moodCircles.memberCount)).limit(limit);
  }

  async joinMoodCircle(circleId: string, userId: string): Promise<void> {
    await db.insert(circleMembers).values({
      circleId,
      userId,
    });
    
    // Update member count
    const [{ count: memberCount }] = await db
      .select({ count: count() })
      .from(circleMembers)
      .where(eq(circleMembers.circleId, circleId));
    
    await db
      .update(moodCircles)
      .set({ memberCount })
      .where(eq(moodCircles.id, circleId));
  }

  async leaveMoodCircle(circleId: string, userId: string): Promise<void> {
    await db
      .delete(circleMembers)
      .where(and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId)
      ));
    
    // Update member count
    const [{ count: memberCount }] = await db
      .select({ count: count() })
      .from(circleMembers)
      .where(eq(circleMembers.circleId, circleId));
    
    await db
      .update(moodCircles)
      .set({ memberCount })
      .where(eq(moodCircles.id, circleId));
  }

  // Vibe operations
  async addVibe(vibe: InsertVibe): Promise<Vibe> {
    const [newVibe] = await db.insert(vibes).values(vibe).returning();
    
    // Award aura points for supportive gesture
    await this.addAuraActivity({
      userId: vibe.userId,
      type: 'supportive_gesture',
      points: 5,
      description: `Sent ${vibe.type} vibe`,
    });
    
    return newVibe;
  }

  async removeVibe(postId: string, userId: string): Promise<void> {
    await db
      .delete(vibes)
      .where(and(
        eq(vibes.postId, postId),
        eq(vibes.userId, userId)
      ));
  }

  async getPostVibes(postId: string): Promise<Vibe[]> {
    return await db
      .select()
      .from(vibes)
      .where(eq(vibes.postId, postId))
      .orderBy(desc(vibes.createdAt));
  }

  // Aura activities
  async addAuraActivity(activity: InsertAuraActivity): Promise<AuraActivity> {
    const [newActivity] = await db.insert(auraActivities).values(activity).returning();
    
    // Update user's aura points
    await db
      .update(users)
      .set({
        auraPoints: sql`${users.auraPoints} + ${activity.points}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, activity.userId));
    
    return newActivity;
  }

  async getUserAuraActivities(userId: string, limit = 50): Promise<AuraActivity[]> {
    return await db
      .select()
      .from(auraActivities)
      .where(eq(auraActivities.userId, userId))
      .orderBy(desc(auraActivities.createdAt))
      .limit(limit);
  }

  // Global mood stats
  async updateGlobalMoodStats(mood: MoodType, country?: string, region?: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if stat exists for today
    const [existingStat] = await db
      .select()
      .from(globalMoodStats)
      .where(and(
        eq(globalMoodStats.mood, mood),
        eq(globalMoodStats.country, country || ''),
        gte(globalMoodStats.date, today)
      ));
    
    if (existingStat) {
      // Update existing stat
      await db
        .update(globalMoodStats)
        .set({
          count: sql`${globalMoodStats.count} + 1`,
        })
        .where(eq(globalMoodStats.id, existingStat.id));
    } else {
      // Create new stat
      await db.insert(globalMoodStats).values({
        mood,
        country: country || null,
        region: region || null,
        count: 1,
        date: today,
      });
    }
  }

  async getGlobalMoodStats(date?: Date): Promise<GlobalMoodStat[]> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(globalMoodStats)
      .where(gte(globalMoodStats.date, targetDate))
      .orderBy(desc(globalMoodStats.count));
  }

  async getMoodTrendsByRegion(country?: string): Promise<GlobalMoodStat[]> {
    let query = db.select().from(globalMoodStats);
    
    if (country) {
      query = query.where(eq(globalMoodStats.country, country));
    }
    
    return await query.orderBy(desc(globalMoodStats.count));
  }

  // File upload helpers (placeholder - would integrate with cloud storage)
  async uploadImage(file: Buffer, filename: string): Promise<string> {
    // TODO: Integrate with cloud storage service (AWS S3, Cloudinary, etc.)
    // For now, return a placeholder URL
    return `https://placeholder-storage.com/images/${filename}`;
  }

  async uploadAudio(file: Buffer, filename: string): Promise<string> {
    // TODO: Integrate with cloud storage service
    return `https://placeholder-storage.com/audio/${filename}`;
  }
}

export const storage = new DatabaseStorage();

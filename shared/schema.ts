import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  bio: text("bio"),
  location: varchar("location"),
  auraPoints: integer("aura_points").default(0),
  treeLevel: integer("tree_level").default(1),
  treeType: varchar("tree_type").default('oak'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moodEnum = pgEnum('mood_type', [
  'happy', 'stressed', 'calm', 'motivated', 'curious', 'grateful', 'excited', 'peaceful', 'energetic', 'reflective'
]);

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mood: moodEnum("mood").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  imageUrl: varchar("image_url"),
  musicUrl: varchar("music_url"),
  musicTitle: varchar("music_title"),
  location: varchar("location"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timeCapsules = pgTable("time_capsules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mood: moodEnum("mood").notNull(),
  imageUrl: varchar("image_url"),
  musicUrl: varchar("music_url"),
  musicTitle: varchar("music_title"),
  unlockDate: timestamp("unlock_date").notNull(),
  isPublic: boolean("is_public").default(false),
  isOpened: boolean("is_opened").default(false),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodCircles = pgTable("mood_circles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  mood: moodEnum("mood").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleMembers = pgTable("circle_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").references(() => moodCircles.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const vibes = pgTable("vibes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // heart, support, calm, motivation, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const auraActivities = pgTable("aura_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // shared_experience, supportive_gesture, time_capsule, global_exchange
  points: integer("points").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const globalMoodStats = pgTable("global_mood_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mood: moodEnum("mood").notNull(),
  country: varchar("country"),
  region: varchar("region"),
  count: integer("count").default(1),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  date: timestamp("date").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  timeCapsules: many(timeCapsules),
  circleMembers: many(circleMembers),
  vibes: many(vibes),
  auraActivities: many(auraActivities),
  createdCircles: many(moodCircles),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  vibes: many(vibes),
}));

export const timeCapsuleRelations = relations(timeCapsules, ({ one }) => ({
  user: one(users, {
    fields: [timeCapsules.userId],
    references: [users.id],
  }),
}));

export const moodCircleRelations = relations(moodCircles, ({ one, many }) => ({
  creator: one(users, {
    fields: [moodCircles.createdBy],
    references: [users.id],
  }),
  members: many(circleMembers),
}));

export const circleMemberRelations = relations(circleMembers, ({ one }) => ({
  circle: one(moodCircles, {
    fields: [circleMembers.circleId],
    references: [moodCircles.id],
  }),
  user: one(users, {
    fields: [circleMembers.userId],
    references: [users.id],
  }),
}));

export const vibeRelations = relations(vibes, ({ one }) => ({
  post: one(posts, {
    fields: [vibes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [vibes.userId],
    references: [users.id],
  }),
}));

export const auraActivityRelations = relations(auraActivities, ({ one }) => ({
  user: one(users, {
    fields: [auraActivities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeCapsuleSchema = createInsertSchema(timeCapsules).omit({
  id: true,
  createdAt: true,
  isOpened: true,
  openedAt: true,
});

export const insertMoodCircleSchema = createInsertSchema(moodCircles).omit({
  id: true,
  createdAt: true,
  memberCount: true,
});

export const insertVibeSchema = createInsertSchema(vibes).omit({
  id: true,
  createdAt: true,
});

export const insertAuraActivitySchema = createInsertSchema(auraActivities).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertTimeCapsule = z.infer<typeof insertTimeCapsuleSchema>;
export type TimeCapsule = typeof timeCapsules.$inferSelect;
export type InsertMoodCircle = z.infer<typeof insertMoodCircleSchema>;
export type MoodCircle = typeof moodCircles.$inferSelect;
export type InsertVibe = z.infer<typeof insertVibeSchema>;
export type Vibe = typeof vibes.$inferSelect;
export type InsertAuraActivity = z.infer<typeof insertAuraActivitySchema>;
export type AuraActivity = typeof auraActivities.$inferSelect;
export type GlobalMoodStat = typeof globalMoodStats.$inferSelect;

export const MOOD_TYPES = [
  'happy', 'stressed', 'calm', 'motivated', 'curious', 'grateful', 'excited', 'peaceful', 'energetic', 'reflective'
] as const;

export type MoodType = typeof MOOD_TYPES[number];

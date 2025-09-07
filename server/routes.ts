import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, authenticatedUser } from "./replitAuth"; // Assuming authenticatedUser is the new middleware
import { db } from "./db";
import { posts, users, vibes } from "@shared/schema";
import { nanoid } from "nanoid";
import { and, eq, desc } from "drizzle-orm";
import {
  insertPostSchema,
  insertTimeCapsuleSchema,
  insertMoodCircleSchema,
  insertVibeSchema,
  MOOD_TYPES,
  type MoodType,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Or a disk storage if files are saved locally temporarily
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup remains the same
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', authenticatedUser, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Get user from database using Drizzle ORM
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(userResult[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', authenticatedUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Update user using Drizzle ORM
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      // Get updated user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      res.json(userResult[0]);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Post routes (original ones are replaced by Drizzle ORM implementations below)
  // Keeping the original get /api/posts/user/:userId route as it's not explicitly replaced.
  app.get('/api/posts/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      // This might need to be refactored to use the new Drizzle ORM structure if posts are now fetched differently
      // For now, keeping it as is, assuming storage.getPostsByUser is still valid.
      const posts = await storage.getPostsByUser(userId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Time capsule routes (assuming these are still needed and not replaced by new structure)
  app.post('/api/time-capsules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const capsuleData = insertTimeCapsuleSchema.parse({
        ...req.body,
        userId,
      });

      const capsule = await storage.createTimeCapsule(capsuleData);
      res.json(capsule);
    } catch (error) {
      console.error("Error creating time capsule:", error);
      res.status(500).json({ message: "Failed to create time capsule" });
    }
  });

  app.get('/api/time-capsules/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const capsules = await storage.getUserTimeCapsules(userId);
      res.json(capsules);
    } catch (error) {
      console.error("Error fetching time capsules:", error);
      res.status(500).json({ message: "Failed to fetch time capsules" });
    }
  });

  app.get('/api/time-capsules/unlocked', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const capsules = await storage.getUnlockedCapsules(userId);
      res.json(capsules);
    } catch (error) {
      console.error("Error fetching unlocked capsules:", error);
      res.status(500).json({ message: "Failed to fetch unlocked capsules" });
    }
  });

  app.post('/api/time-capsules/:id/unlock', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.unlockTimeCapsule(id);
      res.json(capsule);
    } catch (error) {
      console.error("Error unlocking time capsule:", error);
      res.status(500).json({ message: "Failed to unlock time capsule" });
    }
  });

  app.get('/api/time-capsules/community', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const capsules = await storage.getCommunityCapsulesReadyToUnlock(limit);
      res.json(capsules);
    } catch (error) {
      console.error("Error fetching community capsules:", error);
      res.status(500).json({ message: "Failed to fetch community capsules" });
    }
  });

  // Mood circle routes (assuming these are still needed)
  app.post('/api/mood-circles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const circleData = insertMoodCircleSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const circle = await storage.createMoodCircle(circleData);
      res.json(circle);
    } catch (error) {
      console.error("Error creating mood circle:", error);
      res.status(500).json({ message: "Failed to create mood circle" });
    }
  });

  app.get('/api/mood-circles', async (req, res) => {
    try {
      const mood = req.query.mood as MoodType;
      const limit = parseInt(req.query.limit as string) || 20;

      const circles = await storage.getMoodCircles(mood, limit);
      res.json(circles);
    } catch (error) {
      console.error("Error fetching mood circles:", error);
      res.status(500).json({ message: "Failed to fetch mood circles" });
    }
  });

  app.post('/api/mood-circles/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      await storage.joinMoodCircle(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining mood circle:", error);
      res.status(500).json({ message: "Failed to join mood circle" });
    }
  });

  app.post('/api/mood-circles/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      await storage.leaveMoodCircle(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving mood circle:", error);
      res.status(500).json({ message: "Failed to leave mood circle" });
    }
  });

  // Global mood stats routes (assuming these are still needed)
  app.get('/api/mood-stats/global', async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const stats = await storage.getGlobalMoodStats(date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching global mood stats:", error);
      res.status(500).json({ message: "Failed to fetch global mood stats" });
    }
  });

  app.get('/api/mood-stats/region', async (req, res) => {
    try {
      const country = req.query.country as string;
      const stats = await storage.getMoodTrendsByRegion(country);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching regional mood stats:", error);
      res.status(500).json({ message: "Failed to fetch regional mood stats" });
    }
  });

  // Aura activities route (assuming this is still needed)
  app.get('/api/aura-activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await storage.getUserAuraActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching aura activities:", error);
      res.status(500).json({ message: "Failed to fetch aura activities" });
    }
  });

  // Upload image endpoint
  app.post('/api/upload/image', authenticatedUser, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `image_${timestamp}_${req.file.originalname}`;
      const imageUrl = `/uploads/${filename}`;

      // Save file to uploads directory (in production, use cloud storage)
      const fs = await import('fs');
      const path = await import('path');
      const uploadDir = path.default.join(process.cwd(), 'uploads');

      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }

      fs.default.writeFileSync(path.default.join(uploadDir, filename), req.file.buffer);

      res.json({
        imageUrl,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Upload audio endpoint
  app.post('/api/upload/audio', authenticatedUser, upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `audio_${timestamp}_${req.file.originalname}`;
      const audioUrl = `/uploads/${filename}`;

      // Save file to uploads directory (in production, use cloud storage)
      const fs = await import('fs');
      const path = await import('path');
      const uploadDir = path.default.join(process.cwd(), 'uploads');

      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }

      fs.default.writeFileSync(path.default.join(uploadDir, filename), req.file.buffer);

      res.json({
        audioUrl,
        message: "Audio uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ message: "Failed to upload audio" });
    }
  });

  // Send vibe to a post - NEW ROUTE (replaces original vibe routes)
  // This route uses Drizzle ORM for database interactions.
  app.post('/api/vibes', authenticatedUser, async (req, res) => {
    try {
      const { postId, type } = req.body;
      // Use req.user.id assuming req.user is populated by authenticatedUser middleware
      const userId = req.user!.id;

      // Check if user already sent a vibe to this post using Drizzle ORM
      const existingVibe = await db
        .select()
        .from(vibes)
        .where(and(eq(vibes.postId, postId), eq(vibes.userId, userId)))
        .limit(1);

      if (existingVibe.length > 0) {
        // Remove existing vibe (toggle)
        await db
          .delete(vibes)
          .where(and(eq(vibes.postId, postId), eq(vibes.userId, userId)));

        res.json({ message: "Vibe removed" });
      } else {
        // Add new vibe
        const vibeId = nanoid();
        await db.insert(vibes).values({
          id: vibeId,
          postId,
          userId,
          type,
        });

        res.json({ message: "Vibe sent successfully" });
      }
    } catch (error) {
      console.error('Send vibe error:', error);
      res.status(500).json({ message: "Failed to send vibe" });
    }
  });

  // Get posts with vibes - MODIFIED ROUTE (replaces original get /api/posts)
  // This route fetches posts and their associated vibes using Drizzle ORM.
  app.get('/api/posts', authenticatedUser, async (req, res) => {
    try {
      // Fetch posts with user details using Drizzle ORM
      const postsWithUsers = await db
        .select({
          id: posts.id,
          content: posts.content,
          mood: posts.mood,
          imageUrl: posts.imageUrl,
          musicUrl: posts.musicUrl,
          musicTitle: posts.musicTitle,
          location: posts.location,
          isAnonymous: posts.isAnonymous,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            displayName: users.displayName,
            email: users.email,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(50); // Limit changed from 20 to 50

      // Get vibes for each post concurrently
      const postsWithVibes = await Promise.all(
        postsWithUsers.map(async (post) => {
          const postVibes = await db
            .select()
            .from(vibes)
            .where(eq(vibes.postId, post.id));

          return {
            ...post,
            vibes: postVibes,
          };
        })
      );

      res.json(postsWithVibes);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Create a new post - MODIFIED ROUTE (replaces original post /api/posts)
  // This route creates a new post using Drizzle ORM.
  app.post('/api/posts', authenticatedUser, async (req, res) => {
    try {
      // Destructure properties from request body
      const { content, mood, imageUrl, musicUrl, musicTitle, location, isAnonymous } = req.body;
      const userId = req.user!.id; // Assuming req.user is populated by authenticatedUser

      // Basic validation
      if (!content || !mood) {
        return res.status(400).json({ message: "Content and mood are required" });
      }

      // Generate a new post object with a unique ID
      const postId = nanoid();
      const newPost = {
        id: postId,
        content,
        mood,
        imageUrl: imageUrl || null,
        musicUrl: musicUrl || null,
        musicTitle: musicTitle || null,
        location: location || null,
        isAnonymous: isAnonymous || false,
        userId,
        createdAt: new Date(),
      };

      // Insert the new post into the database using Drizzle ORM
      await db.insert(posts).values(newPost);

      // Fetch and return the created post with associated user information
      const createdPost = await db
        .select({
          id: posts.id,
          content: posts.content,
          mood: posts.mood,
          imageUrl: posts.imageUrl,
          musicUrl: posts.musicUrl,
          musicTitle: posts.musicTitle,
          location: posts.location,
          isAnonymous: posts.isAnonymous,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            displayName: users.displayName,
            email: users.email,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.id, postId))
        .limit(1);

      res.json(createdPost[0]);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Delete a post - MODIFIED ROUTE (replaces original delete /api/posts/:id)
  // This route deletes a post and its associated vibes using Drizzle ORM.
  app.delete('/api/posts/:id', authenticatedUser, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user!.id;

      // Check if post exists and user owns it using Drizzle ORM
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (existingPost[0].userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }

      // Delete associated vibes first to maintain data integrity
      await db.delete(vibes).where(eq(vibes.postId, postId));

      // Delete the post
      await db.delete(posts).where(eq(posts.id, postId));

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Share post route
  app.post('/api/posts/:id/share', authenticatedUser, async (req, res) => {
    try {
      const postId = req.params.id;

      // Get post details
      const postResult = await db
        .select({
          id: posts.id,
          content: posts.content,
          mood: posts.mood,
          imageUrl: posts.imageUrl,
          isAnonymous: posts.isAnonymous,
          user: {
            id: users.id,
            displayName: users.displayName,
            email: users.email,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.id, postId))
        .limit(1);

      if (postResult.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      const post = postResult[0];
      const baseUrl = req.get('host')?.includes('replit.dev')
        ? `https://${req.get('host')}`
        : `${req.protocol}://${req.get('host')}`;
      const shareUrl = `${baseUrl}/?post=${postId}`;

      const userName = post.isAnonymous ? 'Anonymous' : (post.user?.displayName || 'Aura User');

      res.json({
        shareUrl,
        title: `${userName}'s Aura Story`,
        description: post.content.slice(0, 200) + (post.content.length > 200 ? '...' : ''),
        imageUrl: post.imageUrl,
        mood: post.mood,
      });
    } catch (error) {
      console.error('Share post error:', error);
      res.status(500).json({ message: "Failed to generate share link" });
    }
  });

  // Add music to post
  app.post('/api/posts/:id/music', authenticatedUser, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user!.id;
      const { musicUrl, musicTitle } = req.body;

      // Validate music URL (YouTube or Spotify)
      const isValidUrl = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|open\.spotify\.com\/(track|playlist)\/)/i.test(musicUrl);

      if (!isValidUrl) {
        return res.status(400).json({ message: "Invalid music URL. Please use YouTube or Spotify links." });
      }

      // Check if post exists and user owns it
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (existingPost[0].userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }

      // Update post with music
      await db
        .update(posts)
        .set({ musicUrl, musicTitle })
        .where(eq(posts.id, postId));

      res.json({ message: "Music added successfully", musicUrl, musicTitle });
    } catch (error) {
      console.error('Add music error:', error);
      res.status(500).json({ message: "Failed to add music" });
    }
  });

  // Update a post - MODIFIED ROUTE (replaces original put /api/posts/:id)
  // This route updates a post's content using Drizzle ORM.
  app.put('/api/posts/:id', authenticatedUser, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user!.id;
      const { content } = req.body;

      // Validate input
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Check if post exists and user owns it using Drizzle ORM
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (existingPost[0].userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }

      // Update the post content in the database
      await db
        .update(posts)
        .set({ content })
        .where(eq(posts.id, postId));

      res.json({ message: "Post updated successfully" });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Original delete /api/posts/:id route - REPLACED by new logic above
  // Original put /api/posts/:id route - REPLACED by new logic above

  // Original addVibe route - REPLACED by new /api/vibes route
  // Original removeVibe route - REPLACED by new /api/vibes route (toggle functionality)
  // Original getPostVibes route - REPLACED by new /api/posts route which includes vibes

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle different types of real-time updates
        switch (data.type) {
          case 'join_mood_room':
            // Join a specific mood room for real-time updates
            ws.mood = data.mood;
            break;
          case 'live_mood_update':
            // Broadcast mood updates to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(JSON.stringify({
                  type: 'mood_update',
                  mood: data.mood,
                  location: data.location,
                  timestamp: new Date().toISOString(),
                }));
              }
            });
            break;
          case 'global_tree_contribution':
            // Broadcast global tree growth updates
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'tree_growth',
                  points: data.points,
                  totalContributions: data.totalContributions,
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
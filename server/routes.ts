import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Post routes
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
      });
      
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const mood = req.query.mood as MoodType;
      const location = req.query.location as string;
      
      let posts;
      if (mood && MOOD_TYPES.includes(mood)) {
        posts = await storage.getPostsByMood(mood, limit);
      } else if (location) {
        posts = await storage.getPostsByLocation(location, undefined, limit);
      } else {
        posts = await storage.getPosts(limit, offset);
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const posts = await storage.getPostsByUser(userId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns the post
      const post = await storage.getPostById(id);
      if (!post || post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deletePost(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.put('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Check if user owns the post
      const post = await storage.getPostById(id);
      if (!post || post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      
      const updatedPost = await storage.updatePost(id, updateData);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Time capsule routes
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

  // Mood circle routes
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

  // Vibe routes
  app.post('/api/vibes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vibeData = insertVibeSchema.parse({
        ...req.body,
        userId,
      });
      
      const vibe = await storage.addVibe(vibeData);
      res.json(vibe);
    } catch (error) {
      console.error("Error adding vibe:", error);
      res.status(500).json({ message: "Failed to add vibe" });
    }
  });

  app.delete('/api/vibes/:postId', isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.removeVibe(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing vibe:", error);
      res.status(500).json({ message: "Failed to remove vibe" });
    }
  });

  app.get('/api/vibes/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const vibes = await storage.getPostVibes(postId);
      res.json(vibes);
    } catch (error) {
      console.error("Error fetching vibes:", error);
      res.status(500).json({ message: "Failed to fetch vibes" });
    }
  });

  // Global mood stats routes
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

  // File upload routes
  app.post('/api/upload/image', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const imageUrl = await storage.uploadImage(req.file.buffer, req.file.originalname);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.post('/api/upload/audio', isAuthenticated, upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }
      
      const audioUrl = await storage.uploadAudio(req.file.buffer, req.file.originalname);
      res.json({ audioUrl });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ message: "Failed to upload audio" });
    }
  });

  // Aura activities route
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

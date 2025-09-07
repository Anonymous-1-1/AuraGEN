
import { type Express } from "express";
import path from "path";
import fs from "fs";

export function setupStaticFiles(app: Express) {
  // Serve uploaded files
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });
}

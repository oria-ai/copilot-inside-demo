import express from 'express';
import cors from 'cors';
import { Low, JSONFile } from 'lowdb';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Low(new JSONFile('db.json'));
await db.read();
db.data ||= { users: [], modules: [] };

// Helper to calculate module progress
function calculateModuleProgress(lessons) {
  if (!lessons || lessons.length === 0) return 0;
  const total = lessons.reduce((sum, l) => sum + (l.progress || 0), 0);
  return Math.round(total / lessons.length);
}

// Get user by email
app.get('/users/:email', (req, res) => {
  const user = db.data.users.find(u => u.email === req.params.email);
  res.json(user || null);
});

// Update lesson progress and understanding rating
app.post('/users/:email/progress', async (req, res) => {
  const { moduleId, lessonId, progress, understandingRating } = req.body;
  let user = db.data.users.find(u => u.email === req.params.email);
  if (!user) {
    user = { email: req.params.email, modules: [] };
    db.data.users.push(user);
  }
  let module = user.modules.find(m => m.moduleId === moduleId);
  if (!module) {
    module = { moduleId, lessons: [] };
    user.modules.push(module);
  }
  let lesson = module.lessons.find(l => l.lessonId === lessonId);
  if (!lesson) {
    lesson = { lessonId, progress: 0, understandingRating: null };
    module.lessons.push(lesson);
  }
  if (progress !== undefined) lesson.progress = progress;
  if (understandingRating !== undefined) lesson.understandingRating = understandingRating;
  // Update module overall progress
  module.progress = calculateModuleProgress(module.lessons);
  await db.write();
  res.json({ ok: true, user });
});

// Get module aggregate info
app.get('/modules/:moduleId', (req, res) => {
  const users = db.data.users || [];
  const moduleId = req.params.moduleId;
  let totalProgress = 0, totalUnderstanding = 0, count = 0, understandingCount = 0;
  users.forEach(user => {
    const mod = (user.modules || []).find(m => m.moduleId === moduleId);
    if (mod) {
      totalProgress += mod.progress || 0;
      count++;
      (mod.lessons || []).forEach(lesson => {
        if (lesson.understandingRating !== undefined && lesson.understandingRating !== null) {
          totalUnderstanding += lesson.understandingRating;
          understandingCount++;
        }
      });
    }
  });
  res.json({
    moduleId,
    averageProgress: count ? Math.round(totalProgress / count) : 0,
    averageUnderstanding: understandingCount ? (totalUnderstanding / understandingCount).toFixed(2) : null
  });
});

app.listen(3001, () => console.log('API running on http://localhost:3001')); 
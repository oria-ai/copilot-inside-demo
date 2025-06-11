import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

/* ---------- Users ---------- */
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, password, department, copilotLanguage, studyingLanguage, role, name } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        password,
        department,
        copilotLanguage,
        studyingLanguage,
        role,
        name
      }
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

/* ---------- Progress ---------- */
app.post("/progress", async (req: Request, res: Response) => {
  const { userId, lessonId, percent, lastActivity, lastStep } = req.body;
  const prog = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { percent, lastActivity, lastStep },
    create: { userId, lessonId, percent, lastActivity, lastStep },
  });
  res.json(prog);
});
app.get("/progress/:userId", async (req: Request, res: Response) => {
  const list = await prisma.progress.findMany({
    where: { userId: req.params.userId },
  });
  res.json(list);
});

/* ---------- Ratings ---------- */
app.post("/ratings", async (req: Request, res: Response) => {
  const { userId, lessonId, stars } = req.body;
  const rating = await prisma.rating.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { stars },
    create: { userId, lessonId, stars },
  });
  res.json(rating);
});

/* ---------- Feedback ---------- */
app.post("/feedback", async (req: Request, res: Response) => {
  const fb = await prisma.feedback.create({ data: req.body });
  res.json(fb);
});

/* ---------- Aggregates ---------- */
app.get("/stats/course/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;
  const avgRating = await prisma.rating.aggregate({
    where: { lessonId },
    _avg: { stars: true },
  });
  const avgProgress = await prisma.progress.aggregate({
    where: { lessonId },
    _avg: { percent: true },
  });
  res.json({
    lessonId,
    avgRating: avgRating._avg.stars,
    avgProgress: avgProgress._avg.percent,
  });
});

// Login endpoint
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json(user);
});

app.listen(4000, () =>
  console.log("💾  API ready on http://localhost:4000"),
);

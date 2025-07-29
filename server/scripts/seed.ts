import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create users
  await prisma.user.createMany({
    data: [
      { 
        id: 'user1', 
        email: 'oria@gmail.com', 
        password: await bcrypt.hash('1234', 10), // hash the password
        department: 'development', 
        copilotLanguage: 'hebrew', 
        studyingLanguage: 'hebrew', 
        role: 'student', 
        name: 'Oria' 
      },
      { id: 'user2', email: 'user2@example.com', password: 'pass2', department: 'digital', copilotLanguage: 'english', studyingLanguage: 'english', role: 'student', name: 'User Two' },
      { id: 'user3', email: 'user3@example.com', password: 'pass3', department: 'finance', copilotLanguage: 'hebrew', studyingLanguage: 'english', role: 'manager', name: 'User Three' },
    ]
  });

  // Create lessons (as lessonId strings)
  const lessonIds = ['lesson1', 'lesson2', 'lesson3'];

  // Create progress
  for (const userId of ['user1', 'user2', 'user3']) {
    for (const lessonId of lessonIds) {
      await prisma.progress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { percent: Math.floor(Math.random() * 101) },
        create: { userId, lessonId, percent: Math.floor(Math.random() * 101) },
      });
    }
  }

  // Create ratings
  for (const userId of ['user1', 'user2', 'user3']) {
    for (const lessonId of lessonIds) {
      await prisma.rating.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { stars: Math.floor(Math.random() * 5) + 1 },
        create: { userId, lessonId, stars: Math.floor(Math.random() * 5) + 1 },
      });
    }
  }

  // Create feedback
  for (const userId of ['user1', 'user2', 'user3']) {
    for (const lessonId of lessonIds) {
      await prisma.feedback.create({
        data: {
          userId,
          lessonId,
          comment: `Feedback for ${lessonId} by ${userId}`,
        },
      });
    }
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
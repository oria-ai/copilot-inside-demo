import Dexie, { Table } from 'dexie';

export interface User       { id: string; email: string; password: string }
export interface Progress   { id?: number; userId: string; lessonId: string; done: boolean; progress: number; understandingRating?: number }
export interface Feedback   { id?: number; userId: string; comment: string; stars: number }

class DB extends Dexie {
  users!:       Table<User, 'id'>;
  progress!:    Table<Progress, number>;
  feedback!:    Table<Feedback, number>;
  constructor() {
    super('demoDB');
    this.version(1).stores({
      users: 'id',
      progress: '++id,userId,lessonId',
      feedback: '++id,userId'
    });
    // Add default user if not present
    this.on('populate', async () => {
      await this.users.add({ id: 'oria@gmail.com', email: 'oria@gmail.com', password: '1234' });
    });
  }
}
export const db = new DB(); 
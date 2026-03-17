// Core types for the Skool-like platform

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  points: number;
  level: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  imageUrl?: string;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  parentId?: string;
  likesCount: number;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  modules: Module[];
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isLocked: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  isLocked: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration?: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'live' | 'masterclass' | 'workshop' | 'qa';
  meetingUrl?: string;
  hostId: string;
  host: User;
  attendeesCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  level: number;
  trend: 'up' | 'down' | 'stable';
}


export type UserRole = 'admin' | 'moderator' | 'member';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'achievement' | 'event';
  message: string;
  isRead: boolean;
  createdAt: Date;
  linkUrl?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'course' | 'assignment' | 'announcement' | 'system';
  isRead: boolean;
  timeAgo: string;
  date: string;
  timestamp: Date;
}
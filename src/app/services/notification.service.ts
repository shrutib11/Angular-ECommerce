import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();
  constructor() {
    // this.initializeSampleNotifications();
  }

  private initializeSampleNotifications(): void {
    const sampleNotifications: Notification[] = [
      {
        id: 1,
        title: 'New Course Material Available',
        message: 'Check out the latest lecture slides and resources for Advanced React.',
        type: 'course',
        isRead: false,
        timeAgo: '2 mins ago',
        date: 'today',
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Upcoming Assignment Deadline',
        message: "Don't forget to submit your Biology and Physics assignments by tomorrow.",
        type: 'assignment',
        isRead: false,
        timeAgo: '30 mins ago',
        date: 'today',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Important Announcement',
        message: 'Learnify is hosting a webinar on the dangers of procrastination.',
        type: 'announcement',
        isRead: false,
        timeAgo: '1 day ago',
        date: 'yesterday',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM.',
        type: 'system',
        isRead: true,
        timeAgo: '1 day ago',
        date: 'yesterday',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000)
      }
    ];

    this.notificationsSubject.next(sampleNotifications);
    this.updateUnreadCount();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  markAsRead(notificationId: number): void {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find(n => n.id === notificationId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notificationsSubject.next([...notifications]);
      this.updateUnreadCount();
    }
  }

  addNotification(notification: Omit<Notification, 'id'>): void {
    const notifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      ...notification,
      id: Date.now()
    };

    this.notificationsSubject.next([newNotification, ...notifications]);
    this.updateUnreadCount();
  }

  removeNotification(notificationId: number): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Utility method to format time
  static formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Utility method to determine date category
  static getDateCategory(timestamp: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const notificationDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

    if (notificationDate.getTime() === today.getTime()) {
      return 'today';
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return 'yesterday';
    } else {
      return 'older';
    }
  }
}

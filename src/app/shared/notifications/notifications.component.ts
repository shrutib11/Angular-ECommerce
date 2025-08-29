import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})

export class NotificationsComponent implements OnInit {
  @Input() showNotifications: boolean = false;
  @Output() closeNotifications = new EventEmitter<void>();
  @Output() notificationRead = new EventEmitter<number>();
  @Output() allNotificationsRead = new EventEmitter<void>();

  activeFilter: 'all' | 'unread' = 'all';
  filteredNotifications: Notification[] = [];

  notifications: Notification[] = [
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
      timeAgo: '2 days ago',
      date: 'yesterday',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ];

  constructor(private notificationService : NotificationService) {}

  ngOnInit() {
    this.updateFilteredNotifications();
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter = filter;
    this.updateFilteredNotifications();
  }

  onSearch(): void {
    this.updateFilteredNotifications();
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notificationRead.emit(notificationId);
      this.updateFilteredNotifications();
    }
  }

  private updateFilteredNotifications(): void {
    let filtered = this.notifications;

    // Apply read/unread filter
    if (this.activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    this.filteredNotifications = filtered;
  }

  getTotalCount(): number {
    return this.notifications.length;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getTodayNotifications(): Notification[] {
    return this.notifications.filter(n => n.date === 'today');
  }

  getYesterdayNotifications(): Notification[] {
    return this.notifications.filter(n => n.date === 'yesterday');
  }

  getFilteredTodayNotifications(): Notification[] {
    const todayNotifications = this.getTodayNotifications();
    let filtered = todayNotifications;

    // Apply search filter
    // if (this.searchText.trim()) {
    //   const searchTerm = this.searchText.toLowerCase();
    //   filtered = filtered.filter(n =>
    //     n.title.toLowerCase().includes(searchTerm) ||
    //     n.message.toLowerCase().includes(searchTerm)
    //   );
    // }

    // Apply read/unread filter
    if (this.activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }

  getFilteredYesterdayNotifications(): Notification[] {
    const yesterdayNotifications = this.getYesterdayNotifications();
    let filtered = yesterdayNotifications;

    // Apply search filter
    // if (this.searchText.trim()) {
    //   const searchTerm = this.searchText.toLowerCase();
    //   filtered = filtered.filter(n =>
    //     n.title.toLowerCase().includes(searchTerm) ||
    //     n.message.toLowerCase().includes(searchTerm)
    //   );
    // }

    // Apply read/unread filter
    if (this.activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }

  getFilteredNotifications(): Notification[] {
    return [...this.getFilteredTodayNotifications(), ...this.getFilteredYesterdayNotifications()];
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'course':
        return 'bg-info';
      case 'assignment':
        return 'bg-primary';
      case 'announcement':
        return 'bg-warning';
      case 'system':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'course':
        return 'bi bi-book';
      case 'assignment':
        return 'bi bi-file-text';
      case 'announcement':
        return 'bi bi-exclamation-circle';
      case 'system':
        return 'bi bi-gear';
      default:
        return 'bi bi-info-circle';
    }
  }

  isLastNotification(notification: Notification, notifications: Notification[]): boolean {
    return notifications.indexOf(notification) === notifications.length - 1;
  }
}

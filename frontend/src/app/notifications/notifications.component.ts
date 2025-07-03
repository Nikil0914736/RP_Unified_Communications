import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PopoverService } from '../services/popover.service';
import { AuthService } from '../services/auth.service';
import { Notification, NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  isResident = false;
  filter: 'all' | 'call' | 'reminder' | 'broadcast' = 'all';
  filteredNotifications$: Observable<Notification[]>;
  unreadAllNotificationCount$: Observable<number>;
  unreadBroadcastCount$: Observable<number>;
  selectedNotificationId: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private titleService: Title,
    private notificationService: NotificationService,
    private popoverService: PopoverService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Notifications | Unified Communications');

    this.unreadAllNotificationCount$ = this.notificationService.unreadAllNotificationCount$;
    this.unreadBroadcastCount$ = this.notificationService.unreadBroadcastCount$;

    this.authService.currentUser.subscribe(user => {
      this.isResident = user && user.role.toLowerCase() === 'resident';
    });

    this.route.queryParams.subscribe(params => {
      const tab = params.tab;
      if (tab === 'alerts') {
        this.setFilter('call');
      } else if (tab === 'broadcast') {
        this.setFilter('broadcast');
      } else if (tab === 'reminder') {
        this.setFilter('reminder');
      } else {
        this.setFilter('all');
      }
    });
  }

  setFilter(filter: 'all' | 'call' | 'reminder' | 'broadcast'): void {
    this.filter = filter;
    this.filteredNotifications$ = this.notificationService.notifications$.pipe(
      map(notifications => {
        if (filter === 'all') {
          return notifications;
        }
        return notifications.filter(n => n.type === filter);
      }),
    );
  }

  showPopover(notification: Notification): void {
    this.selectedNotificationId = notification.id;
    setTimeout(() => { this.selectedNotificationId = null; }, 300);
    if (notification.type === 'broadcast' && !notification.isRead && notification.id) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.username) {
        this.authService.markBroadcastAsRead(currentUser.username, notification.id).subscribe(() => {
          this.notificationService.markBroadcastAsRead(notification.id);
        });
      }
    }

    if (notification.type === 'broadcast') {
        this.popoverService.show({
            title: notification.title,
            content: notification.content,
            from: notification.from,
            date: notification.date,
            time: notification.time
        });
    }
  }
}

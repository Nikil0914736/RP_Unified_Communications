import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PopoverService, PopoverAction } from '../services/popover.service';
import { ToastService } from '../services/toast.service';
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
  filter: 'all' | 'call' | 'reminder' | 'broadcast' | 'offer' = 'all';
  filteredNotifications$: Observable<Notification[]>;
  unreadAllNotificationCount$: Observable<number>;
  unreadBroadcastCount$: Observable<number>;
  unreadRemindersCount$: Observable<number>;
  unreadOffersCount$: Observable<number>;
  selectedNotificationId: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private titleService: Title,
    private notificationService: NotificationService,
    private popoverService: PopoverService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Notifications | Unified Communications');

    this.unreadAllNotificationCount$ = this.notificationService.unreadAllNotificationCount$;
    this.unreadBroadcastCount$ = this.notificationService.unreadBroadcastCount$;
    this.unreadRemindersCount$ = this.notificationService.unreadRemindersCount$;
    this.unreadOffersCount$ = this.notificationService.unreadOffersCount$;

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
      } else if (tab === 'offer') {
        this.setFilter('offer');
      } else {
        this.setFilter('all');
      }
    });
  }

  setFilter(filter: 'all' | 'call' | 'reminder' | 'broadcast' | 'offer'): void {
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

    if (!notification.isRead && notification.id) {
      if (notification.type === 'broadcast') {
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.username) {
          this.authService.markBroadcastAsRead(currentUser.username, notification.id).subscribe(() => {
            this.notificationService.markBroadcastAsRead(notification.id);
          });
        }
      } else if (notification.type === 'reminder') {
        this.notificationService.markReminderAsRead(notification.id);
      } else if (notification.type === 'offer') {
        this.notificationService.markOfferAsRead(notification.id);
      }
    }

    if (notification.type === 'broadcast' || notification.type === 'reminder') {
      this.popoverService.show({
        title: notification.title,
        content: notification.content,
        from: notification.from,
        date: notification.date,
        time: notification.time
      });
    } else if (notification.type === 'offer') {
      const actions: PopoverAction[] = [
        {
          text: 'Accepted the Offer',
          style: 'primary',
          action: () => {
            this.toastService.show('You have accepted the offer.', 'success');
            this.popoverService.hide();
          }
        },
        {
          text: 'Declined',
          style: 'destructive',
          action: () => {
            this.toastService.show('You have declined the offer.', 'error');
            this.popoverService.hide();
          }
        },
        {
          text: 'Provide More Offers',
          style: 'secondary',
          action: () => {
            this.toastService.show('Your request for more offers has been sent.', 'info');
            this.popoverService.hide();
          }
        },
        {
          text: 'Contact Leasing Contact',
          style: 'contact',
          action: () => {
            this.toastService.show('A leasing contact will be in touch with you shortly.', 'info');
            this.popoverService.hide();
          }
        }
      ];

      this.popoverService.show({
        title: notification.title,
        content: notification.content,
        from: notification.from,
        date: notification.date,
        time: notification.time,
        actions
      });
    }
  }

  getIconStyle(notification: Notification): { [key: string]: any } {
    if ((this.filter === 'broadcast' || this.filter === 'reminder' || this.filter === 'offer') && notification.color) {
      return { background: notification.color };
    }
    return {};
  }
}

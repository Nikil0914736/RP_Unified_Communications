import { Injectable } from '@angular/core';
import { SignalRService, BroadcastMessage } from './signal-r.service';
import { AuthService } from './auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { generateColor } from '../utils/color-generator';

export type NotificationType = 'call' | 'message' | 'reminder' | 'broadcast' | 'follow-up';

export interface Notification {
  id?: string; // Optional because not all notifications have an ID
  type: NotificationType;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  date?: string;
  content?: string;
  from?: string;
  initials?: string;
  color?: string;
  isRead?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications$: Observable<Notification[]>;
  public unreadBroadcastCount$: Observable<number>;
  public totalBroadcastCount$: Observable<number>;
  public unreadAllNotificationCount$: Observable<number>;
  public totalAllNotificationCount$: Observable<number>;

  public unreadAlertsCount$: Observable<number>;
  public totalAlertsCount$: Observable<number>;
  public unreadRemindersCount$: Observable<number>;
  public totalRemindersCount$: Observable<number>;
  public unreadFollowUpsCount$: Observable<number>;
  public totalFollowUpsCount$: Observable<number>;

  constructor(
    private signalRService: SignalRService,
    private authService: AuthService
  ) {}

  public stop(): void {
    this.signalRService.stopConnection();
  }

  public start(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return;
    }

    this.signalRService.startConnection(currentUser.username);

    const broadcastNotifications$ = this.signalRService.messages$.pipe(
      map(messages => this.mapBroadcastsToNotifications(messages))
    );

    const allNotifications$ = broadcastNotifications$.pipe(
      startWith([]),
      shareReplay(1)
    );

    this.notifications$ = this.authService.currentUser.pipe(
      switchMap(user => {
        const isResident = user && user.role.toLowerCase() === 'resident';
        return allNotifications$.pipe(
          map(notifications => {
            if (isResident) {
              return notifications;
            }
            return notifications.filter(n => n.type !== 'broadcast');
          })
        );
      }),
      shareReplay(1)
    );

    const broadcasts$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.type === 'broadcast')),
      shareReplay(1)
    );

    this.unreadBroadcastCount$ = broadcasts$.pipe(
      map(broadcasts => broadcasts.filter(b => !b.isRead).length)
    );

    this.totalBroadcastCount$ = broadcasts$.pipe(
      map(broadcasts => broadcasts.length)
    );

    // Alerts Counts
    const alerts$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'call')), shareReplay(1));
    this.unreadAlertsCount$ = alerts$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalAlertsCount$ = alerts$.pipe(map(items => items.length));

    // Reminders Counts
    const reminders$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'reminder')), shareReplay(1));
    this.unreadRemindersCount$ = reminders$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalRemindersCount$ = reminders$.pipe(map(items => items.length));

    // Follow-ups Counts
    const followUps$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'follow-up')), shareReplay(1));
    this.unreadFollowUpsCount$ = followUps$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalFollowUpsCount$ = followUps$.pipe(map(items => items.length));



    this.unreadAllNotificationCount$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead).length),
      shareReplay(1)
    );

    this.totalAllNotificationCount$ = this.notifications$.pipe(
      map(notifications => notifications.length),
      shareReplay(1)
    );
  }

  public markBroadcastAsRead(id: string): void {
    this.signalRService.markMessageAsRead(id);
  }



  private mapBroadcastsToNotifications(messages: BroadcastMessage[]): Notification[] {
    return messages.map(msg => {
      const nameParts = msg.fullName.split(' ').filter(n => n);
      let initials = '';
      if (nameParts.length >= 3) {
        initials = nameParts.slice(0, 3).map(name => name.charAt(0)).join('');
      } else if (nameParts.length > 1) {
        initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
      } else if (nameParts.length === 1) {
        initials = nameParts[0].charAt(0);
      }

      return {
        id: msg.id,
        type: 'broadcast' as const,
        icon: 'speaker',
        title: msg.subject,
        subtitle: `From: ${msg.fullName}`,
        date: new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        content: msg.content,
        from: msg.fullName,
        initials: initials.toUpperCase(),
        color: generateColor(initials.toUpperCase()),
        isRead: msg.isRead
      };
    });
  }
}

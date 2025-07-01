import { Injectable } from '@angular/core';
import { SignalRService, BroadcastMessage } from './signal-r.service';
import { AuthService } from './auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

export interface Notification {
  type: 'call' | 'message' | 'reminder' | 'broadcast';
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  date?: string;
  content?: string;
  from?: string;
  initials?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private allNotifications$: Observable<Notification[]>;
  public notifications$: Observable<Notification[]>;
  public notificationCount$: Observable<number>;

  constructor(
    private signalRService: SignalRService,
    private authService: AuthService
  ) {
    this.signalRService.startConnection();

    const broadcastNotifications$ = this.signalRService.messages$.pipe(
      map(messages => this.mapBroadcastsToNotifications(messages))
    );

    this.allNotifications$ = broadcastNotifications$.pipe(
      startWith([]),
      shareReplay(1)
    );

    this.notifications$ = this.authService.currentUser.pipe(
      switchMap(user => {
        const isResident = user && user.role.toLowerCase() === 'resident';
        return this.allNotifications$.pipe(
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

    this.notificationCount$ = this.notifications$.pipe(
      map(notifications => notifications.length)
    );
  }

  private mapBroadcastsToNotifications(messages: BroadcastMessage[]): Notification[] {
    return messages.map(msg => {
      const nameParts = msg.fullName.split(' ').filter(n => n);
      const initials = nameParts.length > 1
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
        : nameParts[0].charAt(0);

      return {
        type: 'broadcast' as const,
        icon: 'speaker',
        title: msg.subject,
        subtitle: `From: ${msg.fullName}`,
        date: new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        content: msg.content,
        from: msg.fullName,
        initials: initials.toUpperCase(),
      };
    });
  }
}

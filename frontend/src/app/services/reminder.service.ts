import { Injectable, Injector } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Reminder } from '../reminders-list/reminders-list.component';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private hubConnection: signalR.HubConnection;
  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$: Observable<Reminder[]> = this.remindersSubject.asObservable();
  public unreadCount$: Observable<number>;

  constructor(private http: HttpClient, private injector: Injector) {
    this.unreadCount$ = this.reminders$.pipe(
      map(reminders => reminders.filter(r => !r.isRead).length)
    );
  }

  public startConnection(): void {
    const authService = this.injector.get(AuthService);
    const currentUser = authService.currentUserValue;
    if (!currentUser || this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/reminderhub?username=${currentUser.username}`, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Reminder Hub connection started'))
      .catch(err => console.error('Error while starting reminder hub connection: ' + err));

    this.hubConnection.on('ReminderHistory', (data: Reminder[]) => {
      this.remindersSubject.next(data);
    });

    this.hubConnection.on('ReceiveReminder', (data: Reminder) => {
      const currentReminders = this.remindersSubject.value;
      this.remindersSubject.next([...currentReminders, data]);
    });
  }

  public markAsRead(reminderId: string): Observable<any> {
    const authService = this.injector.get(AuthService);
    const currentUser = authService.currentUserValue;
    if (!currentUser) {
      console.error('ReminderService: markAsRead called but user is not logged in.');
      return new Observable(observer => observer.error('User not logged in'));
    }
    const payload = { username: currentUser.username, reminderId };
    console.log('ReminderService: Sending POST to /api/auth/mark-reminder-as-read with payload:', payload);
    return this.http.post(`${environment.apiUrl}/api/auth/mark-reminder-as-read`, payload);
  }

  public setReminderAsReadLocally(reminderId: string): void {
    const currentReminders = this.remindersSubject.value;
    const updatedReminders = currentReminders.map(r => {
      if (r.id === reminderId) {
        return { ...r, isRead: true };
      }
      return r;
    });
    this.remindersSubject.next(updatedReminders);
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('Reminder Hub connection stopped'))
        .catch(err => console.error('Error while stopping reminder hub connection: ' + err));
    }
  }
}

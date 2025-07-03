import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.css']
})
export class RemindersListComponent implements OnInit {
  reminders$: Observable<Notification[]>;

  constructor(
    private titleService: Title,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Reminders | Unified Communications');

    this.notificationService.start();

    this.reminders$ = this.notificationService.notifications$.pipe(
      map(notifications => notifications.filter(n => n.type === 'reminder'))
    );
  }
}

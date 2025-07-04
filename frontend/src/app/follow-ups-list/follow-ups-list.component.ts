import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-follow-ups-list',
  templateUrl: './follow-ups-list.component.html',
  styleUrls: ['./follow-ups-list.component.css']
})
export class FollowUpsListComponent implements OnInit {
  followUps$: Observable<Notification[]>;

  constructor(
    private titleService: Title,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Follow-ups | Unified Communications');



    this.followUps$ = this.notificationService.notifications$.pipe(
      map(notifications => notifications.filter(n => n.type === 'follow-up'))
    );
  }
}

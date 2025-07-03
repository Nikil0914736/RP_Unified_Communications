import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

declare var feather: any;

interface Message {
  from: string;
  subject: string;
  time: string;
  isRead: boolean;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit, AfterViewInit {

  messages: Message[] = [];

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Inbox | Unified Communications');
    // In a real application, you would fetch messages from a service here.
  }
  ngAfterViewInit(): void {
    feather.replace();
  }

}

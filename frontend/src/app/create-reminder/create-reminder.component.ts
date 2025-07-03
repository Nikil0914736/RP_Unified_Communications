import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

declare var feather: any;

@Component({
  selector: 'app-create-reminder',
  templateUrl: './create-reminder.component.html',
  styleUrls: ['./create-reminder.component.css']
})
export class CreateReminderComponent implements OnInit, AfterViewInit {

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Create Reminder | Unified Communications');
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

}

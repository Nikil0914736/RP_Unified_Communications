import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

declare var feather: any;

interface FollowUp {
  id: number;
  name: string;
  photoUrl: string;
  lastContact: string;
}

@Component({
  selector: 'app-send-follow-up',
  templateUrl: './send-follow-up.component.html',
  styleUrls: ['./send-follow-up.component.css']
})
export class SendFollowUpComponent implements OnInit, AfterViewInit {

  followUps: FollowUp[] = [
    { id: 1, name: 'John Smith', photoUrl: 'https://i.pravatar.cc/150?img=1', lastContact: '2 days ago' },
    { id: 2, name: 'Jane Doe', photoUrl: 'https://i.pravatar.cc/150?img=2', lastContact: '4 days ago' },
    { id: 3, name: 'Peter Jones', photoUrl: 'https://i.pravatar.cc/150?img=3', lastContact: '1 week ago' },
    { id: 4, name: 'Mary Williams', photoUrl: 'https://i.pravatar.cc/150?img=4', lastContact: '2 weeks ago' },
    { id: 5, name: 'David Brown', photoUrl: 'https://i.pravatar.cc/150?img=5', lastContact: '3 weeks ago' },
    { id: 6, name: 'Susan Davis', photoUrl: 'https://i.pravatar.cc/150?img=6', lastContact: '1 month ago' }
  ];

  constructor(private titleService: Title) { }

  ngOnInit(): void {
        this.titleService.setTitle('Send Follow-up | Unified Communications');
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

}

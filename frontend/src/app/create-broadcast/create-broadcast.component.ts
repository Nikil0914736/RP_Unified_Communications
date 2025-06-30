import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { SignalRService } from '../services/signal-r.service';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

declare var feather: any;

@Component({
  selector: 'app-create-broadcast',
  templateUrl: './create-broadcast.component.html',
  styleUrls: ['./create-broadcast.component.css']
})
export class CreateBroadcastComponent implements OnInit, AfterViewInit {

  model: any = {
    subject: '',
    message: '',
    targetAudience: 'All Residents'
  };

  private fullName: string;
  public userLoaded = false;

  constructor(
    private titleService: Title,
    private signalRService: SignalRService,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Create Broadcast | Unified Communications');
    this.signalRService.startConnection();
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.fullName = user.fullName;
        this.userLoaded = true;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.signalRService.broadcastMessage(this.model.subject, this.model.message, this.fullName)
      .then(() => {
        console.log('Broadcast submitted:', this.model);
        this.alertService.success('Broadcast sent successfully!');
        form.resetForm({
          subject: '',
          message: '',
          targetAudience: 'All Residents'
        });
      })
      .catch(err => {
        console.error('Error sending broadcast:', err);
        this.alertService.error('Failed to send broadcast. Please try again.');
      });
  }

  ngAfterViewInit(): void {
    feather.replace();
  }
}

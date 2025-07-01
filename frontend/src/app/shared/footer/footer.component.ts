import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

declare var feather: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewInit {
  isLeasingConsultant = false;
  isResident = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLeasingConsultant = user && user.role.toLowerCase() === 'leasing consultant';
      this.isResident = user && user.role.toLowerCase() === 'resident';
    });
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

}

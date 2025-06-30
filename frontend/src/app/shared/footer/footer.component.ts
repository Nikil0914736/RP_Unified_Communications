import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

declare var feather: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewInit {
  isAdmin = false;
  isClient = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAdmin = user && user.role.toLowerCase() === 'admin';
      this.isClient = user && user.role.toLowerCase() === 'client';
    });
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

}

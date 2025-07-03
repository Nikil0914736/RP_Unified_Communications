import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateBroadcastComponent } from './create-broadcast/create-broadcast.component';
import { SettingsComponent } from './settings/settings.component';
import { SendFollowUpComponent } from './send-follow-up/send-follow-up.component';
import { InboxComponent } from './inbox/inbox.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CreateReminderComponent } from './create-reminder/create-reminder.component';
import { BroadcastsListComponent } from './broadcasts-list/broadcasts-list.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { AlertComponent } from './alert/alert.component';
import { PopoverComponent } from './popover/popover.component';
import { FeatherIconComponent } from './shared/feather-icon/feather-icon.component';
import { RemindersListComponent } from './reminders-list/reminders-list.component';
import { FollowUpsListComponent } from './follow-ups-list/follow-ups-list.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CreateBroadcastComponent,
    SettingsComponent,
    SendFollowUpComponent,
    InboxComponent,
    NotificationsComponent,
    CreateReminderComponent,
    BroadcastsListComponent,
    FooterComponent,
    HeaderComponent,
    ForgotPasswordComponent,
    RegistrationComponent,
    AlertComponent,
    PopoverComponent,
    FeatherIconComponent,
    RemindersListComponent,
    FollowUpsListComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { LeasingConsultantGuard } from './guards/leasing-consultant.guard';
import { ResidentGuard } from './guards/resident.guard';
import { CreateBroadcastComponent } from './create-broadcast/create-broadcast.component';
import { SettingsComponent } from './settings/settings.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { FollowUpsComponent } from './follow-ups/follow-ups.component';
import { InboxComponent } from './inbox/inbox.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReminderComponent } from './reminder/reminder.component';
import { BroadcastsListComponent } from './broadcasts-list/broadcasts-list.component';

const routes: Routes = [
  { path: 'reminders', component: ReminderComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'inbox', component: InboxComponent, canActivate: [AuthGuard] },
  { path: 'follow-ups', component: FollowUpsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'broadcast', component: CreateBroadcastComponent, canActivate: [AuthGuard, LeasingConsultantGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'broadcasts', component: BroadcastsListComponent, canActivate: [AuthGuard, ResidentGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

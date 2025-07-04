import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Offer } from '../inbox/inbox.component';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private hubConnection: signalR.HubConnection;
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  public offers$ = this.offersSubject.asObservable();
  public unreadCount$: Observable<number>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.unreadCount$ = combineLatest([
      this.offers$,
      this.authService.currentUser
    ]).pipe(
      map(([offers, currentUser]) => {
        if (!currentUser || !offers) {
          return 0;
        }
        const readOfferIds = new Set(currentUser.readOfferIds || []);
        return offers.filter(offer => !readOfferIds.has(offer.guid)).length;
      })
    );

    this.authService.currentUser.subscribe(currentUser => {
      if (currentUser && (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected)) {
        this.startConnection(currentUser);
      } else if (!currentUser && this.hubConnection) {
        this.stopConnection();
      }
    });
  }

  private startConnection(currentUser: any): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/offerhub?username=${currentUser.username}`, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Offer Hub connection started'))
      .catch(err => console.error('Error while starting offer hub connection: ' + err));

    this.hubConnection.on('OfferHistory', (data: Offer[]) => {
      this.offersSubject.next(data);
    });

    this.hubConnection.on('ReceiveOffer', (data: Offer) => {
      const currentOffers = this.offersSubject.value;
      this.offersSubject.next([...currentOffers, data]);
    });
  }

  sendNewOffer(offerDetails: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Renewal/NewOffer`, offerDetails);
  }

  markOfferAsRead(username: string, offerId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/mark-offer-as-read`, { username, offerId });
  }

  private stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('Offer Hub connection stopped');
          this.offersSubject.next([]); // Clear offers on logout
        })
        .catch(err => console.error('Error while stopping offer hub connection: ' + err));
    }
  }
}

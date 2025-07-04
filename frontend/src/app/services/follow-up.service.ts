import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private apiUrl = `${environment.apiUrl}/api/Renewal`;

  constructor(private http: HttpClient) { }

  sendNewOffer(offerDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/NewOffer`, offerDetails);
  }
}

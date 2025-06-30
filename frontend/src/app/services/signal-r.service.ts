import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BroadcastMessage {
  subject: string;
  content: string;
  fullName: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private messagesSubject = new BehaviorSubject<BroadcastMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() { }

  public startConnection = (): void => {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/broadcast`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('LoadHistory', (messages: BroadcastMessage[]) => {
      const sortedMessages = messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.messagesSubject.next(sortedMessages);
    });

    this.hubConnection.on('BroadcastMessage', (subject: string, content: string, fullName: string, timestamp: string) => {
      const currentMessages = this.messagesSubject.value;
      const newMessage = { subject, content, fullName, timestamp };
      this.messagesSubject.next([newMessage, ...currentMessages]);
    });

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started successfully.'))
      .catch((err) => console.error('Error while starting SignalR connection: ' + err));
  }

  public broadcastMessage(subject: string, content: string, fullName: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('SendMessage', subject, content, fullName);
    }
    return Promise.reject('Hub connection is not established');
  }
}

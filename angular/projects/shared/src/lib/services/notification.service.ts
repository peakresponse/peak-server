import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class NotificationService {
  messages: any[] = [];
  messagesSubject = new ReplaySubject<any[]>(1);
  get messages$(): Observable<any[]> {
    return this.messagesSubject;
  }

  push(message: string, delay?: number) {
    this.messages.push({
      id: uuid(),
      delay: delay ?? 2000,
      text: message,
    });
    this.messagesSubject.next(this.messages);
  }

  pop(id: string) {
    this.messages = this.messages.filter((message) => message.id !== id);
    this.messagesSubject.next(this.messages);
  }
}

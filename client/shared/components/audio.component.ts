import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { Subscriber, Observable } from 'rxjs';
import numeral from 'numeral';

@Component({
  selector: 'shared-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements AfterViewInit, OnDestroy {
  @Input() src: any;
  @ViewChild('audio') audio: ElementRef;
  private eventListener: any;
  private subscribers: Subscriber<string>[] = [];

  ngAfterViewInit() {
    this.eventListener = () => {
      for (let subscriber of this.subscribers) {
        subscriber.next(this.currentTime);
      }
    };
    this.audio?.nativeElement?.addEventListener('timeupdate', this.eventListener);
  }

  ngOnDestroy() {
    this.audio?.nativeElement?.removeEventListener('timeupdate', this.eventListener);
    this.eventListener = null;
  }

  get duration(): string {
    const seconds = this.audio?.nativeElement?.duration ?? 0;
    return numeral(seconds).format('00:00:00');
  }

  get currentTime(): string {
    const seconds = this.audio?.nativeElement?.currentTime ?? 0;
    return numeral(seconds).format('00:00:00');
  }

  get currentTime$(): Observable<string> {
    return new Observable<string>((subscriber) => {
      subscriber.next(this.currentTime);
      this.subscribers.push(subscriber);
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(index, 1);
      };
    });
  }

  get isPaused(): boolean {
    return this.audio?.nativeElement?.paused ?? true;
  }

  onClick() {
    if (this.isPaused) {
      this.audio?.nativeElement?.play();
    } else {
      this.audio?.nativeElement?.pause();
      if (this.audio?.nativeElement) {
        this.audio.nativeElement.currentTime = 0;
      }
    }
  }
}

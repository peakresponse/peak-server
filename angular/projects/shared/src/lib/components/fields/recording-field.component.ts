import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'shared-recording-field',
  templateUrl: './recording-field.component.html',
  standalone: false,
})
export class RecordingFieldComponent implements AfterViewInit, OnDestroy {
  @Input() title?: string;
  @Input() duration?: string | number;
  @Input() fileUrl?: string;
  @Input() timestamp?: string | Date;

  @ViewChild('audio') audio?: ElementRef;
  private eventListener: any;
  private subscribers: Subscriber<number>[] = [];

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

  get computedDuration(): string | number {
    let duration = this.audio?.nativeElement?.duration;
    if (duration && !isNaN(duration)) {
      return duration;
    }
    return this.duration ?? 0;
  }

  get currentTime(): number {
    return this.audio?.nativeElement?.currentTime ?? 0;
  }

  get currentTime$(): Observable<number> {
    return new Observable<number>((subscriber) => {
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

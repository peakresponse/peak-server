import { Component, ElementRef, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import numeral from 'numeral';

import { Patient } from './patient';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowPatientComponent {
  id: string = null;
  @ViewChildren('audio') audio: QueryList<ElementRef>;

  PRIORITY_ARRAY = Patient.PRIORITY_ARRAY;

  constructor(private route: ActivatedRoute, private router: Router, private renderer: Renderer2) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.renderer.addClass(document.body, 'modal-open');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'modal-open');
  }

  onClose() {
    this.router.navigate([{outlets: {modal: null}}], {
      preserveFragment: true,
      queryParamsHandling: 'preserve',
      relativeTo: this.route.parent
    });
  }

  observations(observations: any[]): any[] {
    if (observations) {
      return observations
        .filter(o => o.text)
        .sort((a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf());
    }
    return null;
  }

  duration(i: number): string {
    if (this.audio) {
      const audio = this.audio.toArray();
      if (i < audio.length) {
        const seconds = audio[i].nativeElement.duration;
        return numeral(seconds).format('00:00:00');
      }
    }
    return null;
  }

  position(i: number): string {
    if (this.audio) {
      const audio = this.audio.toArray();
      if (i < audio.length) {
        const seconds = audio[i].nativeElement.currentTime;
        return numeral(seconds).format('00:00:00');
      }
    }
    return null;
  }

  isPaused(i: number): boolean {
    if (this.audio) {
      const audio = this.audio.toArray();
      if (i < audio.length) {
        return audio[i].nativeElement.paused;
      }
    }
    return true;
  }

  onPlay(i: number) {
    if (this.audio) {
      const audio = this.audio.toArray();
      if (i < audio.length) {
        audio[i].nativeElement.play();
      }
    }
  }

  onPause(i: number) {
    if (this.audio) {
      const audio = this.audio.toArray();
      if (i < audio.length) {
        audio[i].nativeElement.pause();
        audio[i].nativeElement.currentTime = 0;
      }
    }
  }
}

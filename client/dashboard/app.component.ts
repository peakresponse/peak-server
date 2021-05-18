import { AfterViewInit, Component, HostListener } from '@angular/core';

import { UserService } from '../shared/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  scale: number;
  transform: string;
  width: string;
  height: string;

  constructor(private user: UserService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.onWindowResize();
      document.body.style.overflow = 'hidden';
    }, 0);
  }

  @HostListener('window:resize')
  private onWindowResize() {
    this.scale = Math.min(1, window.innerWidth / 1792);
    this.transform = `scale(${this.scale})`;
    this.width = `${window.innerWidth / this.scale}px`;
    this.height = `${window.innerHeight / this.scale}px`;
  }
}

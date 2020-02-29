import { Injectable } from '@angular/core';

export class Config {
  apiKey: string;
  constructor() {
    this.apiKey = window['env'].GOOGLE_MAPS_API_KEY;
  }
}

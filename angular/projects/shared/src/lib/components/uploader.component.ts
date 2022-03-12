import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DirectUpload } from 'activestorage';

import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

class Uploader {
  file: File;
  progress = '0%';
  error: any = null;
  upload: DirectUpload;
  callback: Function;

  constructor(file: File, url: string, callback: Function) {
    this.file = file;
    this.upload = new DirectUpload(file, url, this);
    this.callback = callback;
  }

  start() {
    this.upload.create((error: any, blob: any) => {
      if (error) {
        this.error = error;
      } else {
        this.callback(this, blob);
      }
    });
  }

  directUploadWillStoreFileWithXHR(request: any) {
    request.upload.addEventListener('progress', (event: any) => this.directUploadDidProgress(event));
  }

  directUploadDidProgress(event: any) {
    // Use event.loaded and event.total to update the progress bar
    this.progress = `${Math.round((100 * event.loaded) / event.total)}%`;
  }
}

@Component({
  selector: 'shared-uploader',
  templateUrl: './uploader.component.html',
})
export class UploaderComponent {
  @Input() id: string = '';
  @Input() record: any = null;
  @Input() property: string = '';
  @Input() directUploadURL = '/api/assets';
  @Output() onUploaded = new EventEmitter<any>();
  @ViewChild('fileInput') fileInput?: ElementRef;
  uploaders: any[] = [];

  constructor(protected api: ApiService, protected currentUser: UserService) {}

  onChange(event: any) {
    for (let file of event.target.files) {
      let uploader = new Uploader(file, this.directUploadURL, (uploader: Uploader, blob: any) => {
        this.uploaders.splice(this.uploaders.indexOf(uploader), 1);
        let upload: any = {
          name: blob.filename,
          href: blob.signed_id,
          mediaType: blob.content_type,
          file: file,
          dataURL: null,
        };
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          upload.dataURL = reader.result;
          if (this.record) {
            this.record[this.property] = this.record[this.property] || [];
            this.record[this.property].push(upload);
          }
          this.onUploaded.emit(upload);
        });
        reader.readAsDataURL(upload.file);
      });
      this.uploaders.push(uploader);
      uploader.start();
    }
    const fileInput = this.fileInput;
    if (fileInput) {
      fileInput.nativeElement.value = null;
    }
  }
}

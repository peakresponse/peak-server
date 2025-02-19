import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';

import { Uploader } from './uploader.component';

@Component({
  selector: 'shared-dropzone',
  styleUrls: ['./dropzone.component.scss'],
  templateUrl: './dropzone.component.html',
  standalone: false,
})
export class DropzoneComponent {
  @Input() multiple = true;
  @Input() accept = '*';
  @Input() disabled = false;
  @Input() directUploadURL = '/api/assets';
  @Output() onDrop = new EventEmitter<NgxDropzoneChangeEvent>();
  @Output() onUploaded = new EventEmitter<any>();

  uploaders: Uploader[] = [];

  onChangeInternal(event: NgxDropzoneChangeEvent) {
    this.onDrop.emit(event);
    for (let file of event.addedFiles) {
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
          this.onUploaded.emit(upload);
        });
        reader.readAsDataURL(upload.file);
      });
      this.uploaders.push(uploader);
      uploader.start();
    }
  }
}

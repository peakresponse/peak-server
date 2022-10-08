import { Component, Input, OnInit } from '@angular/core';

import { SchemaService } from 'shared';

@Component({
  selector: 'admin-demographics-form',
  templateUrl: './form-demographics.component.html',
})
export class FormDemographicsComponent implements OnInit {
  @Input() record: any = {};
  @Input() error: any = null;

  signatureReasons: any = {};
  signatureTypes: any = {};
  signatureStatuses: any = {
    signed: 'Signed',
    refused: 'Refused to Sign',
    notSigned: 'Not Signed',
  };

  constructor(private schema: SchemaService) {}

  ngOnInit(): void {
    this.schema.get('/nemsis/xsd/eOther_v3.json').subscribe(() => {
      this.signatureReasons = this.schema.getEnum('SignatureReason') ?? [];
      this.signatureTypes = this.schema.getEnum('SignatureType') ?? [];
    });
  }
}

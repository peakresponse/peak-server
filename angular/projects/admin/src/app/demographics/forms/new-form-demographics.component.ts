import { Component, OnInit } from '@angular/core';

import { v4 as uuid } from 'uuid';

import { NavigationService, NotificationService, SchemaService } from 'shared';

@Component({
  templateUrl: './new-form-demographics.component.html',
})
export class NewFormDemographicsComponent implements OnInit {
  signatureReasons: any = {};
  signatureTypes: any = {};
  signatureStatuses: any = {
    signed: 'Signed',
    refused: 'Refused to Sign',
    notSigned: 'Not Signed',
  };

  isNewReasonExplicitOpen = false;
  newReasonExplicit: any = {};

  isNewReasonExplicitOptionOpen = false;
  newReasonExplicitOption: any = {};

  isNewSignatureOpen = false;
  newSignature: any = {};

  constructor(private navigation: NavigationService, private notification: NotificationService, private schema: SchemaService) {}

  ngOnInit(): void {
    this.schema.get('/nemsis/xsd/eOther_v3.json').subscribe(() => {
      this.signatureReasons = this.schema.getEnum('SignatureReason') ?? [];
      this.signatureTypes = this.schema.getEnum('SignatureType') ?? [];
    });
  }

  onAddReasonExplicit(addItem: any) {
    if (this.isNewReasonExplicitOpen) {
      addItem(this.newReasonExplicit);
      this.onCancelReasonExplicit();
    } else {
      this.isNewReasonExplicitOpen = true;
    }
  }

  onCancelReasonExplicit() {
    this.newReasonExplicit = {};
    this.isNewReasonExplicitOpen = false;
  }

  onAddReasonExplicitOption(addItem: any) {
    if (this.isNewReasonExplicitOptionOpen) {
      addItem(this.newReasonExplicitOption);
      this.onCancelReasonExplicitOption();
    } else {
      this.isNewReasonExplicitOptionOpen = true;
    }
  }

  onCancelReasonExplicitOption() {
    this.newReasonExplicitOption = {};
    this.isNewReasonExplicitOptionOpen = false;
  }

  onAddSignature(addItem: any) {
    if (this.isNewSignatureOpen) {
      addItem(this.newSignature);
      this.onCancelSignature();
    } else {
      this.isNewSignatureOpen = true;
    }
  }

  onCancelSignature() {
    this.newSignature = {};
    this.isNewSignatureOpen = false;
  }

  onSubmit(record: any) {
    record.id = uuid();
    record.canonicalId = uuid();
    return record;
  }

  onCreate(form: any) {
    this.notification.push('Form created!');
    this.navigation.replaceWith(`/demographics/forms`);
  }
}

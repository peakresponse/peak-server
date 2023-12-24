import { Component } from '@angular/core';
import { ApiService, NavigationService, UserService } from 'shared';

@Component({
  templateUrl: './select-assignment.component.html',
})
export class SelectAssignmentComponent {
  data: any = {
    vehicleId: null,
    number: '',
  };
  isLoading: boolean = false;

  constructor(
    private api: ApiService,
    public user: UserService,
    private navigation: NavigationService,
  ) {}

  onCheckboxValueChange(value: any) {
    if (value) {
      this.data.number = '';
    }
  }

  onInputValueChange(value: any) {
    if (value && value !== '') {
      this.data.vehicleId = null;
    }
  }

  get canContinue(): boolean {
    return this.data.vehicleId !== null || (this.data.number && this.data.number !== '');
  }

  onContinue() {
    this.isLoading = true;
    const data: any = {};
    if (this.data.number && this.data.number !== '') {
      data.number = this.data.number;
    } else {
      data.vehicleId = this.data.vehicleId;
    }
    this.api.assignments.create(data).subscribe((response: any) => {
      this.user.setAssignment(response.body);
      this.navigation.goTo('/');
    });
  }

  onSkip() {
    this.isLoading = true;
    this.api.assignments.create({ vehicleId: null }).subscribe((response: any) => {
      this.user.setAssignment(response.body);
      this.navigation.goTo('/');
    });
  }
}

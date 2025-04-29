import { Component, Input } from '@angular/core';

const TYPES = [
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.520',
    },
    Category: 'Commercial',
    SourceLabel: 'Airport as the place of occurrence of the external cause',
    SuggestedLabel: 'Airport',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.39',
    },
    Category: 'Commercial',
    SourceLabel: 'Other specified sports and athletic area as the place of occurrence of the external cause',
    SuggestedLabel: 'Gym',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.6',
    },
    Category: 'Commercial',
    SourceLabel: 'Industrial and construction area as the place of occurrence of the external cause',
    SuggestedLabel: 'Industrial/construction area',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.5',
    },
    Category: 'Commercial',
    SourceLabel: 'Trade and service area as the place of occurrence of the external cause',
    SuggestedLabel: 'Place of business, NOS',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.511',
    },
    Category: 'Commercial',
    SourceLabel: 'Restaurant or café as the place of occurrence of the external cause',
    SuggestedLabel: 'Restaurant/café',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.51',
    },
    Category: 'Commercial',
    SourceLabel: 'Private commercial establishments as the place of occurrence of the external cause',
    SuggestedLabel: 'Store',
    Note: 'Includes Y92.512 Grocery store',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.59',
    },
    Category: 'Commercial',
    SourceLabel: 'Other trade areas as the place of occurrence of the external cause',
    SuggestedLabel: 'Warehouse',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.531',
    },
    Category: 'Healthcare',
    SourceLabel: 'Health care provider office as the place of occurrence of the external cause',
    SuggestedLabel: "Doctor's office",
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.23',
    },
    Category: 'Healthcare',
    SourceLabel: 'Hospital as the place of occurrence of the external cause',
    SuggestedLabel: 'Hospital',
    Note: 'Includes Y92.230 Patient room in hospital',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.12',
    },
    Category: 'Healthcare',
    SourceLabel: 'Nursing home as the place of occurrence of the external cause',
    SuggestedLabel: 'Nursing home',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.538',
    },
    Category: 'Healthcare',
    SourceLabel: 'Other ambulatory health services establishments as the place of occurrence of the external cause',
    SuggestedLabel: 'Other ambulatory care',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.532',
    },
    Category: 'Healthcare',
    SourceLabel: 'Urgent care center as the place of occurrence of the external cause',
    SuggestedLabel: 'Urgent care',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.1',
    },
    Category: 'Institutional Residence',
    SourceLabel: 'Institutional (nonprivate) residence as the place of occurrence of the external cause',
    SuggestedLabel: 'Institutional residence',
    Note: 'Includes Y92.10 and Y92.19',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.14',
    },
    Category: 'Institutional Residence',
    SourceLabel: 'Prison as the place of occurrence of the external cause',
    SuggestedLabel: 'Prison/jail',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.89',
    },
    Category: 'Other',
    SourceLabel: 'Other specified places as the place of occurrence of the external cause',
    SuggestedLabel: 'Abandoned house',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.13',
    },
    Category: 'Other',
    SourceLabel: 'Military base as the place of occurrence of the external cause',
    SuggestedLabel: 'Military installation',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.8',
    },
    Category: 'Other',
    SourceLabel: 'Other places as the place of occurrence of the external cause',
    SuggestedLabel: 'Other, NOS',
    Note: 'Includes Y92.9 Unspecified place',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.22',
    },
    Category: 'Other',
    SourceLabel: 'Religious institution as the place of occurrence of the external cause',
    SuggestedLabel: 'Religious institution',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.03',
    },
    Category: 'Private Residence',
    SourceLabel: 'Apartment as the place of occurrence of the external cause',
    SuggestedLabel: 'Apartment/condo',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.02',
    },
    Category: 'Private Residence',
    SourceLabel: 'Mobile home as the place of occurrence of the external cause',
    SuggestedLabel: 'Mobile home',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.09',
    },
    Category: 'Private Residence',
    SourceLabel: 'Other non-institutional residence as the place of occurrence of the external cause',
    SuggestedLabel: 'Other private residence',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.0',
    },
    Category: 'Private Residence',
    SourceLabel: 'Non-institutional (private) residence as the place of occurrence of the external cause',
    SuggestedLabel: 'Private residence',
    Note: 'Icludes Y92.00, Y92.008, Y92.01',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.24',
    },
    Category: 'Public Area',
    SourceLabel: 'Public administrative building as the place of occurrence of the external cause',
    SuggestedLabel: 'Public building',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.2',
    },
    Category: 'Public Area',
    SourceLabel: 'School, other institution and public administrative area as the place of occurrence of the external cause',
    SuggestedLabel: 'Public area, NOS',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.29',
    },
    Category: 'Recreational',
    SourceLabel: 'Other specified public building as the place of occurrence of the external cause',
    SuggestedLabel: 'Clubhouse',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.830',
    },
    Category: 'Recreational',
    SourceLabel: 'Public park as the place of occurrence of the external cause',
    SuggestedLabel: 'Park',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.34',
    },
    Category: 'Recreational',
    SourceLabel: 'Swimming pool (public) as the place of occurrence of the external cause',
    SuggestedLabel: 'Pool',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.838',
    },
    Category: 'Recreational',
    SourceLabel: 'Other recreation area as the place of occurrence of the external cause',
    SuggestedLabel: 'Recreational area, NOS',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.3',
    },
    Category: 'Recreational',
    SourceLabel: 'Sports and athletics area as the place of occurrence of the external cause',
    SuggestedLabel: 'Sports area',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.210',
    },
    Category: 'School',
    SourceLabel: 'Daycare center as the place of occurrence of the external cause',
    SuggestedLabel: 'Daycare',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.21',
    },
    Category: 'School',
    SourceLabel: 'School (private) (public) (state) as the place of occurrence of the external cause',
    SuggestedLabel: 'School',
    Note: 'Includes Y92.219 Unspecified school',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.16',
    },
    Category: 'School',
    SourceLabel: 'School dormitory as the place of occurrence of the external cause',
    SuggestedLabel: 'School dorm',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.481',
    },
    Category: 'Street/Road',
    SourceLabel: 'Parking lot as the place of occurrence of the external cause',
    SuggestedLabel: 'Parking lot',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.480',
    },
    Category: 'Street/Road',
    SourceLabel: 'Sidewalk as the place of occurrence of the external cause',
    SuggestedLabel: 'Sidewalk',
  },
  {
    date: '2021-05-06',
    Value: {
      Value: 'Y92.4',
    },
    Category: 'Street/Road',
    SourceLabel: 'Street, highway and other paved roadways as the place of occurrence of the external cause',
    SuggestedLabel: 'Street/road/highway',
    Note: 'Includes Y92.41 Street and highway, Includes Y92.414 Local residential or business street, Y92.48',
  },
].sort((a, b) => a.SuggestedLabel.localeCompare(b.SuggestedLabel));
Object.freeze(TYPES);

@Component({
  selector: 'app-venue-form',
  templateUrl: './venue-form.component.html',
  standalone: false,
})
export class VenueFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;

  types = TYPES;
}

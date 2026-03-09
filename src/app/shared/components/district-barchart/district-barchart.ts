import { Component, input } from '@angular/core';

@Component({
  selector: 'app-district-barchart',
  imports: [],
  templateUrl: './district-barchart.html',
  styleUrl: './district-barchart.css'
})
export class DistrictBarchart {
  districtBars = input.required<{ id: number, label: string, pct: number }[]>();
}

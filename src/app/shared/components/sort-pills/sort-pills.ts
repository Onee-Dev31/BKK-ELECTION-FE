import { Component, input, output } from '@angular/core';

export interface SortOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-sort-pills',
  standalone: true,
  host: { class: 'sort-pills' },
  templateUrl: './sort-pills.html',
  styleUrl: './sort-pills.css',
})
export class SortPills {
  options = input.required<SortOption[]>();
  activeKey = input.required<string>();
  keyChange = output<string>();
}

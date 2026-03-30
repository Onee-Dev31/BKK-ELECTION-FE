import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchResult } from '../../../core/services/search';
import { MapStateService } from '../../../core/services/map-state';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  searchService = inject(SearchService);
  mapState = inject(MapStateService);

  isSearchFocused = signal(false);

  // Getter/setter for ngModel binding to the signal
  get searchQuery(): string {
    return this.searchService.searchQuery();
  }
  set searchQuery(val: string) {
    this.searchService.searchQuery.set(val);
  }

  get searchResults() {
    return this.searchService.searchResults();
  }

  get districtResults() {
    return this.searchResults.filter(r => r.type === 'district');
  }

  get candidateResults() {
    return this.searchResults.filter(r => r.type === 'candidate');
  }

  handleSearchFocus() {
    this.isSearchFocused.set(true);
  }

  handleSearchBlur() {
    // Delay hiding dropdown so click events can register
    setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 200);
  }

  selectResult(result: SearchResult) {
    if (result.type === 'district') {
      this.mapState.selectedDistrictId.set(result.id);
      this.mapState.selectedCandidateId.set(null); // Clear candidate selection
    } else if (result.type === 'candidate') {
      this.mapState.selectedCandidateId.set(result.id);
      // We might want to find which district this candidate is leading in, or just show their info
      // For now, setting the candidate ID should trigger the relevant UI updates
    }
    // Clear search after selection
    this.searchQuery = '';
    this.isSearchFocused.set(false);
  }
}

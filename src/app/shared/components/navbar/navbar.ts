import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchResult } from '../../../core/services/search';
import { MapStateService } from '../../../core/services/map-state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  currentTime = signal(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  currentDate = signal(new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }));

  searchService = inject(SearchService);
  mapState = inject(MapStateService);

  isSearchFocused = signal(false);
  activeIndex = signal(-1);

  // Getter/setter for ngModel binding to the signal
  get searchQuery(): string {
    return this.searchService.searchQuery();
  }
  set searchQuery(val: string) {
    this.searchService.searchQuery.set(val);
    this.activeIndex.set(-1); // Reset index on type
  }

  get searchResults() {
    return this.searchService.searchResults();
  }

  handleSearchFocus() {
    this.isSearchFocused.set(true);
    this.activeIndex.set(-1);
  }

  handleSearchBlur() {
    // Delay hiding dropdown so click events can register
    setTimeout(() => {
      this.isSearchFocused.set(false);
      this.activeIndex.set(-1);
    }, 200);
  }

  handleKeyDown(event: KeyboardEvent) {
    const results = this.searchResults;
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(prev => (prev > 0 ? prev - 1 : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const current = this.activeIndex();
      if (current >= 0 && current < results.length) {
        this.selectResult(results[current]);
      }
    } else if (event.key === 'Escape') {
      this.isSearchFocused.set(false);
    }
  }

  selectResult(result: SearchResult) {
    if (result.type === 'district') {
      this.mapState.selectedDistrictId.set(result.id);
      this.mapState.selectedCandidateId.set(null);
    } else if (result.type === 'candidate') {
      this.mapState.selectedCandidateId.set(result.id);
      this.mapState.selectedDistrictId.set(null);
    }
    
    // Fill search box with the selected result title for premium feel
    this.searchQuery = result.title;
    this.isSearchFocused.set(false);
    this.activeIndex.set(-1);
  }

  clearSearch() {
    this.searchQuery = '';
    this.mapState.selectedCandidateId.set(null);
    this.mapState.selectedDistrictId.set(null);
    this.isSearchFocused.set(false);
    this.activeIndex.set(-1);
  }

  getHighlightedText(text: string, query: string): string {
    if (!query || !text) return text;
    
    // Normalize query for highlighting
    const q = query.toLowerCase().replace(/^(เขต|แขวง)/, '').trim();
    if (!q) return text;

    const index = text.toLowerCase().indexOf(q);
    if (index === -1) return text;

    return text.substring(0, index) + 
           `<span class="highlight">${text.substring(index, index + q.length)}</span>` + 
           text.substring(index + q.length);
  }
}

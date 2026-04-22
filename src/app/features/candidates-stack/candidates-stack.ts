import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../core/services/election.service';
import { ArticleService } from '../../core/services/article.service';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';

@Component({
  selector: 'app-candidates-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidates-stack.html',
  styleUrl: './candidates-stack.css',
})
export class CandidatesStack implements OnInit {
  private svc = inject(ElectionService);
  articleService = inject(ArticleService);

  async ngOnInit() {
    await this.articleService.loadArticles();
  }

  top10 = computed(() =>
    [...this.svc.candidates()]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10)
  );

  hoveredIdx = signal<number | null>(null);

  selectCard(idx: number, detailEl: HTMLElement) {
    const isSame = this.hoveredIdx() === idx;
    this.hoveredIdx.set(isSame ? null : idx);

    if (!isSame) {
      // รอให้ detail panel expand ก่อน (~350ms) แล้วค่อย scroll ไปหา
      setTimeout(() => {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 360);
    }
  }

  imgUrl(n: number) {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', n.toString());
  }

  formatVotes(v: number) {
    return v.toLocaleString('th-TH');
  }
}

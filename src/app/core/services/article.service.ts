import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);

  private readonly API_URL = 'https://electionbkk-api.oneeclick.co:8000/api/Article/GetArticles';

  articles = signal<Article[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadArticles(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await lastValueFrom(this.http.get<Article[]>(this.API_URL));
      this.articles.set(res ?? []);
      console.log('[ArticleService] GetArticles response:', res);
    } catch (err) {
      this.error.set('โหลดข้อมูลไม่สำเร็จ');
      console.error('[ArticleService] GetArticles error:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

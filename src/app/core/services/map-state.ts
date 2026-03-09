import { Injectable, signal, computed, inject } from '@angular/core';
import { PolicyService } from './policy';

export interface District {
  id: number;
  number: number;
  row: number;
  col: number;
  leadingCandidateId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private policyService = inject(PolicyService);

  // Custom grid placement for a cartogram-style map of Bangkok
  // -------------------------------------------------------------
  // วิธีแก้ไขตำแหน่งบนแผนที่ (Honeycomb Grid):
  // 1. row = แถวแนวนอน (เริ่มต้น 1 คือด้านบนสุด ยิ่งเลขมากยิ่งลงล่าง)
  // 2. col = คอลัมน์แนวตั้ง (เริ่มต้น 1 คือด้านซ้ายสุด ยิ่งเลขมากยิ่งไปทางขวา)
  // หากต้องการขยับหรือสลับเขต ให้แก้ตัวเลข row และ col ในแต่ละเขตได้เลย 
  // ตัวอย่าง: ขยับบางเขนขึ้นบนสุด ให้แก้ row: 1
  // -------------------------------------------------------------
  private mockDistricts: District[] = [
    // Row 1: Extreme North
    { id: 36, number: 36, row: 1, col: 5 }, // Don Mueang
    { id: 42, number: 42, row: 1, col: 6 }, // Sai Mai

    // Row 2: Upper North
    { id: 41, number: 41, row: 2, col: 4 }, // Lak Si
    { id: 5, number: 5, row: 2, col: 5 }, // Bang Khen
    { id: 46, number: 46, row: 2, col: 6 }, // Khlong Sam Wa
    { id: 3, number: 3, row: 2, col: 7 }, // Nong Chok

    // Row 3: Mid-North
    { id: 29, number: 29, row: 3, col: 4 }, // Bang Sue
    { id: 30, number: 30, row: 3, col: 5 }, // Chatuchak
    { id: 38, number: 38, row: 3, col: 6 }, // Lat Phrao
    { id: 43, number: 43, row: 3, col: 7 }, // Khan Na Yao
    { id: 10, number: 10, row: 3, col: 8 }, // Min Buri

    // Row 4: Northwest to Central-East
    { id: 25, number: 25, row: 4, col: 3 }, // Bang Phlat
    { id: 14, number: 14, row: 4, col: 4 }, // Phaya Thai
    { id: 26, number: 26, row: 4, col: 5 }, // Din Daeng
    { id: 45, number: 45, row: 4, col: 6 }, // Wang Thonglang
    { id: 27, number: 27, row: 4, col: 7 }, // Bueng Kum
    { id: 44, number: 44, row: 4, col: 8 }, // Saphan Sung

    // Row 5: Inner City Core & Thonburi North
    { id: 19, number: 19, row: 5, col: 2 }, // Taling Chan
    { id: 20, number: 20, row: 5, col: 3 }, // Bangkok Noi
    { id: 2, number: 2, row: 5, col: 4 }, // Dusit
    { id: 37, number: 37, row: 5, col: 5 }, // Ratchathewi
    { id: 17, number: 17, row: 5, col: 6 }, // Huai Khwang
    { id: 6, number: 6, row: 5, col: 7 }, // Bang Kapi
    { id: 11, number: 11, row: 5, col: 8 }, // Lat Krabang

    // Row 6: Main Core Axis (West to East)
    { id: 48, number: 48, row: 6, col: 1 }, // Thawi Watthana
    { id: 16, number: 16, row: 6, col: 2 }, // Bangkok Yai
    { id: 1, number: 1, row: 6, col: 3 }, // Phra Nakhon
    { id: 8, number: 8, row: 6, col: 4 }, // Pom Prap Sattru Phai
    { id: 7, number: 7, row: 6, col: 5 }, // Pathum Wan
    { id: 39, number: 39, row: 6, col: 6 }, // Watthana
    { id: 34, number: 34, row: 6, col: 7 }, // Suan Luang
    { id: 32, number: 32, row: 6, col: 8 }, // Prawet

    // Row 7: Lower Core & South Thonburi
    { id: 23, number: 23, row: 7, col: 1 }, // Nong Khaem
    { id: 22, number: 22, row: 7, col: 2 }, // Phasi Charoen
    { id: 15, number: 15, row: 7, col: 3 }, // Thonburi
    { id: 13, number: 13, row: 7, col: 4 }, // Samphanthawong
    { id: 4, number: 4, row: 7, col: 5 }, // Bang Rak
    { id: 33, number: 33, row: 7, col: 6 }, // Khlong Toei
    { id: 9, number: 9, row: 7, col: 7 }, // Phra Khanong
    { id: 47, number: 47, row: 7, col: 8 }, // Bang Na

    // Row 8: South Suburbs
    { id: 40, number: 40, row: 8, col: 2 }, // Bang Khae
    { id: 35, number: 35, row: 8, col: 3 }, // Chom Thong
    { id: 18, number: 18, row: 8, col: 4 }, // Khlong San
    { id: 28, number: 28, row: 8, col: 5 }, // Sathon
    { id: 12, number: 12, row: 8, col: 6 }, // Yan Nawa
    { id: 31, number: 31, row: 8, col: 7 }, // Bang Kho Laem

    // Row 9: Deep South
    { id: 50, number: 50, row: 9, col: 2 }, // Bang Bon
    { id: 24, number: 24, row: 9, col: 4 }, // Rat Burana
    { id: 49, number: 49, row: 9, col: 5 }, // Thung Khru

    // Row 10: Extreme South (Gulf Boundary)
    { id: 21, number: 21, row: 10, col: 3 } // Bang Khun Thian
  ];

  private baseDistricts = signal<District[]>(this.mockDistricts);

  districts = computed(() => {
    return this.baseDistricts().map(d => ({
      ...d,
      leadingCandidateId: this.policyService.getLeadingCandidateId(d.id)
    }));
  });

  selectedDistrictId = signal<number | null>(null);

  selectedDistrict = computed(() => {
    const id = this.selectedDistrictId();
    if (id === null) return null;
    return this.districts().find(d => d.id === id) || null;
  });

  constructor() { }
}

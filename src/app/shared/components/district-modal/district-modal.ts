import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MapStateService } from '../../../core/services/map-state';
import { PolicyService } from '../../../core/services/policy';

@Component({
  selector: 'app-district-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    @if (selectedDistrict()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="modal-header">
            <div class="flex items-center gap-5">
              <div class="district-badge flex flex-col justify-center items-center font-black text-emerald-900 bg-emerald-50 ring-4 ring-emerald-500/10 rounded-2xl h-16 w-16 text-center leading-none shadow-sm transition-transform hover:scale-105">
                <span class="text-[9px] uppercase font-black text-emerald-600/60 tracking-widest">เขต</span>
                <span class="text-3xl -mt-1">{{ selectedDistrict()?.number }}</span>
              </div>
              <div>
                <h2 class="text-3xl font-black text-slate-900 m-0 leading-tight">เขต {{ getMockDistrictName(selectedDistrict()?.number) }}</h2>
                <div class="text-[12px] font-black text-emerald-600/60 mt-1.5 uppercase tracking-widest">นับแล้ว 99% · 20:53 น.</div>
              </div>
            </div>
            <button class="close-btn" (click)="closeModal()" aria-label="Close">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Candidates List -->
          <div class="modal-body">
             @for (c of candidates(); track c.id) {
               <div class="candidate-row group hover:bg-emerald-50/30 transition-all">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-5">
                      <!-- Avatar (Botanical Grass Optimized) -->
                      <div class="w-14 h-14 rounded-full bg-white ring-2 ring-emerald-50 shadow-sm overflow-hidden shrink-0 flex items-center justify-center text-slate-800 text-xl font-black group-hover:scale-110 transition-transform" [style.ringColor]="c.color">
                         {{ c.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="text-lg font-black text-slate-800 group-hover:text-emerald-900 transition-colors">{{ c.name }}</div>
                        <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ c.party }}</div>
                      </div>
                    </div>
                    <div class="flex flex-col items-end">
                       <span class="rounded-full px-4 py-1.5 border text-[11px] font-black uppercase tracking-widest shadow-sm" [style.borderColor]="c.color + '40'" [style.backgroundColor]="c.color + '08'" [style.color]="c.color">เบอร์ {{ c.number }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-4 gap-6">
                     <div class="flex-1">
                        <div class="progress-bar-bg bg-emerald-50/50 shadow-inner">
                           <div class="progress-bar-fill transition-all duration-1000 ease-out shadow-sm" 
                                [style.width]="getDistrictPercentage(c.id, selectedDistrict()?.id) + '%'" 
                                [style.backgroundColor]="c.color">
                             <span class="px-4 text-[10px] font-black text-white/95 uppercase tracking-widest truncate">{{ getDistrictVotes(c.id, selectedDistrict()?.id) | number }} คะแนน</span>
                           </div>
                        </div>
                     </div>
                     <div class="text-lg font-black text-slate-900 tabular-nums shrink-0 tracking-tighter">{{ getDistrictPercentage(c.id, selectedDistrict()?.id) }}%</div>
                  </div>
               </div>
             }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(240, 253, 244, 0.45); /* Fresh Mint tint */
      backdrop-filter: blur(25px) saturate(200%);
      -webkit-backdrop-filter: blur(25px) saturate(200%);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s ease-out forwards;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(32px) saturate(180%);
      -webkit-backdrop-filter: blur(32px) saturate(180%);
      border: 1.5px solid rgba(255, 255, 255, 1); /* Crystalline border */
      border-radius: 40px;
      width: 100%;
      max-width: 540px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 
        0 40px 100px -20px rgba(16, 185, 129, 0.15), 
        0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      animation: slideUp 0.5s cubic-bezier(0.17, 0.84, 0.44, 1) forwards;
      clip-path: inset(0 0 0 0 round 40px);
    }

    .modal-content::-webkit-scrollbar {
      width: 5px;
    }
    .modal-content::-webkit-scrollbar-track {
      background: transparent;
    }
    .modal-content::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.1);
      border-radius: 10px;
    }

    .modal-header {
      padding: 36px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(16, 185, 129, 0.08);
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(20px) saturate(160%);
      z-index: 10;
    }

    .close-btn {
      background: rgba(16, 185, 129, 0.05);
      border: none;
      color: rgba(16, 185, 129, 0.4);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .close-btn:hover {
      background: rgba(244, 63, 94, 0.1);
      color: #f43f5e;
      transform: rotate(90deg) scale(1.1);
    }

    .modal-body {
      padding: 0;
    }

    .candidate-row {
      padding: 28px 40px;
      border-bottom: 1px solid rgba(16, 185, 129, 0.03);
    }
    
    .candidate-row:last-child {
      border-bottom: none;
    }

    .progress-bar-bg {
      height: 24px;
      border-radius: 14px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      min-width: 14px;
      border-radius: 14px;
      display: flex;
      align-items: center;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(50px) scale(0.92); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]

})
export class DistrictModal {
  mapState = inject(MapStateService);
  policyService = inject(PolicyService);

  selectedDistrict = this.mapState.selectedDistrict;
  candidates = this.policyService.candidates;

  closeModal() {
    this.mapState.selectedDistrictId.set(null);
  }

  getDistrictVotes(candidateId: number, districtId: number | undefined): number {
    if (!districtId) return 0;
    const result = this.policyService.getDistrictResults(districtId);
    return result?.candidateResults.find(cr => cr.candidateId === candidateId)?.votes || 0;
  }

  getDistrictPercentage(candidateId: number, districtId: number | undefined): string {
    if (!districtId) return '0.00';
    const result = this.policyService.getDistrictResults(districtId);
    if (!result) return '0.00';
    const total = result.candidateResults.reduce((acc, curr) => acc + curr.votes, 0);
    const votes = result.candidateResults.find(cr => cr.candidateId === candidateId)?.votes || 0;
    return ((votes / total) * 100).toFixed(2);
  }

  getMockDistrictName(id: number | undefined): string {
    const names = [
      'พระนคร', 'ดุสิต', 'หนองจอก', 'บางรัก', 'บางเขน', 'บางกะปิ', 'ปทุมวัน',
      'ป้อมปราบศัตรูพ่าย', 'พระโขนง', 'มีนบุรี', 'ลาดกระบัง', 'ยานนาวา', 'สัมพันธวงศ์',
      'พญาไท', 'ธนบุรี', 'บางกอกใหญ่', 'ห้วยขวาง', 'คลองสาน', 'ตลิ่งชัน', 'บางกอกน้อย',
      'บางขุนเทียน', 'ภาษีเจริญ', 'หนองแขม', 'ราษฎร์บูรณะ', 'บางพลัด', 'ดินแดง',
      'บึงกุ่ม', 'สาทร', 'บางซื่อ', 'จตุจักร', 'บางคอแหลม', 'ประเวศ', 'คลองเตย',
      'สวนหลวง', 'จอมทอง', 'ดอนเมือง', 'ราชเทวี', 'ลาดพร้าว', 'วัฒนา', 'บางแค',
      'หลักสี่', 'สายไหม', 'คันนายาว', 'สะพานสูง', 'วังทองหลาง', 'คลองสามวา', 'บางนา',
      'ทวีวัฒนา', 'ทุ่งครุ', 'บางบอน'
    ];
    if (!id || id < 1 || id > 50) return 'ไม่ทราบ';
    return names[id - 1];
  }
}

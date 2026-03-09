import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CloudGate } from '../../../shared/components/cloud-gate/cloud-gate';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CloudGate, Sidebar, Navbar],
  template: `
    <div class="h-screen w-screen bg-[#041e1a] overflow-hidden relative text-white flex">
      <app-cloud-gate class="z-[100]"></app-cloud-gate>

      <!-- Sidebar Floating Layout -->
      <div class="z-50 h-full w-[100px] flex-shrink-0 relative hidden sm:flex flex-col justify-center pl-6">
          <app-sidebar class="block w-full h-fit"></app-sidebar>
      </div>

      <!-- Main Content Column -->
      <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full min-w-0">
          
          <!-- Navbar Floating Box -->
          <div class="h-24 flex-shrink-0 w-full pt-6 px-6 relative z-40">
              <app-navbar class="block w-full h-full"></app-navbar>
          </div>

          <!-- Page Content Viewport -->
          <div class="flex-1 bg-transparent overflow-hidden relative flex w-full h-full p-6">
              <div class="relative w-full h-full overflow-hidden rounded-[40px] border border-teal-500/10 shadow-2xl bg-[#031512]">
                  <router-outlet></router-outlet>
              </div>
          </div>

      </div>
    </div>
  `
})
export class MainLayout { }

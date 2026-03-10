import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CloudGate } from '../../../shared/components/cloud-gate/cloud-gate';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CloudGate, Sidebar],
  template: `
    <div class="h-screen w-screen bg-[#041e1a] overflow-hidden relative text-white">
      <app-cloud-gate class="z-[100]"></app-cloud-gate>

      <div class="absolute inset-0 z-0">
          <router-outlet></router-outlet>
      </div>

      <div class="absolute left-6 top-0 z-50 h-full w-fit hidden sm:flex flex-col justify-center">
          <app-sidebar class="block w-fit h-fit"></app-sidebar>
      </div>
    </div>
  `
})
export class MainLayout { }

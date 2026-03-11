import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CloudGate } from '../../../shared/components/cloud-gate/cloud-gate';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CloudGate, Sidebar],
  templateUrl: './main-layout.html'
})
export class MainLayout { }

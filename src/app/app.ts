import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CloudGate } from './shared/components/cloud-gate/cloud-gate';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CloudGate],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }

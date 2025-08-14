import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container py-4">
      <h1>User Profile</h1>
      <p>Profile management coming soon...</p>
    </div>
  `
})
export class ProfileComponent { }

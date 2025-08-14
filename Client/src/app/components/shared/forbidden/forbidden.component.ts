import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-forbidden',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container py-5 text-center">
      <h1 class="display-4 text-danger">403</h1>
      <p class="lead">You don't have permission to access this page.</p>
      <a routerLink="/auth/login" class="btn btn-primary">Return to Login</a>
    </div>
  `
})
export class ForbiddenComponent { }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container py-5 text-center">
      <h1 class="display-4">404</h1>
      <p class="lead">The page you're looking for was not found.</p>
      <a routerLink="/auth/login" class="btn btn-primary">Go to Login</a>
    </div>
  `
})
export class NotFoundComponent { }

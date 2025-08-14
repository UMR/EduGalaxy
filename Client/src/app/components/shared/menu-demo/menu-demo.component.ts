import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { MenuConfig } from '../../../models/menu.model';

@Component({
    selector: 'app-menu-demo',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container py-4">
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Current User Information</h5>
            </div>
            <div class="card-body">
              <div *ngIf="currentUser; else noUser">
                <p><strong>Name:</strong> {{ currentUser.firstName || currentUser.username }}</p>
                <p><strong>Email:</strong> {{ currentUser.email }}</p>
                <p><strong>Role:</strong> {{ currentUser.role?.name }}</p>
                <p><strong>Permissions:</strong></p>
                <ul class="list-unstyled">
                  <li *ngFor="let permission of currentUser.permissions" class="badge badge-info me-1 mb-1">
                    {{ permission.name }}
                  </li>
                </ul>
              </div>
              <ng-template #noUser>
                <p>No user logged in</p>
              </ng-template>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Available Menu Items</h5>
            </div>
            <div class="card-body">
              <div *ngFor="let group of menuConfig.groups" class="mb-3">
                <h6 class="text-primary">{{ group.label }}</h6>
                <ul class="list-unstyled ms-3">
                  <li *ngFor="let item of group.items" class="mb-1">
                    <i [class]="item.icon" class="me-2"></i>
                    {{ item.label }}
                    <span *ngIf="item.route" class="text-muted"> ({{ item.route }})</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Permission Testing</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <h6>Role Checks</h6>
                  <p>Is Admin: <span class="badge" [class]="isAdmin() ? 'badge-success' : 'badge-danger'">{{ isAdmin() ? 'Yes' : 'No' }}</span></p>
                  <p>Is Teacher: <span class="badge" [class]="isTeacher() ? 'badge-success' : 'badge-danger'">{{ isTeacher() ? 'Yes' : 'No' }}</span></p>
                  <p>Is Student: <span class="badge" [class]="isStudent() ? 'badge-success' : 'badge-danger'">{{ isStudent() ? 'Yes' : 'No' }}</span></p>
                </div>
                
                <div class="col-md-4">
                  <h6>Permission Checks</h6>
                  <p>Users View: <span class="badge" [class]="hasPermission('users.view') ? 'badge-success' : 'badge-danger'">{{ hasPermission('users.view') ? 'Yes' : 'No' }}</span></p>
                  <p>Courses Create: <span class="badge" [class]="hasPermission('courses.create') ? 'badge-success' : 'badge-danger'">{{ hasPermission('courses.create') ? 'Yes' : 'No' }}</span></p>
                  <p>System Settings: <span class="badge" [class]="hasPermission('system.settings.view') ? 'badge-success' : 'badge-danger'">{{ hasPermission('system.settings.view') ? 'Yes' : 'No' }}</span></p>
                </div>
                
                <div class="col-md-4">
                  <h6>Menu Access</h6>
                  <p>Admin Dashboard: <span class="badge" [class]="hasMenuAccess('dashboard', 'admin-dashboard') ? 'badge-success' : 'badge-danger'">{{ hasMenuAccess('dashboard', 'admin-dashboard') ? 'Yes' : 'No' }}</span></p>
                  <p>User Management: <span class="badge" [class]="hasMenuAccess('user-management', 'users-list') ? 'badge-success' : 'badge-danger'">{{ hasMenuAccess('user-management', 'users-list') ? 'Yes' : 'No' }}</span></p>
                  <p>Reports: <span class="badge" [class]="hasMenuAccess('reports', 'system-reports') ? 'badge-success' : 'badge-danger'">{{ hasMenuAccess('reports', 'system-reports') ? 'Yes' : 'No' }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .badge {
      font-size: 0.8rem;
    }
    .badge-success {
      background-color: #28a745;
    }
    .badge-danger {
      background-color: #dc3545;
    }
    .badge-info {
      background-color: #17a2b8;
    }
  `]
})
export class MenuDemoComponent implements OnInit {
    currentUser: any;
    menuConfig: MenuConfig = { groups: [] };

    constructor(
        private authService: AuthService,
        private menuService: MenuService
    ) {
        this.currentUser = this.authService.getCurrentUserValue();
    }

    ngOnInit(): void {
        this.menuService.getMenuForUser().subscribe(config => {
            this.menuConfig = config;
        });
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    isTeacher(): boolean {
        return this.authService.isTeacher();
    }

    isStudent(): boolean {
        return this.authService.isStudent();
    }

    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    hasMenuAccess(groupId: string, itemId: string): boolean {
        return this.menuService.hasMenuAccess(groupId, itemId);
    }
}

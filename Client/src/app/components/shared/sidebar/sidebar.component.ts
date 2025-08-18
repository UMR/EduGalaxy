import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { MenuConfig, MenuGroup, MenuItem } from '../../../models/menu.model';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule, CommonModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    menuConfig: MenuConfig = { groups: [] };
    currentUser$;
    isCollapsed = false;
    private destroy$ = new Subject<void>();

    constructor(
        private menuService: MenuService,
        private authService: AuthService,
        private router: Router
    ) {
        this.currentUser$ = this.authService.currentUser$;
    }

    ngOnInit(): void {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState) {
            this.isCollapsed = savedState === 'true';
        }

        // Wait for auth to complete before loading menu to ensure permissions are loaded
        this.authService.waitForUserLoad().then(() => {
            this.loadMenu();
        });

        this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
            if (user) {
                this.menuService.refreshMenu();
                this.loadMenu();
            }
        });

        // Listen for toggle events from header
        document.addEventListener('toggle-sidebar', () => {
            this.isCollapsed = !this.isCollapsed;
            // Save sidebar state to localStorage
            localStorage.setItem('sidebar-collapsed', String(this.isCollapsed));
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadMenu(): void {
        // If user is not loaded yet, don't try to load the menu
        if (!this.authService.getCurrentUserValue()) {
            console.log('User not loaded yet, delaying menu load');
            setTimeout(() => this.loadMenu(), 100);
            return;
        }

        this.menuService.getMenuForUser()
            .pipe(takeUntil(this.destroy$))
            .subscribe(config => {
                if (config && config.groups && config.groups.length > 0) {
                    this.menuConfig = config;
                } else {
                    // If menu is empty, try refreshing
                    console.log('Menu is empty, refreshing');
                    this.menuService.refreshMenu();
                }
            });
    }

    // Method to handle overlay clicks by triggering the same event as header toggle
    headerToggleEvent(): void {
        document.dispatchEvent(new CustomEvent('toggle-sidebar'));
    }

    onMenuItemClick(item: MenuItem): void {
        if (item.route) {
            if (item.route === '/logout') {
                this.logout();
            } else {
                this.router.navigate([item.route]);
            }
        } else if (item.url) {
            window.open(item.url, '_blank');
        }
    }

    private logout(): void {
        this.authService.logout();
    }

    isActiveRoute(route: string): boolean {
        // If route is exactly '/', only match the home route
        if (route === '/') {
            return this.router.url === '/';
        }

        // For other routes, match the route or any subroute
        return this.router.url === route ||
            (route !== '/' && this.router.url.startsWith(route + '/'));
    }

    get currentUser() {
        return this.authService.getCurrentUserValue();
    }

    getRoleDisplayName(roleName: string | undefined): string {
        switch (roleName?.toLowerCase()) {
            case 'admin': return 'Administrator';
            case 'teacher': return 'Teacher';
            case 'student': return 'Student';
            default: return roleName || 'User';
        }
    }
}

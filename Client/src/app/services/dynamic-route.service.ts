import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';
import { MenuItem } from '../models/menu.model';

@Injectable({
    providedIn: 'root'
})
export class DynamicRouteService {
    private componentMapping: { [key: string]: () => Promise<any> } = {
        '/dashboard': () => import('../components/shared/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent),
        '/profile': () => import('../components/shared/profile/profile.component').then(m => m.ProfileComponent),
        '/admin': () => import('../components/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        'default': () => import('../components/shared/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
    };

    constructor(
        private router: Router) { }
    getComponentForRoute(route: string): (() => Promise<any>) {
        return this.componentMapping[route] || this.componentMapping['default'];
    }
    registerComponent(route: string, componentLoader: () => Promise<any>): void {
        this.componentMapping[route] = componentLoader;
    }
    navigateToMenuItem(menuItem: MenuItem): void {
        if (menuItem.route) {
            this.router.navigate([menuItem.route]);
        } else if (menuItem.url) {
            window.open(menuItem.url, '_blank');
        }
    }

    hasComponent(route: string): boolean {
        return !!this.componentMapping[route];
    }

    getRegisteredRoutes(): string[] {
        return Object.keys(this.componentMapping);
    }

    /**
     * Create a fallback component for unregistered routes
     */
    getFallbackComponent() {
        return this.componentMapping['default'];
    }
}

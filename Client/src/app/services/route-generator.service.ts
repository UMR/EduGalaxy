import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Router, Route } from '@angular/router';
import { MenuService } from './menu.service';
import { DynamicRouteService } from './dynamic-route.service';
import { AuthService } from './auth.service';
import { authGuard } from '../core/guards/auth.guard';
import { MenuItem } from '../models/menu.model';
import { filter, switchMap, take, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteGeneratorService implements OnDestroy {
    private generatedRoutes = new Set<string>();
    private isInitialized = false;
    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private menuService: MenuService,
        @Inject(DynamicRouteService) private dynamicRouteService: DynamicRouteService,
        private authService: AuthService
    ) {
        this.authService.currentUser$.pipe(
            takeUntil(this.destroy$),
            distinctUntilChanged((prev, curr) => {
                return (prev?.id === curr?.id) && (!!prev === !!curr);
            })
        ).subscribe(user => {
            if (user && !this.isInitialized) {
                this.menuService.getMenuForUser().pipe(
                    takeUntil(this.destroy$),
                    filter(menuConfig => menuConfig && menuConfig.groups && menuConfig.groups.length > 0),
                    take(1)
                ).subscribe(menuConfig => {
                    this.setupDynamicRoutes(menuConfig);
                    this.isInitialized = true;
                });
            } else if (!user) {
                this.clearGeneratedRoutes();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupDynamicRoutes(menuConfig: any): void {
        const routes: Route[] = [];

        menuConfig.groups.forEach((group: any) => {
            group.items.forEach((item: MenuItem) => {
                this.addRouteForMenuItem(routes, item);
            });
        });

        this.addRoutesToRouter(routes);
    }

    private addRouteForMenuItem(routes: Route[], menuItem: MenuItem): void {
        if (!menuItem.route || this.generatedRoutes.has(menuItem.route)) {
            return;
        }

        const route: Route = {
            path: menuItem.route.startsWith('/') ? menuItem.route.substring(1) : menuItem.route,
            canActivate: [authGuard],
            loadComponent: this.dynamicRouteService.getComponentForRoute(menuItem.route),
            data: {
                title: menuItem.label,
                menuId: menuItem.id
            }
        };

        routes.push(route);
        this.generatedRoutes.add(menuItem.route);
        if (menuItem.children && menuItem.children.length > 0) {
            menuItem.children.forEach(child => {
                this.addRouteForMenuItem(routes, child);
            });
        }
    }

    private addRoutesToRouter(newRoutes: Route[]): void {
        if (newRoutes.length === 0) return;

        const currentRoutes = this.router.config;
        const mainLayoutRouteIndex = currentRoutes.findIndex(route =>
            route.loadComponent && route.children && route.canActivate
        );

        if (mainLayoutRouteIndex !== -1) {
            const mainLayoutRoute = currentRoutes[mainLayoutRouteIndex];
            if (mainLayoutRoute.children) {
                mainLayoutRoute.children = mainLayoutRoute.children.filter(child =>
                    !child.data?.['menuId'] || this.generatedRoutes.has('/' + child.path)
                );
                mainLayoutRoute.children.push(...newRoutes);
                this.router.resetConfig(currentRoutes);
            }
        }
    }
    addRouteForMenu(menuItem: MenuItem): void {
        if (!menuItem.route || this.generatedRoutes.has(menuItem.route)) {
            return;
        }

        const routes: Route[] = [];
        this.addRouteForMenuItem(routes, menuItem);
        this.addRoutesToRouter(routes);
    }
    hasRoute(path: string): boolean {
        return this.generatedRoutes.has(path);
    }

    getGeneratedRoutes(): string[] {
        return Array.from(this.generatedRoutes);
    }
    clearGeneratedRoutes(): void {
        this.generatedRoutes.clear();
        this.isInitialized = false;
    }

    reinitialize(): void {
        this.clearGeneratedRoutes();

    }
}

import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, Subject, takeUntil, distinctUntilChanged } from 'rxjs';
import { AuthService } from './auth.service';
import { MenuItem, MenuGroup, MenuConfig, ServerMenuItem } from '../models/menu.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MenuService implements OnDestroy {
    private menuConfigSubject = new BehaviorSubject<MenuConfig>({ groups: [] });
    public menuConfig$ = this.menuConfigSubject.asObservable();
    private readonly apiUrl = `${environment.apiUrl}/menus`;
    private destroy$ = new Subject<void>();
    private isLoadingMenus = false;
    private iconMapping: { [key: string]: string } = {
        'dashboard': 'fas fa-tachometer-alt',
        'profile': 'fas fa-user',
        'courses': 'fas fa-book',
        'assignments': 'fas fa-tasks',
        'grades': 'fas fa-chart-line',
        'students': 'fas fa-user-graduate',
        'reports': 'fas fa-chart-bar',
        'announcements': 'fas fa-bullhorn',
        'admin': 'fas fa-cogs',
        'users': 'fas fa-users',
        'roles': 'fas fa-user-tag',
        'settings': 'fas fa-cog'
    };

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.authService.currentUser$.pipe(
            takeUntil(this.destroy$),
            distinctUntilChanged((prev, curr) => {
                return (prev?.id === curr?.id) && (!!prev === !!curr);
            })
        ).subscribe(user => {
            if (user && !this.isLoadingMenus) {
                this.loadMenuFromServer();
            } else if (!user) {
                this.menuConfigSubject.next({ groups: [] });
                this.isLoadingMenus = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadMenuFromServer(): void {
        console.log("Loading menu from server...");
        if (this.isLoadingMenus) {
            return;
        }

        this.isLoadingMenus = true;
        this.http.get<ServerMenuItem[]>(`${this.apiUrl}/user`)
            .pipe(
                takeUntil(this.destroy$),
                map(serverMenus => this.transformServerMenusToConfig(serverMenus)),
                catchError(error => {
                    console.error('Error loading menus from server:', error);
                    return of({ groups: [] });
                })
            )
            .subscribe({
                next: (menuConfig) => {
                    this.menuConfigSubject.next(menuConfig);
                    this.isLoadingMenus = false;
                },
                error: () => {
                    this.isLoadingMenus = false;
                }
            });
    }

    private transformServerMenusToConfig(serverMenus: ServerMenuItem[]): MenuConfig {
        const menuItems: MenuItem[] = serverMenus.map(serverItem => ({
            id: serverItem.id,
            label: serverItem.title,
            icon: this.getIconForRoute(serverItem.route),
            route: serverItem.route,
            isVisible: serverItem.isActive,
            isActive: serverItem.isActive,
            children: serverItem.children?.map(child => ({
                id: child.id,
                label: child.title,
                icon: this.getIconForRoute(child.route),
                route: child.route,
                isVisible: child.isActive,
                isActive: child.isActive
            })) || []
        }));

        const groups = this.organizeMenusIntoGroups(menuItems);
        return { groups };
    }

    private organizeMenusIntoGroups(menuItems: MenuItem[]): MenuGroup[] {
        const groups: MenuGroup[] = [];

        const mainItems = menuItems.filter(item =>
            ['dashboard', 'profile'].some(route => item.route?.includes(route))
        );

        if (mainItems.length > 0) {
            groups.push({
                id: 'main',
                label: 'Main',
                icon: 'fas fa-home',
                items: mainItems,
                order: 1
            });
        }

        const academicItems = menuItems.filter(item =>
            ['courses', 'assignments', 'grades'].some(route => item.route?.includes(route))
        );

        if (academicItems.length > 0) {
            groups.push({
                id: 'academic',
                label: 'Academic',
                icon: 'fas fa-graduation-cap',
                items: academicItems,
                order: 2
            });
        }

        const managementItems = menuItems.filter(item =>
            ['students', 'reports'].some(route => item.route?.includes(route))
        );

        if (managementItems.length > 0) {
            groups.push({
                id: 'management',
                label: 'Management',
                icon: 'fas fa-users-cog',
                items: managementItems,
                order: 3
            });
        }

        const communicationItems = menuItems.filter(item =>
            ['announcements'].some(route => item.route?.includes(route))
        );

        if (communicationItems.length > 0) {
            groups.push({
                id: 'communication',
                label: 'Communication',
                icon: 'fas fa-comments',
                items: communicationItems,
                order: 4
            });
        }

        const adminItems = menuItems.filter(item =>
            ['admin', 'users', 'roles', 'settings'].some(route => item.route?.includes(route))
        );

        if (adminItems.length > 0) {
            groups.push({
                id: 'administration',
                label: 'Administration',
                icon: 'fas fa-cogs',
                items: adminItems,
                order: 5
            });
        }

        return groups.sort((a, b) => a.order - b.order);
    }

    private getIconForRoute(route: string): string {
        if (!route) return 'fas fa-circle';

        const routeLower = route.toLowerCase();

        for (const [key, icon] of Object.entries(this.iconMapping)) {
            if (routeLower.includes(key)) {
                return icon;
            }
        }

        return 'fas fa-circle';
    }

    getMenuForUser(): Observable<MenuConfig> {
        return this.menuConfig$;
    }

    refreshMenu(): void {
        if (!this.authService.getCurrentUserValue()) {
            return;
        }
        this.isLoadingMenus = false;
        this.loadMenuFromServer();
    }

    getMenuGroup(groupId: string): MenuGroup | undefined {
        const config = this.menuConfigSubject.value;
        return config.groups.find(group => group.id === groupId);
    }

    getMenuItem(groupId: string, itemId: string): MenuItem | undefined {
        const group = this.getMenuGroup(groupId);
        if (!group) return undefined;
        return group.items.find(item => item.id === itemId);
    }

    hasMenuAccess(groupId: string, itemId: string): boolean {
        const item = this.getMenuItem(groupId, itemId);
        return item?.isVisible ?? false;
    }
}

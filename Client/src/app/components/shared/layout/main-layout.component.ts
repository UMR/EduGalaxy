import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouteGeneratorService } from '../../../services/route-generator.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    isSidebarExpanded = false;
    private toggleListener?: () => void;

    constructor(
        private routeGeneratorService: RouteGeneratorService
    ) {
    }

    ngOnInit() {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState) {
            this.isSidebarExpanded = !(savedState === 'true');
        }

        this.toggleListener = () => {
            this.isSidebarExpanded = !this.isSidebarExpanded;
        };

        document.addEventListener('toggle-sidebar', this.toggleListener);
    }

    ngOnDestroy() {
        if (this.toggleListener) {
            document.removeEventListener('toggle-sidebar', this.toggleListener);
        }
    }
}

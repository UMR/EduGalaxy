import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

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

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState) {
            this.isSidebarExpanded = !(savedState === 'true');
        }

        this.toggleListener = () => {
            this.isSidebarExpanded = !this.isSidebarExpanded;
            this.cdr.detectChanges();
            console.log('Sidebar toggled:', this.isSidebarExpanded);
        };

        document.addEventListener('toggle-sidebar', this.toggleListener);
    }

    ngOnDestroy() {
        if (this.toggleListener) {
            document.removeEventListener('toggle-sidebar', this.toggleListener);
        }
    }
}

import { Component } from '@angular/core';

@Component({
    selector: 'app-coming-soon',
    standalone: true,
    template: `
        <div class="coming-soon-container">
            <div class="coming-soon-content">
                <h1>🚧 Coming Soon</h1>
                <p>This feature is under development and will be available soon.</p>
                <div class="back-button">
                    <button (click)="goBack()" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i> Go Back
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .coming-soon-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            padding: 2rem;
        }

        .coming-soon-content {
            text-align: center;
            max-width: 500px;
        }

        .coming-soon-content h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #6c757d;
        }

        .coming-soon-content p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            color: #6c757d;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background-color: #007bff;
            color: white;
        }

        .btn-primary:hover {
            background-color: #0056b3;
            transform: translateY(-2px);
        }

        .fas {
            margin-right: 0.5rem;
        }
    `]
})
export class ComingSoonComponent {
    goBack(): void {
        window.history.back();
    }
}

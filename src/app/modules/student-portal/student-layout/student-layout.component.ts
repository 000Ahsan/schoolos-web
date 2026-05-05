import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'student-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule
    ],
    template: `
        <div class="flex flex-col flex-auto w-full min-w-0 h-screen overflow-hidden bg-gray-100 dark:bg-card">
            <!-- Header -->
            <div class="relative flex flex-0 items-center w-full h-16 px-4 md:px-6 z-40 bg-card dark:bg-transparent shadow dark:shadow-none border-b">
                <div class="flex items-center">
                    <!-- Logo -->
                    <div class="flex items-center cursor-pointer" [routerLink]="['/student/dashboard']">
                        <img src="images/logo/logo.svg" alt="" class="h-8 w-8">
                        <div class="ml-2 text-xl font-bold tracking-tight leading-none uppercase text-primary">SchoolOS</div>
                    </div>
                </div>

                <div class="flex items-center ml-auto">
                    <!-- Nav links -->
                    <div class="hidden md:flex items-center mr-4 gap-2">
                        <a mat-button [routerLink]="['/student/dashboard']" routerLinkActive="bg-primary text-white" [routerLinkActiveOptions]="{exact: true}">
                            Dashboard
                        </a>
                        <a mat-button [routerLink]="['/student/vouchers']" routerLinkActive="bg-primary text-white">
                            Vouchers
                        </a>
                        <a mat-button [routerLink]="['/student/payments']" routerLinkActive="bg-primary text-white">
                            Payments
                        </a>
                    </div>

                    <mat-divider vertical class="mx-2 h-6 hidden md:block"></mat-divider>

                    <!-- User Menu -->
                    <button mat-icon-button [matMenuTriggerFor]="userMenu">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-medium overflow-hidden border">
                            @if (studentPhoto) {
                                <img class="w-full h-full object-cover" [src]="studentPhoto" [alt]="studentName">
                            } @else {
                                {{studentName?.[0] || 'S'}}
                            }
                        </div>
                    </button>
                    <mat-menu #userMenu="matMenu">
                        <div class="px-4 py-2 border-b">
                            <div class="font-medium truncate">{{studentName}}</div>
                            <div class="text-xs text-secondary truncate">{{studentEmail}}</div>
                        </div>
                        <button mat-menu-item (click)="logout()">
                            <mat-icon [svgIcon]="'heroicons_outline:arrow-right-on-rectangle'"></mat-icon>
                            <span>Sign out</span>
                        </button>
                    </mat-menu>
                </div>
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-auto overflow-y-auto relative">
                <router-outlet></router-outlet>
                
                <!-- Mobile Navigation (Bottom Bar) -->
                <div class="md:hidden sticky bottom-0 w-full bg-card border-t flex items-center justify-around py-2 z-50 shadow-2xl">
                    <a class="flex flex-col items-center gap-1 text-xs font-medium px-4" 
                       [routerLink]="['/student/dashboard']" 
                       routerLinkActive="text-primary" 
                       [routerLinkActiveOptions]="{exact: true}">
                        <mat-icon class="icon-size-6" [svgIcon]="'heroicons_outline:home'"></mat-icon>
                        <span>Home</span>
                    </a>
                    <a class="flex flex-col items-center gap-1 text-xs font-medium px-4" 
                       [routerLink]="['/student/vouchers']" 
                       routerLinkActive="text-primary">
                        <mat-icon class="icon-size-6" [svgIcon]="'heroicons_outline:document-text'"></mat-icon>
                        <span>Vouchers</span>
                    </a>
                    <a class="flex flex-col items-center gap-1 text-xs font-medium px-4" 
                       [routerLink]="['/student/payments']" 
                       routerLinkActive="text-primary">
                        <mat-icon class="icon-size-6" [svgIcon]="'heroicons_outline:credit-card'"></mat-icon>
                        <span>Payments</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: flex;
            flex: 1 1 auto;
            width: 100%;
        }
    `]
})
export class StudentLayoutComponent {
    private _router = inject(Router);
    studentName: string = '';
    studentEmail: string = '';
    studentPhoto: string | null = null;

    constructor() {
        const user = JSON.parse(localStorage.getItem('student_user') || '{}');
        this.studentName = user.name || 'Student';
        this.studentEmail = user.email || '';
        this.studentPhoto = user.photo_url || null;
    }

    logout(): void {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_user');
        this._router.navigate(['/student/login']);
    }
}

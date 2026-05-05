import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'pdf-preview-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    template: `
        <div class="flex flex-col h-[90vh] w-[90vw] max-w-4xl overflow-hidden bg-card">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50 dark:bg-transparent">
                <div class="flex flex-col">
                    <div class="text-lg font-bold tracking-tight">{{ data.title }}</div>
                    <div class="text-xs text-secondary">{{ data.subtitle }}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button mat-icon-button (click)="print()" matTooltip="Print">
                        <mat-icon svgIcon="heroicons_outline:printer"></mat-icon>
                    </button>
                    <button mat-icon-button (click)="download()" matTooltip="Download">
                        <mat-icon svgIcon="heroicons_outline:arrow-down-tray"></mat-icon>
                    </button>
                    <button mat-icon-button (click)="close()">
                        <mat-icon svgIcon="heroicons_outline:x-mark"></mat-icon>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-auto relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                @if (loading) {
                    <div class="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/20">
                        <mat-progress-spinner [diameter]="40" [mode]="'indeterminate'"></mat-progress-spinner>
                    </div>
                }
                <iframe 
                    *ngIf="pdfUrl"
                    [src]="pdfUrl" 
                    class="w-full h-full border-none"
                    (load)="onLoad()">
                </iframe>
            </div>

            <!-- Footer (Mobile Only Actions) -->
            <div class="flex md:hidden items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-transparent gap-4">
                <button mat-stroked-button class="flex-1" (click)="print()">
                    <mat-icon class="icon-size-5 mr-2" svgIcon="heroicons_outline:printer"></mat-icon>
                    Print
                </button>
                <button mat-flat-button color="primary" class="flex-1" (click)="download()">
                    <mat-icon class="icon-size-5 mr-2" svgIcon="heroicons_outline:arrow-down-tray"></mat-icon>
                    Download
                </button>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            border-radius: 12px;
            overflow: hidden;
        }
        iframe {
            display: block;
        }
    `]
})
export class PdfPreviewDialogComponent implements OnInit {
    pdfUrl: SafeResourceUrl;
    loading: boolean = true;

    constructor(
        public dialogRef: MatDialogRef<PdfPreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { blob: Blob, title: string, subtitle: string, fileName: string },
        private _domSanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        const url = URL.createObjectURL(this.data.blob);
        this.pdfUrl = this._domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    onLoad(): void {
        this.loading = false;
    }

    print(): void {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    }

    download(): void {
        const url = URL.createObjectURL(this.data.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.data.fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    close(): void {
        this.dialogRef.close();
    }
}

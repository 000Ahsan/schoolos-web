import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseScrollbarDirective } from '@fuse/directives/scrollbar';
import { AiChatService } from 'app/modules/ai-reports/ai-chat.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'ai-chat',
    templateUrl: './ai-chat.component.html',
    styleUrls: ['./ai-chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
})
export class AiChatComponent implements OnInit, OnDestroy {
    @ViewChild('chatScroll') private _chatScroll: ElementRef;

    chatForm: UntypedFormGroup;
    messages: any[] = [
        {
            role: 'assistant',
            content: 'Hello! I am your AI assistant. How can I help you with school reports today?',
            timestamp: new Date()
        }
    ];
    loading: boolean = false;
    suggestions: string[] = [
        "How much fee collected today?",
        "How many students have unpaid fees?",
        "Show monthly collection",
        "Total active students",
        "Students with balance"
    ];

    private _formBuilder = inject(UntypedFormBuilder);
    private _aiChatService = inject(AiChatService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor() {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.chatForm = this._formBuilder.group({
            question: ['', [Validators.required]]
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send question
     */
    sendQuestion(questionOverride?: string): void {
        const question = questionOverride || this.chatForm.get('question').value;

        if (!question || this.loading) {
            return;
        }

        // Add user message
        this.messages.push({
            role: 'user',
            content: question,
            timestamp: new Date()
        });

        // Reset form
        this.chatForm.reset();
        this.loading = true;
        this._changeDetectorRef.markForCheck();
        this._scrollToBottom();

        // Call service
        this._aiChatService.ask(question)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.messages.push({
                        role: 'assistant',
                        content: response.answer,
                        sql: response.sql,
                        timestamp: new Date()
                    });
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                    this._scrollToBottom();
                },
                error: (error) => {
                    this.messages.push({
                        role: 'assistant',
                        content: 'Sorry, I encountered an error while processing your request. Please try again.',
                        isError: true,
                        timestamp: new Date()
                    });
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                    this._scrollToBottom();
                }
            });
    }

    /**
     * Scroll to bottom
     * @private
     */
    private _scrollToBottom(): void {
        setTimeout(() => {
            if (this._chatScroll) {
                this._chatScroll.nativeElement.scrollTop = this._chatScroll.nativeElement.scrollHeight;
            }
        }, 100);
    }
}

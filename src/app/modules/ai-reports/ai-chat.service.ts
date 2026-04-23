import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiChatService {
    private _httpClient = inject(HttpClient);

    /**
     * Ask AI a question
     */
    ask(question: string): Observable<any> {
        return this._httpClient.post(environment.apiUrl + '/ai-chat', { question });
    }
}

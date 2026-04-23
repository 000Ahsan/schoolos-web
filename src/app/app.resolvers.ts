import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin, tap } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { TerminologyService } from 'app/core/terminology/terminology.service';

export const initialDataResolver = () => {
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);
    const apiService = inject(ApiService);
    const terminologyService = inject(TerminologyService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
        navigationService.get(),
        messagesService.getAll(),
        notificationsService.getAll(),
        quickChatService.getChats(),
        shortcutsService.getAll(),
        apiService.getSchoolSettings().pipe(
            tap(settings => {
                if (settings && settings.organization_type) {
                    terminologyService.setOrganizationType(settings.organization_type);
                }
            })
        )
    ]);
};

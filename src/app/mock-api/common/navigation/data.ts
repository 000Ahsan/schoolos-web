/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

const _navigationBase: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'students',
        title: 'Students',
        type: 'basic',
        icon: 'heroicons_outline:academic-cap',
        link: '/students',
    },
    {
        id: 'classes',
        title: 'Classes',
        type: 'basic',
        icon: 'heroicons_outline:rectangle-group',
        link: '/classes',
    },
    {
        id: 'academic-years',
        title: 'Academic Years',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/academic-years',
    },
    {
        id: 'fee-management',
        title: 'Fee Management',
        type: 'group',
        icon: 'heroicons_outline:banknotes',
        children: [
            {
                id: 'fee-management.structures',
                title: 'Fee Structures',
                type: 'basic',
                icon: 'heroicons_outline:list-bullet',
                link: '/fee/structures',
            },
            {
                id: 'fee-management.invoices',
                title: 'Invoices',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/fee/invoices',
            },
            {
                id: 'fee-management.payments',
                title: 'Payments',
                type: 'basic',
                icon: 'heroicons_outline:credit-card',
                link: '/fee/payments',
            },
            {
                id: 'fee-management.defaulters',
                title: 'Defaulters',
                type: 'basic',
                icon: 'heroicons_outline:exclamation-triangle',
                link: '/fee/defaulters',
            },
        ],
    },
    {
        id: 'discounts',
        title: 'Discounts',
        type: 'basic',
        icon: 'heroicons_outline:tag',
        link: '/discounts',
    },
    {
        id: 'whatsapp-logs',
        title: 'WhatsApp Logs',
        type: 'basic',
        icon: 'heroicons_outline:chat-bubble-left-ellipsis',
        link: '/whatsapp/logs',
    },
];

export const defaultNavigation: FuseNavigationItem[] = _navigationBase;
export const compactNavigation: FuseNavigationItem[] = _navigationBase;
export const futuristicNavigation: FuseNavigationItem[] = _navigationBase;
export const horizontalNavigation: FuseNavigationItem[] = _navigationBase;

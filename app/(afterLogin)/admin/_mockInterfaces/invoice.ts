export interface Invoice {
    id: string;
    tenantId: string;
    subscriptionId: string;
    number: string;
    issueDate: string;
    dueDate: string;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID' | 'INVALID';
    subtotal: number;
    total: number;
    currencyId: string;
    pdfUrl: string;
}
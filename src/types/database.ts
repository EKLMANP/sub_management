export type UserRole = 'member' | 'manager' | 'admin';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'pending_approval' | 'cancelled';
export type ApprovalType = 'create' | 'modify' | 'cancel';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Department {
    id: string;
    name: string;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    display_name: string | null;
    role: UserRole;
    department_id: string | null;
    department?: Department;
    created_at: string;
}

export interface Subscription {
    id: string;
    name: string;
    vendor_name: string | null;
    vendor_contact: string | null;
    fee: number;
    currency: string;
    billing_cycle: BillingCycle;
    start_date: string;
    end_date: string | null;
    next_renewal_date: string | null;
    payment_method: string | null;
    invoice_required: boolean;
    cost_center: string | null;
    budget_category: string | null;
    department_id: string | null;
    department?: Department;
    owner_id: string | null;
    owner?: Profile;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionDocument {
    id: string;
    subscription_id: string;
    file_url: string;
    file_name: string;
    uploaded_by: string | null;
    created_at: string;
}

export interface SubscriptionHistory {
    id: string;
    subscription_id: string;
    old_fee: number | null;
    new_fee: number | null;
    changed_at: string;
    changed_by: string | null;
}

export interface ApprovalRequest {
    id: string;
    subscription_id: string;
    subscription?: Subscription;
    type: ApprovalType;
    requester_id: string | null;
    requester?: Profile;
    approver_id: string | null;
    approver?: Profile;
    status: ApprovalStatus;
    comment: string | null;
    created_at: string;
    resolved_at: string | null;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string | null;
    read: boolean;
    link: string | null;
    created_at: string;
}

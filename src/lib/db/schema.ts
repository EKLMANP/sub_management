import { pgTable, uuid, text, decimal, date, boolean, timestamp } from 'drizzle-orm/pg-core';

// 部門
export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

// 用戶 profile
export const profiles = pgTable('profiles', {
    id: text('id').primaryKey(), // Clerk user ID
    email: text('email').notNull(),
    displayName: text('display_name'),
    role: text('role').notNull().default('member'), // member | manager | admin
    departmentId: uuid('department_id').references(() => departments.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// 訂閱主表
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    vendorName: text('vendor_name'),
    vendorContact: text('vendor_contact'),
    fee: decimal('fee', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('TWD'),
    billingCycle: text('billing_cycle').notNull(), // monthly | quarterly | yearly
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    nextRenewalDate: date('next_renewal_date'),
    paymentMethod: text('payment_method'),
    invoiceRequired: boolean('invoice_required').default(false),
    costCenter: text('cost_center'),
    budgetCategory: text('budget_category'),
    departmentId: uuid('department_id').references(() => departments.id),
    ownerId: text('owner_id').references(() => profiles.id),
    status: text('status').default('pending_approval'), // active | pending_approval | cancelled
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 合約文件
export const subscriptionDocuments = pgTable('subscription_documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    uploadedBy: text('uploaded_by').references(() => profiles.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// 價格變動歷史
export const subscriptionHistory = pgTable('subscription_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
    oldFee: decimal('old_fee', { precision: 10, scale: 2 }),
    newFee: decimal('new_fee', { precision: 10, scale: 2 }),
    changedAt: timestamp('changed_at').defaultNow(),
    changedBy: text('changed_by').references(() => profiles.id),
});

// 審批請求
export const approvalRequests = pgTable('approval_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // create | modify | cancel
    requesterId: text('requester_id').references(() => profiles.id),
    approverId: text('approver_id').references(() => profiles.id),
    status: text('status').default('pending'), // pending | approved | rejected
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow(),
    resolvedAt: timestamp('resolved_at'),
});

// 通知
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message'),
    read: boolean('read').default(false),
    link: text('link'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Type exports for use in components
export type Department = typeof departments.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionDocument = typeof subscriptionDocuments.$inferSelect;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

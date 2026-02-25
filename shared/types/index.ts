// Shared types between backend and frontend

export interface BaseEntity {
  id: string; // UUID
  tenant_id: string; // UUID
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  RESTAURANT_ADMIN = 'restaurant_admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  KITCHEN_STAFF = 'kitchen_staff',
  HR_OFFICER = 'hr_officer',
  WAITER = 'waiter',
}

export enum SubscriptionPlan {
  TRIAL = 'trial',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
  SPLIT = 'split',
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}

export const UAE_VAT_RATE = 0.05; // 5%

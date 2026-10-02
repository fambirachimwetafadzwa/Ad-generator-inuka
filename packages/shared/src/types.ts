export type Role = 'administrator' | 'manager' | 'cashier';

export interface Store { id: string; name: string; city: string; active: boolean }
export interface Terminal { id: string; storeId: string; name: string; active: boolean }
export interface Department { id: string; name: string; color: string; icon?: string; active: boolean }
export interface Product {
  id: string; sku: string; barcode: string; name: string; emoji: string;
  departmentId: string; price: number; cost: number; taxRate: number;
  stock: number; reorderLevel: number; active: boolean;
}
export interface Employee {
  id: string; name: string; role: Role; storeId: string; pin: string; active: boolean;
}
export type PaymentMethodId = 'cash' | 'card' | 'ecocash' | 'innbucks' | 'zimswitch' | string;
export interface PaymentMethod { id: PaymentMethodId; name: string; needsReference: boolean; active: boolean }

export type PrinterType = 'USB' | 'Network' | 'Serial';
export type PrinterRole = 'Receipt' | 'Kitchen' | 'Bar';
export interface Printer {
  id: string; name: string; type: PrinterType; connection: string; role: PrinterRole;
  status: 'online' | 'offline';
}

export interface OrderLine { productId: string; name: string; qty: number; unitPrice: number; taxRate: number }
export interface Sale {
  id: string; number: string; date: string; storeId: string; terminalId: string;
  cashierId: string; lines: OrderLine[]; subtotal: number; tax: number; total: number;
  paymentMethod: PaymentMethodId; voids: number;
}
export interface AuditEvent {
  id: string; date: string; user: string; action: string; entity: string; entityId: string;
  store: string; terminal: string;
}
export interface CashUp {
  id: string; cashier: string; store: string; terminal: string; start: string; end: string;
  openingFloat: number; sales: number; payouts: number; expected: number; actual: number;
}

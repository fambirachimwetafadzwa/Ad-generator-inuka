import type { AuditEvent, CashUp, Department, Employee, PaymentMethod, Printer, Product, Sale, Store, Terminal } from './types';
import { lineTax, round2 } from './format';

export const stores: Store[] = [
  { id: 's1', name: 'Harare CBD', city: 'Harare', active: true },
  { id: 's2', name: 'Bulawayo Central', city: 'Bulawayo', active: true },
];
export const terminals: Terminal[] = [
  { id: 'T-001', storeId: 's1', name: 'Till 1', active: true },
  { id: 'T-002', storeId: 's1', name: 'Till 2', active: true },
  { id: 'T-003', storeId: 's2', name: 'Till 1', active: true },
];
export const departments: Department[] = [
  { id: 'd1', name: 'Beverages', color: '#0ea5e9', active: true },
  { id: 'd2', name: 'Bakery', color: '#f59e0b', active: true },
  { id: 'd3', name: 'Groceries', color: '#22c55e', active: true },
  { id: 'd4', name: 'Snacks', color: '#ec4899', active: true },
  { id: 'd5', name: 'Household', color: '#8b5cf6', active: true },
  { id: 'd6', name: 'Dairy', color: '#14b8a6', active: true },
];
const p = (id: number, name: string, emoji: string, departmentId: string, price: number, cost: number, stock: number): Product => ({
  id: `p${id}`, sku: `SKU-${String(1000 + id)}`, barcode: `600${String(1000000 + id * 137)}`,
  name, emoji, departmentId, price, cost, taxRate: 0.15, stock, reorderLevel: 10, active: true,
});
export const products: Product[] = [
  p(1, 'Coca-Cola 500ml', '🥤', 'd1', 1.0, 0.6, 120), p(2, 'Mineral Water 500ml', '💧', 'd1', 0.75, 0.4, 200),
  p(3, 'Orange Juice 1L', '🧃', 'd1', 2.5, 1.6, 45), p(4, 'Iced Tea 500ml', '🍵', 'd1', 1.2, 0.7, 8),
  p(5, 'White Bread', '🍞', 'd2', 1.1, 0.7, 60), p(6, 'Brown Bread', '🥖', 'd2', 1.3, 0.8, 40),
  p(7, 'Croissant', '🥐', 'd2', 1.5, 0.8, 25), p(8, 'Doughnut', '🍩', 'd2', 0.9, 0.5, 35),
  p(9, 'Maize Meal 10kg', '🌽', 'd3', 8.5, 6.5, 50), p(10, 'Cooking Oil 2L', '🫒', 'd3', 5.25, 4.0, 30),
  p(11, 'Rice 2kg', '🍚', 'd3', 3.8, 2.7, 6), p(12, 'Sugar 2kg', '🍬', 'd3', 3.2, 2.4, 55),
  p(13, 'Potato Chips', '🥔', 'd4', 0.8, 0.45, 90), p(14, 'Chocolate Bar', '🍫', 'd4', 1.2, 0.7, 70),
  p(15, 'Peanuts 100g', '🥜', 'd4', 0.6, 0.3, 80), p(16, 'Biscuits', '🍪', 'd4', 1.0, 0.55, 64),
  p(17, 'Dish Soap', '🧴', 'd5', 2.2, 1.4, 22), p(18, 'Laundry Powder 1kg', '🧺', 'd5', 4.1, 2.9, 18),
  p(19, 'Toilet Paper 4pk', '🧻', 'd5', 2.8, 1.9, 33), p(20, 'Fresh Milk 1L', '🥛', 'd6', 1.6, 1.1, 48),
  p(21, 'Cheddar Cheese', '🧀', 'd6', 4.5, 3.2, 14), p(22, 'Yoghurt 500ml', '🍦', 'd6', 1.9, 1.2, 28),
];
export const employees: Employee[] = [
  { id: 'e1', name: 'Tendai Moyo', role: 'administrator', storeId: 's1', pin: '0000', active: true },
  { id: 'e2', name: 'Rudo Chikwanha', role: 'manager', storeId: 's1', pin: '1111', active: true },
  { id: 'e3', name: 'Farai Ncube', role: 'cashier', storeId: 's1', pin: '2222', active: true },
  { id: 'e4', name: 'Nyasha Dube', role: 'cashier', storeId: 's1', pin: '3333', active: true },
  { id: 'e5', name: 'Kuda Sibanda', role: 'manager', storeId: 's2', pin: '4444', active: true },
  { id: 'e6', name: 'Chipo Mlambo', role: 'cashier', storeId: 's2', pin: '5555', active: false },
];
export const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', needsReference: false, active: true },
  { id: 'card', name: 'Card', needsReference: true, active: true },
  { id: 'ecocash', name: 'EcoCash', needsReference: true, active: true },
  { id: 'innbucks', name: 'InnBucks', needsReference: true, active: true },
  { id: 'zimswitch', name: 'Zimswitch', needsReference: true, active: true },
];
export const printers: Printer[] = [
  { id: 'pr1', name: 'Till 1 Receipt', type: 'USB', connection: 'USB001 (Epson TM-T20)', role: 'Receipt', status: 'online' },
  { id: 'pr2', name: 'Till 2 Receipt', type: 'Network', connection: '192.168.1.45:9100', role: 'Receipt', status: 'online' },
  { id: 'pr3', name: 'Bar Printer', type: 'Network', connection: '192.168.1.60:9100', role: 'Bar', status: 'offline' },
];

// Deterministic pseudo-random so the reports look stable between reloads.
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ago = (days: number, hour: number) => {
  const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, Math.floor(rnd() * 60), 0, 0); return d.toISOString();
};
const cashiers = employees.filter(e => e.role === 'cashier' && e.active);
export const sales: Sale[] = Array.from({ length: 160 }, (_, i) => {
  const cashier = cashiers[i % cashiers.length];
  const n = 1 + Math.floor(rnd() * 4);
  const lines = Array.from({ length: n }, () => {
    const pr = products[Math.floor(rnd() * products.length)];
    return { productId: pr.id, name: pr.name, qty: 1 + Math.floor(rnd() * 3), unitPrice: pr.price, taxRate: pr.taxRate };
  });
  const total = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const tax = round2(lines.reduce((s, l) => s + lineTax(l.qty, l.unitPrice, l.taxRate), 0));
  return {
    id: `sale${i}`, number: `INV-${String(10000 + i)}`, date: ago(Math.floor(i / 23), 8 + Math.floor(rnd() * 11)),
    storeId: 's1', terminalId: i % 2 ? 'T-001' : 'T-002', cashierId: cashier.id, lines,
    subtotal: round2(total - tax), tax, total,
    paymentMethod: paymentMethods[Math.floor(rnd() * 5)].id, voids: rnd() < 0.08 ? 1 : 0,
  };
}).sort((a, b) => b.date.localeCompare(a.date));

export const auditEvents: AuditEvent[] = [
  ['Rudo Chikwanha', 'Item void authorised', 'Order', 'INV-10012', 'T-001'],
  ['Tendai Moyo', 'Price changed', 'Product', 'SKU-1003', '—'],
  ['Farai Ncube', 'Cash-up submitted', 'Shift', 'SH-0042', 'T-002'],
  ['Rudo Chikwanha', 'Stock take approved', 'StockTake', 'ST-0007', '—'],
  ['Tendai Moyo', 'Printer registered', 'Printer', 'pr3', '—'],
  ['Rudo Chikwanha', 'Stock adjustment (waste)', 'Product', 'SKU-1005', '—'],
  ['Tendai Moyo', 'Employee disabled', 'Employee', 'e6', '—'],
  ['Nyasha Dube', 'Manager override failed', 'Order', 'INV-10031', 'T-001'],
].map(([user, action, entity, entityId, terminal], i) => ({
  id: `a${i}`, date: ago(Math.floor(i / 3), 9 + i), user, action, entity, entityId, store: 'Harare CBD', terminal,
}));

export const cashUps: CashUp[] = [
  { id: 'SH-0042', cashier: 'Farai Ncube', store: 'Harare CBD', terminal: 'T-002', start: ago(0, 7), end: ago(0, 15), openingFloat: 100, sales: 642.5, payouts: 20, expected: 722.5, actual: 720 },
  { id: 'SH-0041', cashier: 'Nyasha Dube', store: 'Harare CBD', terminal: 'T-001', start: ago(1, 7), end: ago(1, 15), openingFloat: 100, sales: 588.1, payouts: 0, expected: 688.1, actual: 688.1 },
  { id: 'SH-0040', cashier: 'Farai Ncube', store: 'Harare CBD', terminal: 'T-002', start: ago(2, 7), end: ago(2, 15), openingFloat: 100, sales: 701.3, payouts: 15, expected: 786.3, actual: 791.3 },
];

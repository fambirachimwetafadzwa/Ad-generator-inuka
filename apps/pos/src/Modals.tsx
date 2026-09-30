import { useState, type ReactNode } from 'react';
import { employees, lineTax, money, paymentMethods, round2, type Employee, type OrderLine, type PaymentMethodId } from '@syncpos/shared';
import { PinPad } from './PinPad';

export function Modal({ children }: { children: ReactNode }) {
  return <div className="overlay"><div className="card modal">{children}</div></div>;
}

export const totalsOf = (lines: OrderLine[]) => {
  const total = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const tax = round2(lines.reduce((s, l) => s + lineTax(l.qty, l.unitPrice, l.taxRate), 0));
  return { total, tax, subtotal: round2(total - tax) };
};

export function ManagerAuth({ reason, storeId, onOk, onCancel }: { reason: string; storeId: string; onOk: (m: Employee) => void; onCancel: () => void }) {
  const [err, setErr] = useState('');
  const managers = employees.filter(e => e.role === 'manager' && e.storeId === storeId && e.active);
  return (
    <Modal>
      <h2>Manager authorisation</h2>
      <div className="sub">{reason}. Ask a manager to enter their PIN.</div>
      <PinPad onSubmit={pin => {
        const m = managers.find(x => x.pin === pin);
        m ? onOk(m) : setErr('Invalid manager PIN');
      }} />
      {err && <div className="err" style={{ textAlign: 'center' }}>{err}</div>}
      <div className="row"><button className="btn" onClick={onCancel}>Cancel</button></div>
    </Modal>
  );
}

export interface PaymentResult { method: PaymentMethodId; tendered: number; change: number; reference: string }

export function Payment({ total, onPaid, onCancel }: { total: number; onPaid: (r: PaymentResult) => void; onCancel: () => void }) {
  const methods = paymentMethods.filter(m => m.active);
  const [method, setMethod] = useState<PaymentMethodId>('cash');
  const [tendered, setTendered] = useState(String(total.toFixed(2)));
  const [ref, setRef] = useState('');
  const m = methods.find(x => x.id === method)!;
  const amount = method === 'cash' ? Number(tendered) : total;
  const valid = amount >= total && (!m.needsReference || ref.trim().length > 0);
  const quick = [...new Set([total, Math.ceil(total), Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, 50, 100])].filter(v => v >= total).slice(0, 5);

  return (
    <Modal>
      <h2>Payment</h2>
      <div className="due">{money(total)}</div>
      <div className="methods">
        {methods.map(x => <button key={x.id} className={`method ${x.id === method ? 'active' : ''}`} onClick={() => setMethod(x.id)}>{x.name}</button>)}
      </div>
      {method === 'cash' ? (
        <div style={{ marginTop: 16 }}>
          <label className="muted">Cash tendered</label>
          <input className="input" inputMode="decimal" value={tendered} onChange={e => setTendered(e.target.value)} autoFocus />
          <div className="quick">{quick.map(v => <button key={v} className="btn sm" onClick={() => setTendered(v.toFixed(2))}>{money(v)}</button>)}</div>
          <div className="summary" style={{ marginTop: 14 }}><span>Change due</span><span className="v">{money(Math.max(0, round2(amount - total)))}</span></div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <label className="muted">{m.name} reference / approval code</label>
          <input className="input" value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. TXN123456" autoFocus />
        </div>
      )}
      <div className="row">
        <button className="btn" onClick={onCancel}>Back</button>
        <button className="btn primary lg" disabled={!valid} onClick={() => onPaid({ method, tendered: amount, change: round2(Math.max(0, amount - total)), reference: ref })}>
          Complete sale
        </button>
      </div>
    </Modal>
  );
}

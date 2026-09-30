import { useMemo, useState } from 'react';
import { departments, money, products, type Employee, type OrderLine } from '@syncpos/shared';
import { totalsOf } from './Modals';

interface Props {
  user: Employee; lines: OrderLine[]; orderNo: string;
  setLines: (f: (l: OrderLine[]) => OrderLine[]) => void;
  onVoid: (productId: string) => void; onCheckout: () => void; onClear: () => void;
}

export function Sell({ user, lines, orderNo, setLines, onVoid, onCheckout, onClear }: Props) {
  const depts = departments.filter(d => d.active);
  const [dept, setDept] = useState(depts[0].id);
  const [q, setQ] = useState('');
  const shown = useMemo(() => products.filter(p => p.active && (q ? (p.name + p.sku + p.barcode).toLowerCase().includes(q.toLowerCase()) : p.departmentId === dept)), [dept, q]);
  const { total, tax, subtotal } = totalsOf(lines);
  const color = depts.find(d => d.id === dept)?.color;

  const add = (id: string) => {
    const p = products.find(x => x.id === id)!;
    setLines(ls => ls.some(l => l.productId === id)
      ? ls.map(l => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
      : [...ls, { productId: id, name: p.name, qty: 1, unitPrice: p.price, taxRate: p.taxRate }]);
  };
  const dec = (id: string) => setLines(ls => ls.flatMap(l => (l.productId !== id ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [l])));

  return (
    <div className="sell">
      <div className="catalog">
        <input className="input" placeholder="🔍 Search name, SKU or scan barcode…" value={q} onChange={e => setQ(e.target.value)} />
        {!q && (
          <div className="tabs">
            {depts.map(d => (
              <button key={d.id} className={`tab ${d.id === dept ? 'active' : ''}`} style={{ ['--c' as string]: d.color }} onClick={() => setDept(d.id)}>{d.name}</button>
            ))}
          </div>
        )}
        <div className="grid">
          {shown.map(p => (
            <button key={p.id} className="tile" disabled={p.stock <= 0} style={{ borderTop: `4px solid ${color}` }} onClick={() => add(p.id)}>
              {p.stock <= p.reorderLevel && <span className={`badge stock ${p.stock <= 0 ? 'danger' : 'warn'}`}>{p.stock <= 0 ? 'Out' : `${p.stock} left`}</span>}
              <div className="emoji">{p.emoji}</div>
              <div className="name">{p.name}</div>
              <div className="price">{money(p.price)}</div>
            </button>
          ))}
          {!shown.length && <div className="empty">No products found</div>}
        </div>
      </div>

      <div className="card cart">
        <h3><span>Order <span className="muted" style={{ fontWeight: 500 }}>{orderNo}</span></span>
          <button className="btn sm ghost" disabled={!lines.length} onClick={onClear}>Clear</button></h3>
        <div className="lines">
          {!lines.length && <div className="empty">Cart is empty.<br />Tap a product to add it.</div>}
          {lines.map(l => (
            <div className="line" key={l.productId}>
              <div className="ln">{l.name}</div><div className="lt">{money(l.qty * l.unitPrice)}</div>
              <div className="qty">
                <button onClick={() => dec(l.productId)}>−</button><span>{l.qty}</span><button onClick={() => add(l.productId)}>+</button>
                <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>@ {money(l.unitPrice)}</span>
              </div>
              <button className="btn sm ghost" style={{ color: 'var(--danger)' }} onClick={() => onVoid(l.productId)}>
                {user.role === 'cashier' ? '🔒 Void' : 'Void'}
              </button>
            </div>
          ))}
        </div>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>VAT (incl.)</span><span>{money(tax)}</span></div>
          <div><span>Discounts</span><span>{money(0)}</span></div>
          <div className="grand"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <div className="cart-actions">
          <button className="btn lg" disabled={!lines.length} onClick={onClear}>Cancel</button>
          <button className="btn primary lg" disabled={!lines.length} onClick={onCheckout}>Checkout</button>
        </div>
      </div>
    </div>
  );
}

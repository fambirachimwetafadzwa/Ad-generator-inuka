import { useMemo, useState } from 'react';
import { departments, money, products, type Employee, type OrderLine } from '@syncpos/shared';
import { totalsOf } from './Modals';
import { Icon } from './Brand';

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
        <label className="search">{Icon.search}<input className="input" placeholder="Search name, SKU or scan barcode…" value={q} onChange={e => setQ(e.target.value)} /></label>
        {!q && (
          <div className="tabs">
            {depts.map(d => (
              <button key={d.id} className={`tab ${d.id === dept ? 'active' : ''}`} style={{ ['--c' as string]: d.color }} onClick={() => setDept(d.id)}>
                <i>{d.icon}</i><span>{d.name}<small>{products.filter(p => p.departmentId === d.id && p.active).length} items</small></span>
              </button>
            ))}
          </div>
        )}
        <div className="grid">
          {shown.map(p => {
            const d = depts.find(x => x.id === p.departmentId);
            const inCart = lines.find(l => l.productId === p.id)?.qty;
            return (
              <button key={p.id} className="tile" disabled={p.stock <= 0} style={{ ['--c' as string]: d?.color }} onClick={() => add(p.id)}>
                {inCart && <span className="inc">{inCart}</span>}
                <div className="plate">{p.emoji}</div>
                <div className="name">{p.name}</div>
                <div className="price">{money(p.price)}</div>
                <div className={`stock ${p.stock <= p.reorderLevel ? 'low' : ''}`}>{p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}</div>
              </button>
            );
          })}
          {!shown.length && <div className="empty">No products found</div>}
        </div>
      </div>

      <div className="card cart">
        <div className="cart-head">
          <div><h3>Current order</h3><small>{orderNo} · {lines.reduce((n, l) => n + l.qty, 0)} items</small></div>
          <button className="btn sm ghost" disabled={!lines.length} onClick={onClear}>Clear</button>
        </div>
        <div className="lines">
          {!lines.length && <div className="empty"><div className="big">🛍️</div>Cart is empty.<br />Tap a product to add it.</div>}
          {lines.map(l => {
            const pr = products.find(x => x.id === l.productId)!;
            return (
              <div className="line" key={l.productId}>
                <div className="th">{pr.emoji}</div>
                <div><div className="ln">{l.name}</div><div className="sub">{money(l.unitPrice)} each</div></div>
                <div className="lt">{money(l.qty * l.unitPrice)}</div>
                <button className="voidbtn" onClick={() => onVoid(l.productId)}>{user.role === 'cashier' ? '🔒 Void item' : 'Void item'}</button>
                <div className="qty"><button aria-label="Decrease" onClick={() => dec(l.productId)}>−</button><span>{l.qty}</span><button aria-label="Increase" onClick={() => add(l.productId)}>+</button></div>
              </div>
            );
          })}
        </div>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>VAT (incl.)</span><span>{money(tax)}</span></div>
          <div><span>Discounts</span><span>{money(0)}</span></div>
          <div className="grand"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <div className="cart-actions">
          <button className="btn lg" disabled={!lines.length} onClick={onClear}>Cancel</button>
          <button className="btn primary lg" disabled={!lines.length} onClick={onCheckout}>Charge {money(total)}</button>
        </div>
      </div>
    </div>
  );
}

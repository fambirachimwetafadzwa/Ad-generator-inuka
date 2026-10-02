import { useEffect, useState } from 'react';
import { dateTime, money, paymentMethods, round2, stores, terminals, type Employee, type OrderLine } from '@syncpos/shared';
import { Login } from './Login';
import { ManagerAuth, Modal, Payment, totalsOf, type PaymentResult } from './Modals';
import { Sell } from './Sell';
import { Icon, Mark } from './Brand';

const TERMINAL_ID = 'T-001';
interface Shift { float: number; start: string; cashSales: number; otherSales: number; count: number; payouts: number }
interface Done { number: string; date: string; lines: OrderLine[]; pay: PaymentResult; cashier: string }
type View = 'sell' | 'history';
type Overlay = null | 'payment' | 'cashup' | { void: string };

export default function App() {
  const terminal = terminals.find(t => t.id === TERMINAL_ID)!;
  const store = stores.find(s => s.id === terminal.storeId)!;
  const [user, setUser] = useState<Employee | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [seq, setSeq] = useState(10050);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [receipt, setReceipt] = useState<Done | null>(null);
  const [done, setDone] = useState<Done[]>([]);
  const [view, setView] = useState<View>('sell');
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  // Simulated background sync: drain the offline queue once back online.
  useEffect(() => {
    if (!online || !pending) return;
    const t = setTimeout(() => { setPending(0); setToast('Offline sales synchronised'); }, 1800);
    return () => clearTimeout(t);
  }, [online, pending]);

  const orderNo = `INV-${seq}`;
  const logout = () => { setUser(null); setShift(null); setLines([]); setDone([]); setView('sell'); };

  const complete = (pay: PaymentResult) => {
    const { total } = totalsOf(lines);
    const sale: Done = { number: orderNo, date: new Date().toISOString(), lines, pay, cashier: user!.name };
    setReceipt(sale); setDone(d => [sale, ...d]);
    setShift(s => s && ({ ...s, count: s.count + 1, cashSales: s.cashSales + (pay.method === 'cash' ? total : 0), otherSales: s.otherSales + (pay.method === 'cash' ? 0 : total) }));
    if (!online) setPending(n => n + 1);
    setSeq(n => n + 1); setLines([]); setOverlay(null);
  };
  const removeLine = (id: string) => { setLines(ls => ls.filter(l => l.productId !== id)); setOverlay(null); };

  if (!user) return <div style={{ minHeight: '100%', display: 'grid' }}><Login terminalId={TERMINAL_ID} onLogin={setUser} /></div>;

  const title = !shift ? 'Open shift' : view === 'history' ? 'Order history' : store.name;
  return (
    <div className="pos">
      <nav className="rail" aria-label="Main">
        <Mark size={44} />
        <button className={`nav ${view === 'sell' ? 'active' : ''}`} onClick={() => setView('sell')}>{Icon.sell}Sell</button>
        <button className={`nav ${view === 'history' ? 'active' : ''}`} disabled={!shift} onClick={() => setView('history')}>{Icon.history}Orders</button>
        <button className="nav" disabled={!shift} onClick={() => setOverlay('cashup')}>{Icon.cashup}Cash-up</button>
        <div className="sp" />
        <button className="nav" onClick={logout}>{Icon.logout}Log out</button>
      </nav>

      <div className="workspace">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <div className="meta">{terminal.name} · {terminal.id} · {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}, {now.toLocaleTimeString('en-GB', { timeStyle: 'short' })}</div>
          </div>
          <div className="spacer" />
          <button className="chip" onClick={() => setOnline(o => !o)} title="Toggle simulated connectivity">
            <span className={`dot ${online ? '' : 'off'}`} />{online ? 'Online' : `Offline${pending ? ` · ${pending} queued` : ''}`}
          </button>
          <span className="chip">🖨 Printer ready</span>
          <div className="who"><span className="avatar">{user.name[0]}</span><span>{user.name}<small>{user.role}</small></span></div>
        </header>

        {!shift ? <OpenShift onOpen={f => setShift({ float: f, start: new Date().toISOString(), cashSales: 0, otherSales: 0, count: 0, payouts: 0 })} />
          : view === 'history' ? <History sales={done} storeName={store.name} onOpen={setReceipt} />
          : <Sell user={user} lines={lines} orderNo={orderNo} setLines={setLines} onCheckout={() => setOverlay('payment')}
              onClear={() => setLines([])} onVoid={id => (user.role === 'cashier' ? setOverlay({ void: id }) : removeLine(id))} />}
      </div>

      {overlay === 'payment' && <Payment total={totalsOf(lines).total} onPaid={complete} onCancel={() => setOverlay(null)} />}
      {overlay && typeof overlay === 'object' && (
        <ManagerAuth storeId={store.id} reason="Cashiers need manager approval to void an item"
          onOk={m => { removeLine(overlay.void); setToast(`Item voided — authorised by ${m.name}`); }} onCancel={() => setOverlay(null)} />
      )}
      {overlay === 'cashup' && shift && <CashUp shift={shift} onCancel={() => setOverlay(null)}
        onSubmit={() => { setOverlay(null); setToast('Cash-up submitted'); logout(); }} />}
      {receipt && <ReceiptModal r={receipt} storeName={store.name} terminal={terminal.id} online={online} onClose={() => setReceipt(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function History({ sales, storeName, onOpen }: { sales: Done[]; storeName: string; onOpen: (d: Done) => void }) {
  if (!sales.length) return <div className="empty" style={{ flex: 1 }}><div className="big">🧾</div>No orders yet this shift.<br />Completed sales appear here.</div>;
  return (
    <div className="history">
      {sales.map(d => (
        <div className="hrow" key={d.number}>
          <div><b>{d.number}</b><small>{dateTime(d.date)} · {storeName}</small></div>
          <span className="badge">{paymentMethods.find(m => m.id === d.pay.method)?.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><b>{money(totalsOf(d.lines).total)}</b><button className="btn sm" onClick={() => onOpen(d)}>View receipt</button></div>
        </div>
      ))}
    </div>
  );
}

function OpenShift({ onOpen }: { onOpen: (float: number) => void }) {
  const [f, setF] = useState('100.00');
  return (
    <div className="setup">
      <div className="card" style={{ padding: 28, width: 420 }}>
        <h2 style={{ marginTop: 0 }}>Open shift</h2>
        <p className="muted">Count the cash in your drawer and enter the opening float.</p>
        <label className="muted">Opening float</label>
        <input className="input" inputMode="decimal" value={f} onChange={e => setF(e.target.value)} autoFocus />
        <button className="btn primary lg" style={{ width: '100%', marginTop: 16 }} disabled={!(Number(f) >= 0) || f === ''} onClick={() => onOpen(Number(f))}>Start shift</button>
      </div>
    </div>
  );
}

function CashUp({ shift, onSubmit, onCancel }: { shift: Shift; onSubmit: () => void; onCancel: () => void }) {
  const expected = round2(shift.float + shift.cashSales - shift.payouts);
  const [actual, setActual] = useState('');
  const variance = actual === '' ? null : round2(Number(actual) - expected);
  return (
    <Modal>
      <h2>End shift · Cash-up</h2>
      <div className="sub">Started {dateTime(shift.start)} · {shift.count} sales</div>
      <div className="summary">
        <span>Opening float</span><span className="v">{money(shift.float)}</span>
        <span>Cash sales</span><span className="v">{money(shift.cashSales)}</span>
        <span>Card / mobile sales</span><span className="v">{money(shift.otherSales)}</span>
        <span>Payouts</span><span className="v">{money(shift.payouts)}</span>
        <span><b>Expected cash in drawer</b></span><span className="v">{money(expected)}</span>
      </div>
      <label className="muted" style={{ display: 'block', marginTop: 16 }}>Actual cash counted</label>
      <input className="input" inputMode="decimal" value={actual} onChange={e => setActual(e.target.value)} autoFocus />
      {variance !== null && <div style={{ marginTop: 10 }}>Variance: <span className={`badge ${variance === 0 ? 'ok' : 'danger'}`}>{variance > 0 ? '+' : ''}{money(variance)}</span></div>}
      <div className="row">
        <button className="btn" onClick={onCancel}>Back to sales</button>
        <button className="btn primary" disabled={actual === ''} onClick={onSubmit}>Submit cash-up</button>
      </div>
    </Modal>
  );
}

function ReceiptModal({ r, storeName, terminal, online, onClose }: { r: Done; storeName: string; terminal: string; online: boolean; onClose: () => void }) {
  const { total, tax, subtotal } = totalsOf(r.lines);
  const method = paymentMethods.find(m => m.id === r.pay.method)?.name;
  return (
    <Modal>
      <h2>✅ Sale complete</h2>
      <div className="sub">Receipt sent to printer queue{online ? '' : ' · saved offline, will sync'}</div>
      <div className="receipt">
        <div className="c"><b>{storeName.toUpperCase()}</b><br />{terminal} · {r.number}<br />{dateTime(r.date)}<br />Cashier: {r.cashier}</div><hr />
        {r.lines.map(l => <div className="r" key={l.productId}><span>{l.qty} x {l.name}</span><span>{money(l.qty * l.unitPrice)}</span></div>)}<hr />
        <div className="r"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="r"><span>VAT 15%</span><span>{money(tax)}</span></div>
        <div className="r"><b>TOTAL</b><b>{money(total)}</b></div><hr />
        <div className="r"><span>{method}</span><span>{money(r.pay.tendered)}</span></div>
        {r.pay.change > 0 && <div className="r"><span>Change</span><span>{money(r.pay.change)}</span></div>}
        {r.pay.reference && <div className="r"><span>Ref</span><span>{r.pay.reference}</span></div>}
        <div className="c" style={{ marginTop: 10 }}>Thank you for shopping with us!</div>
      </div>
      <div className="row"><button className="btn">Reprint</button><button className="btn primary" onClick={onClose}>New order</button></div>
    </Modal>
  );
}

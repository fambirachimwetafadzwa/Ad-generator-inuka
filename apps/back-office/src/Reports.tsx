import { useMemo, useState } from 'react';
import { departments, employees, money, paymentMethods, products, round2, sales, stores, type Sale } from '@syncpos/shared';
import { PageTitle, Stat, Table } from './ui';

const dayKey = (iso: string) => iso.slice(0, 10);
const inRange = (s: Sale, days: number) => Date.now() - new Date(s.date).getTime() < days * 864e5;

export function useSales(storeId: string, days: number) {
  return useMemo(() => sales.filter(s => (storeId === 'all' || s.storeId === storeId) && inRange(s, days)), [storeId, days]);
}

export function Filters({ store, setStore, days, setDays }: { store: string; setStore: (v: string) => void; days: number; setDays: (v: number) => void }) {
  return (
    <div className="toolbar no-print">
      <select className="input" style={{ width: 200 }} value={store} onChange={e => setStore(e.target.value)}>
        <option value="all">All stores</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select className="input" style={{ width: 160 }} value={days} onChange={e => setDays(Number(e.target.value))}>
        <option value={1}>Today</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option>
      </select>
      <button className="btn" onClick={() => window.print()}>🖨 Print</button>
    </div>
  );
}

const sum = (xs: Sale[], k: 'total' | 'tax' | 'subtotal') => round2(xs.reduce((a, s) => a + s[k], 0));

export function Reports() {
  const [tab, setTab] = useState<'daily' | 'dept' | 'cashier'>('daily');
  const [store, setStore] = useState('all');
  const [days, setDays] = useState(7);
  const data = useSales(store, days);

  const daily = useMemo(() => {
    const m = new Map<string, Sale[]>();
    data.forEach(s => m.set(dayKey(s.date), [...(m.get(dayKey(s.date)) ?? []), s]));
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);

  const dept = useMemo(() => departments.map(d => {
    const lines = data.flatMap(s => s.lines).filter(l => products.find(p => p.id === l.productId)?.departmentId === d.id);
    return { d, qty: lines.reduce((a, l) => a + l.qty, 0), total: round2(lines.reduce((a, l) => a + l.qty * l.unitPrice, 0)) };
  }).sort((a, b) => b.total - a.total), [data]);

  const cashier = useMemo(() => employees.filter(e => e.role === 'cashier').map(e => {
    const xs = data.filter(s => s.cashierId === e.id);
    const pay = paymentMethods.map(m => `${m.name} ${money(sum(xs.filter(s => s.paymentMethod === m.id), 'total'))}`).filter(t => !t.endsWith('$0.00'));
    return { e, n: xs.length, total: sum(xs, 'total'), voids: xs.reduce((a, s) => a + s.voids, 0), pay };
  }), [data]);

  return (
    <>
      <PageTitle title="Sales reports" />
      <div className="seg no-print">
        {([['daily', 'Daily sales'], ['dept', 'By department'], ['cashier', 'By cashier']] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <Filters store={store} setStore={setStore} days={days} setDays={setDays} />
      {tab === 'daily' && <Table rows={daily} cols={[
        { head: 'Date', cell: ([d]) => new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) },
        { head: 'Transactions', num: true, cell: ([, x]) => x.length },
        { head: 'Total sales', num: true, cell: ([, x]) => money(sum(x, 'total')) },
        { head: 'Avg. transaction', num: true, cell: ([, x]) => money(sum(x, 'total') / x.length) },
        { head: 'VAT', num: true, cell: ([, x]) => money(sum(x, 'tax')) },
        { head: 'Discounts', num: true, cell: () => money(0) },
        { head: 'Refunds', num: true, cell: () => money(0) },
        { head: 'Net sales', num: true, cell: ([, x]) => <b>{money(sum(x, 'subtotal'))}</b> },
      ]} />}
      {tab === 'dept' && <Table rows={dept} cols={[
        { head: 'Department', cell: r => <><span style={{ color: r.d.color }}>●</span> {r.d.name}</> },
        { head: 'Units sold', num: true, cell: r => r.qty },
        { head: 'Sales', num: true, cell: r => <b>{money(r.total)}</b> },
      ]} />}
      {tab === 'cashier' && <Table rows={cashier} cols={[
        { head: 'Cashier', cell: r => r.e.name },
        { head: 'Transactions', num: true, cell: r => r.n },
        { head: 'Sales', num: true, cell: r => <b>{money(r.total)}</b> },
        { head: 'Payment breakdown', cell: r => <span className="muted">{r.pay.join(' · ') || '—'}</span> },
        { head: 'Voids', num: true, cell: r => r.voids },
        { head: 'Refunds', num: true, cell: () => money(0) },
      ]} />}
    </>
  );
}

export function Dashboard() {
  const data = useSales('all', 7);
  const today = data.filter(s => dayKey(s.date) === dayKey(new Date().toISOString()));
  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach(s => m.set(dayKey(s.date), round2((m.get(dayKey(s.date)) ?? 0) + s.total)));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);
  const max = Math.max(...byDay.map(d => d[1]), 1);
  const low = products.filter(p => p.stock <= p.reorderLevel);
  const pay = paymentMethods.map(m => ({ m, t: sum(data.filter(s => s.paymentMethod === m.id), 'total') }));
  const pmax = Math.max(...pay.map(p => p.t), 1);

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="stats">
        <Stat label="Today's sales" value={money(sum(today, 'total'))} note={`${today.length} transactions`} />
        <Stat label="7-day sales" value={money(sum(data, 'total'))} note={`${data.length} transactions`} />
        <Stat label="Avg. transaction" value={money(sum(data, 'total') / (data.length || 1))} />
        <Stat label="Low stock items" value={String(low.length)} note="At or below reorder level" />
      </div>
      <div className="cols">
        <div className="card panel"><h3>Sales — last 7 days</h3>
          <div className="bars">{byDay.map(([d, v]) => (
            <div className="bar" key={d}><span>{money(v).replace('.00', '')}</span><i style={{ height: `${(v / max) * 100}%` }} /><span>{d.slice(5)}</span></div>
          ))}</div>
        </div>
        <div className="card panel"><h3>Payment methods</h3>
          {pay.map(({ m, t }) => <div className="hbar" key={m.id}><span>{m.name}</span><i style={{ width: `${(t / pmax) * 100}%`, background: 'var(--brand)' }} /><span className="num">{money(t)}</span></div>)}
        </div>
      </div>
      <div className="card panel"><h3>Low stock alerts</h3>
        <Table rows={low} cols={[
          { head: 'Product', cell: p => `${p.emoji} ${p.name}` }, { head: 'SKU', cell: p => p.sku },
          { head: 'On hand', num: true, cell: p => <span className="badge warn">{p.stock}</span> }, { head: 'Reorder level', num: true, cell: p => p.reorderLevel },
        ]} />
      </div>
    </>
  );
}

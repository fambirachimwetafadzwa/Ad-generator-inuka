import { useState } from 'react';
import { auditEvents, cashUps, dateTime, departments, money, products, round2, stores } from '@syncpos/shared';
import { PageTitle, Stat, Table } from './ui';

export function Inventory() {
  const [store, setStore] = useState('s1');
  return (
    <>
      <PageTitle title="Inventory" />
      <div className="toolbar"><select className="input" style={{ width: 200 }} value={store} onChange={e => setStore(e.target.value)}>
        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <Table rows={products} cols={[
        { head: 'Product', cell: p => `${p.emoji} ${p.name}` }, { head: 'SKU', cell: p => p.sku },
        { head: 'Department', cell: p => departments.find(d => d.id === p.departmentId)?.name },
        { head: 'On hand', num: true, cell: p => <span className={`badge ${p.stock <= p.reorderLevel ? 'warn' : 'ok'}`}>{p.stock}</span> },
        { head: 'Cost value', num: true, cell: p => money(p.stock * p.cost) },
        { head: '', cell: () => <button className="btn sm">Adjust</button> },
      ]} />
    </>
  );
}

export function StockTake() {
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState(false);
  // Expected quantities come from the system; variance is computed live as counts are entered.
  const rows = products.map(p => {
    const c = counts[p.id];
    const actual = c === undefined || c === '' ? null : Number(c);
    const v = actual === null ? null : actual - p.stock;
    return { p, actual, v, vv: v === null ? null : round2(v * p.cost) };
  });
  const counted = rows.filter(r => r.actual !== null);
  const netValue = round2(counted.reduce((a, r) => a + (r.vv ?? 0), 0));

  return (
    <>
      <PageTitle title="Stock take">
        <button className="btn no-print" onClick={() => window.print()}>🖨 Print variance report</button>
        <button className="btn primary no-print" disabled={!counted.length || applied} onClick={() => setApplied(true)}>{applied ? 'Adjustments applied' : 'Approve & apply adjustments'}</button>
      </PageTitle>
      <div className="stats">
        <Stat label="Store / date" value="Harare CBD" note={new Date().toLocaleDateString('en-GB', { dateStyle: 'long' })} />
        <Stat label="Items counted" value={`${counted.length} / ${products.length}`} />
        <Stat label="Net value variance" value={money(netValue)} note={netValue < 0 ? 'Shrinkage' : 'Surplus'} />
      </div>
      <Table rows={rows} cols={[
        { head: 'Product', cell: r => `${r.p.emoji} ${r.p.name}` },
        { head: 'Expected', num: true, cell: r => r.p.stock },
        { head: 'Actual count', num: true, cell: r => <input className="input" style={{ width: 90, textAlign: 'right' }} type="number" min={0} disabled={applied} value={counts[r.p.id] ?? ''} onChange={e => setCounts({ ...counts, [r.p.id]: e.target.value })} /> },
        { head: 'Qty variance', num: true, cell: r => r.v === null ? '—' : <span className={r.v < 0 ? 'variance-neg' : r.v > 0 ? 'variance-pos' : ''}>{r.v > 0 ? '+' : ''}{r.v}</span> },
        { head: 'Expected value', num: true, cell: r => money(r.p.stock * r.p.cost) },
        { head: 'Actual value', num: true, cell: r => r.actual === null ? '—' : money(r.actual * r.p.cost) },
        { head: 'Value variance', num: true, cell: r => r.vv === null ? '—' : <span className={r.vv < 0 ? 'variance-neg' : ''}>{money(r.vv)}</span> },
      ]} />
    </>
  );
}

export function CashUps() {
  return (
    <>
      <PageTitle title="Cashier cash-ups" />
      <Table rows={cashUps} cols={[
        { head: 'Shift', cell: r => <b>{r.id}</b> }, { head: 'Cashier', cell: r => r.cashier }, { head: 'Terminal', cell: r => r.terminal },
        { head: 'Start', cell: r => dateTime(r.start) }, { head: 'End', cell: r => dateTime(r.end) },
        { head: 'Float', num: true, cell: r => money(r.openingFloat) }, { head: 'Sales', num: true, cell: r => money(r.sales) },
        { head: 'Payouts', num: true, cell: r => money(r.payouts) }, { head: 'Expected', num: true, cell: r => money(r.expected) },
        { head: 'Actual', num: true, cell: r => money(r.actual) },
        { head: 'Variance', num: true, cell: r => { const v = round2(r.actual - r.expected); return <span className={`badge ${v === 0 ? 'ok' : 'danger'}`}>{money(v)}</span>; } },
      ]} />
      <p className="muted">Submitted cash-ups are read-only and cannot be silently altered.</p>
    </>
  );
}

export function Audit() {
  return (
    <>
      <PageTitle title="Audit trail" />
      <Table rows={auditEvents} cols={[
        { head: 'When', cell: r => dateTime(r.date) }, { head: 'User', cell: r => r.user }, { head: 'Action', cell: r => <b>{r.action}</b> },
        { head: 'Entity', cell: r => r.entity }, { head: 'Entity ID', cell: r => <code>{r.entityId}</code> },
        { head: 'Store', cell: r => r.store }, { head: 'Terminal', cell: r => r.terminal },
      ]} />
    </>
  );
}

import { useState } from 'react';
import { departments as d0, employees as e0, money, products as p0, stores as s0, terminals as t0, printers as pr0, paymentMethods as pm0 } from '@syncpos/shared';
import type { Department, Employee, PaymentMethod, Printer, Product, Store, Terminal } from '@syncpos/shared';
import { FormModal, PageTitle, StatusBadge, Switch, Table, type Field } from './ui';

// Generic "list + add/edit dialog" scaffold; state lives in memory until the API exists.
function useList<T extends { id: string }>(initial: T[]) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<T | 'new' | null>(null);
  const toggle = (id: string, k: keyof T) => setRows(rs => rs.map(r => (r.id === id ? { ...r, [k]: !r[k] } : r)));
  const save = (r: T) => { setRows(rs => (rs.some(x => x.id === r.id) ? rs.map(x => (x.id === r.id ? r : x)) : [...rs, r])); setEditing(null); };
  return { rows, editing, setEditing, toggle, save };
}
const str = (o: object) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
const uid = (p: string) => `${p}${Date.now().toString(36)}`;
const Actions = ({ onEdit }: { onEdit: () => void }) => <button className="btn sm" onClick={onEdit}>Edit</button>;

export function Departments() {
  const { rows, editing, setEditing, toggle, save } = useList<Department>(d0);
  const fields: Field[] = [{ key: 'name', label: 'Department name' }, { key: 'color', label: 'Colour (hex)' }];
  return (
    <>
      <PageTitle title="Departments"><button className="btn primary" onClick={() => setEditing('new')}>+ New department</button></PageTitle>
      <Table rows={rows} cols={[
        { head: 'Department', cell: r => <><span style={{ color: r.color }}>●</span> <b>{r.name}</b></> },
        { head: 'Products', num: true, cell: r => p0.filter(p => p.departmentId === r.id).length },
        { head: 'Status', cell: r => <StatusBadge on={r.active} /> },
        { head: 'Active', cell: r => <Switch on={r.active} onChange={() => toggle(r.id, 'active')} /> },
        { head: '', cell: r => <Actions onEdit={() => setEditing(r)} /> },
      ]} />
      {editing && <FormModal title={editing === 'new' ? 'New department' : 'Edit department'} fields={fields}
        initial={editing === 'new' ? { color: '#4f46e5' } : str(editing)} onClose={() => setEditing(null)}
        onSave={v => save({ id: editing === 'new' ? uid('d') : editing.id, name: v.name, color: v.color, active: editing === 'new' ? true : editing.active })} />}
    </>
  );
}

export function Products() {
  const { rows, editing, setEditing, toggle, save } = useList<Product>(p0);
  const [q, setQ] = useState('');
  const fields: Field[] = [
    { key: 'name', label: 'Product name' }, { key: 'sku', label: 'SKU / product code' }, { key: 'barcode', label: 'Barcode / PLU' },
    { key: 'departmentId', label: 'Department', type: 'select', options: d0.map(d => ({ value: d.id, label: d.name })) },
    { key: 'price', label: 'Selling price (incl. tax)', type: 'number' }, { key: 'cost', label: 'Cost price', type: 'number' },
    { key: 'taxRate', label: 'Tax rate (e.g. 0.15)', type: 'number' }, { key: 'emoji', label: 'Icon / image (PNG upload coming soon)' },
  ];
  return (
    <>
      <PageTitle title="Products"><button className="btn primary" onClick={() => setEditing('new')}>+ New product</button></PageTitle>
      <div className="toolbar"><input className="input" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <Table rows={rows.filter(p => (p.name + p.sku + p.barcode).toLowerCase().includes(q.toLowerCase()))} cols={[
        { head: 'Product', cell: r => <>{r.emoji} <b>{r.name}</b></> }, { head: 'SKU', cell: r => r.sku },
        { head: 'Department', cell: r => d0.find(d => d.id === r.departmentId)?.name },
        { head: 'Price', num: true, cell: r => money(r.price) }, { head: 'Cost', num: true, cell: r => money(r.cost) },
        { head: 'Tax', num: true, cell: r => `${r.taxRate * 100}%` },
        { head: 'Active', cell: r => <Switch on={r.active} onChange={() => toggle(r.id, 'active')} /> },
        { head: '', cell: r => <Actions onEdit={() => setEditing(r)} /> },
      ]} />
      {editing && <FormModal title={editing === 'new' ? 'New product' : 'Edit product'} fields={fields}
        initial={editing === 'new' ? { taxRate: '0.15', emoji: '📦' } : str(editing)} onClose={() => setEditing(null)}
        onSave={v => save({ ...(editing === 'new' ? { id: uid('p'), stock: 0, reorderLevel: 10, active: true } : editing),
          name: v.name, sku: v.sku, barcode: v.barcode, departmentId: v.departmentId, price: Number(v.price), cost: Number(v.cost), taxRate: Number(v.taxRate), emoji: v.emoji })} />}
    </>
  );
}

export function Employees() {
  const { rows, editing, setEditing, toggle, save } = useList<Employee>(e0);
  const fields: Field[] = [
    { key: 'name', label: 'Full name' },
    { key: 'role', label: 'Role', type: 'select', options: [{ value: 'cashier', label: 'Cashier' }, { value: 'manager', label: 'Manager' }, { value: 'administrator', label: 'Administrator' }] },
    { key: 'storeId', label: 'Store', type: 'select', options: s0.map(s => ({ value: s.id, label: s.name })) },
    { key: 'pin', label: '4-digit PIN', type: 'password' },
  ];
  return (
    <>
      <PageTitle title="Employees"><button className="btn primary" onClick={() => setEditing('new')}>+ New employee</button></PageTitle>
      <Table rows={rows} cols={[
        { head: 'ID', cell: r => r.id }, { head: 'Name', cell: r => <b>{r.name}</b> },
        { head: 'Role', cell: r => <span className="badge">{r.role}</span> }, { head: 'Store', cell: r => s0.find(s => s.id === r.storeId)?.name },
        { head: 'Status', cell: r => <StatusBadge on={r.active} yes="Enabled" no="Disabled" /> },
        { head: 'Enabled', cell: r => <Switch on={r.active} onChange={() => toggle(r.id, 'active')} /> },
        { head: '', cell: r => <Actions onEdit={() => setEditing(r)} /> },
      ]} />
      <p className="muted">Disabling an employee keeps their historical transactions intact.</p>
      {editing && <FormModal title={editing === 'new' ? 'New employee' : 'Edit employee'} fields={fields}
        initial={editing === 'new' ? { role: 'cashier' } : str(editing)} onClose={() => setEditing(null)}
        onSave={v => save({ id: editing === 'new' ? uid('e') : editing.id, name: v.name, role: v.role as Employee['role'], storeId: v.storeId, pin: v.pin, active: editing === 'new' ? true : editing.active })} />}
    </>
  );
}

export function Stores() {
  const st = useList<Store>(s0);
  const tm = useList<Terminal>(t0);
  return (
    <>
      <PageTitle title="Stores & terminals"><button className="btn primary" onClick={() => st.setEditing('new')}>+ New store</button><button className="btn" onClick={() => tm.setEditing('new')}>+ Register terminal</button></PageTitle>
      <Table rows={st.rows} cols={[
        { head: 'Store', cell: r => <b>{r.name}</b> }, { head: 'City', cell: r => r.city },
        { head: 'Terminals', num: true, cell: r => tm.rows.filter(t => t.storeId === r.id).length },
        { head: 'Active', cell: r => <Switch on={r.active} onChange={() => st.toggle(r.id, 'active')} /> },
      ]} />
      <h3>POS terminals</h3>
      <Table rows={tm.rows} cols={[
        { head: 'Terminal ID', cell: r => <code>{r.id}</code> }, { head: 'Name', cell: r => r.name },
        { head: 'Store', cell: r => st.rows.find(s => s.id === r.storeId)?.name },
        { head: 'Active', cell: r => <Switch on={r.active} onChange={() => tm.toggle(r.id, 'active')} /> },
      ]} />
      {st.editing && <FormModal title="New store" fields={[{ key: 'name', label: 'Store name' }, { key: 'city', label: 'City' }]} initial={{}} onClose={() => st.setEditing(null)}
        onSave={v => st.save({ id: uid('s'), name: v.name, city: v.city, active: true })} />}
      {tm.editing && <FormModal title="Register terminal" fields={[{ key: 'name', label: 'Terminal name' }, { key: 'storeId', label: 'Store', type: 'select', options: st.rows.map(s => ({ value: s.id, label: s.name })) }]} initial={{}} onClose={() => tm.setEditing(null)}
        onSave={v => tm.save({ id: `T-${String(tm.rows.length + 1).padStart(3, '0')}`, name: v.name, storeId: v.storeId, active: true })} />}
    </>
  );
}

export function Hardware() {
  const pr = useList<Printer>(pr0);
  const pm = useList<PaymentMethod>(pm0);
  const fields: Field[] = [
    { key: 'name', label: 'Printer name' },
    { key: 'type', label: 'Connection type', type: 'select', options: ['USB', 'Network', 'Serial'].map(v => ({ value: v, label: v })) },
    { key: 'connection', label: 'Connection details (port / IP:port / COM)' },
    { key: 'role', label: 'Role', type: 'select', options: ['Receipt', 'Kitchen', 'Bar'].map(v => ({ value: v, label: v })) },
  ];
  return (
    <>
      <PageTitle title="Printers & payment methods"><button className="btn primary" onClick={() => pr.setEditing('new')}>+ Register printer</button></PageTitle>
      <Table rows={pr.rows} cols={[
        { head: 'Name', cell: r => <b>{r.name}</b> }, { head: 'Type', cell: r => r.type }, { head: 'Connection', cell: r => <code>{r.connection}</code> },
        { head: 'Role', cell: r => r.role },
        { head: 'Status', cell: r => <span className={`badge ${r.status === 'online' ? 'ok' : 'danger'}`}>{r.status}</span> },
        { head: '', cell: () => <button className="btn sm">Test print</button> },
      ]} />
      <h3>Payment methods</h3>
      <Table rows={pm.rows} cols={[
        { head: 'Method', cell: r => <b>{r.name}</b> }, { head: 'Requires reference', cell: r => (r.needsReference ? 'Yes' : 'No') },
        { head: 'Enabled', cell: r => <Switch on={r.active} onChange={() => pm.toggle(r.id, 'active')} /> },
      ]} />
      {pr.editing && <FormModal title="Register printer" fields={fields} initial={{ type: 'USB', role: 'Receipt' }} onClose={() => pr.setEditing(null)}
        onSave={v => pr.save({ id: uid('pr'), name: v.name, type: v.type as Printer['type'], connection: v.connection, role: v.role as Printer['role'], status: 'online' })} />}
    </>
  );
}

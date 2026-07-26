import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { X, KeyRound } from 'lucide-react';

import type { Permission, Role } from '../../types/rbac';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: Permission[];
  currentPermissionIds: number[];
  loading: boolean;
  onSave: (permissionIds: number[]) => Promise<void> | void;
}


const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  allPermissions,
  currentPermissionIds,
  loading,
  onSave,
}) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set(currentPermissionIds));
  }, [isOpen, currentPermissionIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of allPermissions) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (perms: Permission[]) => {
    const allChecked = perms.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (allChecked ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await onSave(Array.from(selected));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-95">
              <Dialog.Panel className="w-full max-w-2xl rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-slate-900">Permissions — {role?.name}</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">Saving replaces this role's entire permission set.</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                  {loading ? (
                    <div className="text-center py-10 text-sm text-slate-400">Loading permissions...</div>
                  ) : grouped.length === 0 ? (
                    <div className="text-center py-10 text-sm text-slate-400">No permissions defined yet.</div>
                  ) : (
                    grouped.map(([module, perms]) => {
                      const allChecked = perms.every((p) => selected.has(p.id));
                      const someChecked = perms.some((p) => selected.has(p.id));
                      return (
                        <div key={module}>
                          <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              ref={(el) => {
                                if (el) el.indeterminate = someChecked && !allChecked;
                              }}
                              onChange={() => toggleModule(perms)}
                              className="w-4 h-4 rounded accent-primary"
                            />
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{module}</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                            {perms.map((p) => (
                              <label key={p.id} className="flex items-start gap-2 bg-slate-50 rounded p-2.5 cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selected.has(p.id)}
                                  onChange={() => toggle(p.id)}
                                  className="w-4 h-4 rounded accent-primary mt-0.5"
                                />
                                <span>
                                  <span className="block text-xs font-bold text-slate-800">
                                    {p.resource}.{p.action}
                                  </span>
                                  {p.description && <span className="block text-[11px] text-slate-400">{p.description}</span>}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-50 bg-slate-50/50">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <KeyRound className="w-3.5 h-3.5" /> {selected.size} permission{selected.size === 1 ? '' : 's'} selected
                  </span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={submitting || loading}
                      className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Save Permissions'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RolePermissionsModal;

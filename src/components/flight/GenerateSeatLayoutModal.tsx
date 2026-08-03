import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, Plus, Trash2, LayoutGrid } from 'lucide-react';

import type { SeatClass, SeatRowGroupInput } from '../../types/api';

const SEAT_TYPES = ['WINDOW', 'MIDDLE', 'AISLE'] as const;

interface RowGroupDraft {
  seat_class_id: number;
  row_start: number;
  row_end: number;
  seat_letters: string;
  seat_type: string;
  exit_rows: string;
}

const emptyGroup = (): RowGroupDraft => ({
  seat_class_id: 0,
  row_start: 1,
  row_end: 1,
  seat_letters: 'ABCDEF',
  seat_type: 'WINDOW',
  exit_rows: '',
});

interface GenerateSeatLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatClasses: SeatClass[];
  onGenerate: (layout: SeatRowGroupInput[]) => Promise<void> | void;
}

/**
 * POST /flights/aircrafts/{id}/seats/generate. Each row-group is a
 * block of consecutive rows sharing one seat class -- e.g. rows 1-4
 * Business "AC", rows 5-30 Economy "ABCDEF". seat_type here is applied
 * to every seat the group generates (backend doesn't compute
 * window/aisle per-letter automatically) -- for a mixed group, submit
 * it and edit individual seats isn't supported by this endpoint, so
 * most callers just pick the type that best describes the block, or
 * generate narrower groups (e.g. one group per seat_type) if it matters.
 * Fails (400) if the layout overlaps rows/letters already generated --
 * clear the existing layout first if replacing it.
 */
const GenerateSeatLayoutModal: React.FC<GenerateSeatLayoutModalProps> = ({
  isOpen,
  onClose,
  seatClasses,
  onGenerate,
}) => {
  const [groups, setGroups] = useState<RowGroupDraft[]>([emptyGroup()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroups([emptyGroup()]);
      setError('');
    }
  }, [isOpen]);

  const updateGroup = (index: number, patch: Partial<RowGroupDraft>) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  };

  const addGroup = () => setGroups((prev) => [...prev, emptyGroup()]);
  const removeGroup = (index: number) => setGroups((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError('');
    for (const g of groups) {
      if (!g.seat_class_id) {
        setError('Every row group needs a seat class selected.');
        return;
      }
      if (g.row_end < g.row_start) {
        setError('Row end must be greater than or equal to row start.');
        return;
      }
      if (!g.seat_letters.trim()) {
        setError('Every row group needs seat letters (e.g. ABCDEF).');
        return;
      }
    }

    const layout: SeatRowGroupInput[] = groups.map((g) => ({
      seat_class_id: g.seat_class_id,
      row_start: g.row_start,
      row_end: g.row_end,
      seat_letters: g.seat_letters.toUpperCase().replace(/[^A-Z]/g, ''),
      seat_type: g.seat_type,
      exit_rows: g.exit_rows
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    }));

    setSubmitting(true);
    try {
      await onGenerate(layout);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-slate-900">Generate Seat Layout</Dialog.Title>
                      <p className="text-xs text-slate-500 font-medium">
                        One row group per seat-class block. Fails if it overlaps an existing layout.
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                  {groups.map((g, i) => (
                    <div key={i} className="rounded-md bg-slate-50 p-4 space-y-3 relative">
                      {groups.length > 1 && (
                        <button
                          onClick={() => removeGroup(i)}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-all"
                          title="Remove row group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Row Group {i + 1}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seat Class</label>
                          <select
                            value={g.seat_class_id}
                            onChange={(e) => updateGroup(i, { seat_class_id: Number(e.target.value) })}
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                          >
                            <option value={0}>Select</option>
                            {seatClasses.map((sc) => (
                              <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seat Type</label>
                          <select
                            value={g.seat_type}
                            onChange={(e) => updateGroup(i, { seat_type: e.target.value })}
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                          >
                            {SEAT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Row Start</label>
                          <input
                            type="number"
                            min={1}
                            value={g.row_start}
                            onChange={(e) => updateGroup(i, { row_start: Number(e.target.value) })}
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Row End</label>
                          <input
                            type="number"
                            min={1}
                            value={g.row_end}
                            onChange={(e) => updateGroup(i, { row_end: Number(e.target.value) })}
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seat Letters</label>
                          <input
                            value={g.seat_letters}
                            onChange={(e) => updateGroup(i, { seat_letters: e.target.value })}
                            placeholder="ABCDEF"
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none font-mono uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exit Rows (optional)</label>
                          <input
                            value={g.exit_rows}
                            onChange={(e) => updateGroup(i, { exit_rows: e.target.value })}
                            placeholder="12, 13"
                            className="w-full bg-white border-none rounded py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addGroup}
                    className="w-full py-3 rounded border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-all text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Row Group
                  </button>

                  {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
                </div>

                <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
                  >
                    {submitting ? 'Generating...' : 'Generate Layout'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GenerateSeatLayoutModal;

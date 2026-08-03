import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  Building2,
  Hash,
  LayoutGrid,
  Trash2,
  RectangleHorizontal,
  DoorOpen,
} from 'lucide-react';

import { aircraftsApi, seatClassesApi } from '../../services/api-services';
import type { Aircraft, AircraftSeat, SeatClass, SeatRowGroupInput } from '../../types/api';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import GenerateSeatLayoutModal from '../../components/flight/GenerateSeatLayoutModal';

const CLASS_COLORS = [
  'bg-primary/15 text-primary ring-primary/20',
  'bg-violet-100 text-violet-700 ring-violet-200',
  'bg-amber-100 text-amber-700 ring-amber-200',
  'bg-sky-100 text-sky-700 ring-sky-200',
  'bg-rose-100 text-rose-700 ring-rose-200',
];

const AircraftDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aircraftId = Number(id);

  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [seats, setSeats] = useState<AircraftSeat[]>([]);
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s, sc] = await Promise.all([
        aircraftsApi.getAircraftById(aircraftId),
        aircraftsApi.getSeatLayout(aircraftId),
        seatClassesApi.getSeatClasses(),
      ]);
      setAircraft(a);
      setSeats(s);
      setSeatClasses(sc.Items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load aircraft');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!aircraftId || Number.isNaN(aircraftId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraftId]);

  const seatClassById = useMemo(() => {
    const map = new Map<number, SeatClass>();
    for (const sc of seatClasses) map.set(sc.id, sc);
    return map;
  }, [seatClasses]);

  const seatClassColor = useMemo(() => {
    const ids = Array.from(new Set(seats.map((s) => s.seat_class_id))).sort((a, b) => a - b);
    const map = new Map<number, string>();
    ids.forEach((cid, i) => map.set(cid, CLASS_COLORS[i % CLASS_COLORS.length]));
    return map;
  }, [seats]);

  // Group seats by row_number, and collect the full set of letters used
  // across the whole aircraft so every row renders the same columns
  // (rows with fewer seats -- e.g. business "AC" vs economy "ABCDEF" --
  // just leave gaps in the columns they don't use).
  const { rows, allLetters } = useMemo(() => {
    const rowMap = new Map<number, Map<string, AircraftSeat>>();
    const letters = new Set<string>();
    for (const seat of seats) {
      letters.add(seat.seat_letter);
      if (!rowMap.has(seat.row_number)) rowMap.set(seat.row_number, new Map());
      rowMap.get(seat.row_number)!.set(seat.seat_letter, seat);
    }
    const sortedLetters = Array.from(letters).sort();
    const sortedRows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
    return { rows: sortedRows, allLetters: sortedLetters };
  }, [seats]);

  const handleGenerate = async (layout: SeatRowGroupInput[]) => {
    try {
      await aircraftsApi.generateSeatLayout(aircraftId, { layout });
      showSuccessAlert('Seat layout generated');
      setGenerateOpen(false);
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to generate seat layout -- it may overlap an existing one.');
    }
  };

  const handleClear = async () => {
    const confirmed = await showConfirmAlert(
      'Clear Seat Layout',
      'This removes every seat for this aircraft. Blocked if flights already exist for it.',
    );
    if (!confirmed) return;
    try {
      await aircraftsApi.clearSeatLayout(aircraftId);
      showSuccessAlert('Seat layout cleared');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to clear seat layout -- flights may already exist for this aircraft.');
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium italic">Loading aircraft...</p>
      </div>
    );
  }

  if (!aircraft) {
    return (
      <div className="p-20 text-center">
        <p className="text-slate-500 font-medium">Aircraft not found.</p>
        <button onClick={() => navigate('/aircraft')} className="mt-4 text-primary font-bold text-sm">
          Back to fleet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <button
          onClick={() => navigate('/aircraft')}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{aircraft.model}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{aircraft.manufacturer}</span>
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{aircraft.registration_number}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {seats.length > 0 && (
              <button
                onClick={handleClear}
                className="premium-button bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear Layout
              </button>
            )}
            <button
              onClick={() => setGenerateOpen(true)}
              className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" /> {seats.length > 0 ? 'Add More Rows' : 'Generate Layout'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 font-medium">Total Seats</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{seats.length}</h3>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 font-medium">Rows</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{rows.length}</h3>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 font-medium">Seat Classes</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{seatClassColor.size}</h3>
        </div>
      </div>

      <div className="premium-card p-8">
        {seats.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No seat layout generated yet</p>
            <p className="text-slate-400 text-sm mt-1">This aircraft has no bookable seats until a layout is generated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              {Array.from(seatClassColor.entries()).map(([classId, color]) => (
                <div key={classId} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ring-1 ring-inset ${color}`} />
                  <span className="text-xs font-semibold text-slate-600">
                    {seatClassById.get(classId)?.name ?? `Seat Class #${classId}`}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">Exit Row</span>
              </div>
            </div>

            {/* Seat grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column header (letters) */}
                <div className="flex items-center gap-1.5 mb-2 pl-12">
                  {allLetters.map((letter) => (
                    <div key={letter} className="w-10 text-center text-[10px] font-bold text-slate-400 uppercase">
                      {letter}
                    </div>
                  ))}
                </div>

                {rows.map(([rowNumber, letterMap]) => {
                  const isExitRow = Array.from(letterMap.values()).some((s) => s.is_exit_row);
                  return (
                    <div key={rowNumber}>
                      {isExitRow && (
                        <div className="flex items-center gap-1.5 pl-12 my-1">
                          <div className="flex-1 border-t border-dashed border-slate-200" />
                          <DoorOpen className="w-3.5 h-3.5 text-slate-300" />
                          <div className="flex-1 border-t border-dashed border-slate-200" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-10 text-xs font-bold text-slate-400 text-right pr-2">{rowNumber}</div>
                        {allLetters.map((letter) => {
                          const seat = letterMap.get(letter);
                          if (!seat) return <div key={letter} className="w-10 h-10" />;
                          const color = seatClassColor.get(seat.seat_class_id) ?? CLASS_COLORS[0];
                          return (
                            <div
                              key={letter}
                              title={`${seat.seat_number} — ${seatClassById.get(seat.seat_class_id)?.name ?? ''} (${seat.seat_type})`}
                              className={`relative w-10 h-10 rounded flex items-center justify-center text-[10px] font-bold ring-1 ring-inset cursor-default ${color}`}
                            >
                              <RectangleHorizontal className="w-3 h-3 opacity-40 absolute" />
                              <span className="relative">{seat.seat_letter}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <GenerateSeatLayoutModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        seatClasses={seatClasses}
        onGenerate={handleGenerate}
      />
    </div>
  );
};

export default AircraftDetailPage;

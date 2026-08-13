import { ArrowRight, Clock, PlaneTakeoff, Repeat } from 'lucide-react';

import type { Airport, FareClass, Itinerary } from '../../types/api';
import { PASSENGER_TYPES } from '../../types/api';

interface ItineraryCardProps {
  itinerary: Itinerary;
  airportById: Map<number, Airport>;
  fareClassById?: Map<number, FareClass>;
  /** When set, fare options become clickable buttons that call this with the chosen fare_class_id. */
  onSelectFare?: (fareClassId: number) => void;
  selectedFareClassId?: number;
}

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const airportLabel = (airportById: Map<number, Airport>, id: number) => {
  const a = airportById.get(id);
  return a ? `${a.code} · ${a.city}` : `#${id}`;
};

const ItineraryCard = ({
  itinerary,
  airportById,
  fareClassById,
  onSelectFare,
  selectedFareClassId,
}: ItineraryCardProps) => {
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];

  return (
    <div className="premium-card p-5 space-y-4">
      {/* Route summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span>{airportLabel(airportById, first.departure_airport_id)}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span>{airportLabel(airportById, last.arrival_airport_id)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(itinerary.duration_minutes)}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full font-bold ${
              itinerary.stops === 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {itinerary.stops === 0 ? 'Direct' : `${itinerary.stops} stop${itinerary.stops > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Per-segment breakdown */}
      <div className="space-y-2">
        {itinerary.segments.map((seg, i) => (
          <div key={seg.flight_id}>
            <div className="flex items-center gap-3 text-sm bg-slate-50/70 rounded px-3 py-2.5">
              <PlaneTakeoff className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800">
                  {seg.flight_number} · {airportLabel(airportById, seg.departure_airport_id)} → {airportLabel(airportById, seg.arrival_airport_id)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatDateTime(seg.departure_time)} → {formatDateTime(seg.arrival_time)}
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{seg.status}</span>
            </div>

            {/* Connection indicator between this segment and the next */}
            {i < itinerary.segments.length - 1 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-3 py-1.5">
                <Repeat className="w-3.5 h-3.5" />
                {itinerary.aircraft_changed[i]
                  ? `Change of aircraft at ${airportLabel(airportById, seg.arrival_airport_id)}`
                  : `Continues on the same aircraft from ${airportLabel(airportById, seg.arrival_airport_id)}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fares */}
      {itinerary.fares.length === 0 ? (
        <p className="text-xs text-slate-400">No fares available for this itinerary.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {itinerary.fares.map((fare) => {
            const fc = fareClassById?.get(fare.fare_class_id);
            const label = fc ? `${fc.code} — ${fc.name}` : `Fare class #${fare.fare_class_id}`;
            const selected = selectedFareClassId === fare.fare_class_id;
            // Show only the passenger types this fare actually has a
            // price for -- a fare with just an ADT price shouldn't
            // imply CHD/INF are bookable on it too.
            const priceLine = PASSENGER_TYPES.filter((pt) => fare.prices[pt] != null)
              .map((pt) => `${pt} ${fare.currency} ${fare.prices[pt]}`)
              .join(' · ');
            const content = (
              <>
                <div className="font-bold">{label}</div>
                <div className="text-xs opacity-80">
                  {priceLine || 'No price set'} · {fare.available_seats} seats left
                </div>
              </>
            );
            return onSelectFare ? (
              <button
                key={fare.fare_class_id}
                type="button"
                onClick={() => onSelectFare(fare.fare_class_id)}
                className={`text-left px-3.5 py-2 rounded border transition-colors ${
                  selected
                    ? 'border-primary bg-teal-50 text-primary'
                    : 'border-slate-200 hover:border-primary/50 text-slate-700'
                }`}
              >
                {content}
              </button>
            ) : (
              <div key={fare.fare_class_id} className="px-3.5 py-2 rounded border border-slate-200 text-slate-700">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItineraryCard;

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  UserRound,
} from 'lucide-react';

export type PassengerState = {
  adults: number;
  children: number;
  infants: number;
  class: 'ECONOMY' | 'BUSINESS' | 'FIRST';
};

type PassengerSelectorProps = {
  value: PassengerState;
  onChange: (value: PassengerState) => void;
};

const CABIN_CLASSES: {
  value: PassengerState['class'];
  label: string;
}[] = [
  {
    value: 'ECONOMY',
    label: 'Economy Class',
  },
  {
    value: 'BUSINESS',
    label: 'Business Class',
  },
  {
    value: 'FIRST',
    label: 'First Class',
  },
];

const PassengerSelector = ({
  value,
  onChange,
}: PassengerSelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updatePassenger = (
    type: 'adults' | 'children' | 'infants',
    delta: number,
  ) => {
    const current = value[type];
    const next = current + delta;

    // Minimal 1 adult
    if (type === 'adults' && next < 1) {
      return;
    }

    // Children and infants can be 0
    if (type !== 'adults' && next < 0) {
      return;
    }

    // Optional: infant cannot exceed adult
    if (type === 'infants' && next > value.adults) {
      return;
    }

    onChange({
      ...value,
      [type]: next,
    });
  };

  const totalPassengers =
    value.adults + value.children + value.infants;

  const passengerLabel = [
    `${totalPassengers} Penumpang`,
    value.class === 'ECONOMY'
      ? 'Economy'
      : value.class === 'BUSINESS'
        ? 'Business'
        : 'First',
  ].join(', ');

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-semibold text-slate-600 mb-2 block">
        Penumpang & Kelas
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          w-full min-h-12.5
          px-4 py-1
          rounded
          border
          bg-white
          flex items-center justify-between
          text-left
          transition
          ${
            open
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-slate-200 hover:border-slate-300'
          }
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <UserRound className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {passengerLabel}
            </div>

            <div className="text-xs text-slate-400 mt-0.5">
              {value.adults} Dewasa
              {value.children > 0 && ` · ${value.children} Anak`}
              {value.infants > 0 && ` · ${value.infants} Bayi`}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`
            w-4 h-4 text-slate-400 shrink-0 transition-transform
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden min-w-130">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Passengers */}
              <div>
                <h3 className="text-sm font-bold text-primary mb-5">
                  Pilih jumlah penumpang
                </h3>

                <div className="space-y-6">
                  <PassengerRow
                    title="Dewasa"
                    description="Usia penumpang > 11 tahun"
                    value={value.adults}
                    min={1}
                    onDecrease={() =>
                      updatePassenger('adults', -1)
                    }
                    onIncrease={() =>
                      updatePassenger('adults', 1)
                    }
                  />

                  <PassengerRow
                    title="Anak"
                    description="Usia penumpang 2 - 11 tahun"
                    value={value.children}
                    min={0}
                    onDecrease={() =>
                      updatePassenger('children', -1)
                    }
                    onIncrease={() =>
                      updatePassenger('children', 1)
                    }
                  />

                  <PassengerRow
                    title="Bayi"
                    description="Usia penumpang 0 - 23 bulan"
                    value={value.infants}
                    min={0}
                    onDecrease={() =>
                      updatePassenger('infants', -1)
                    }
                    onIncrease={() =>
                      updatePassenger('infants', 1)
                    }
                  />
                </div>
              </div>

              {/* Cabin Class */}
              <div>
                <h3 className="text-sm font-bold text-primary mb-5">
                  Pilih kelas kabin
                </h3>

                <div className="space-y-5">
                  {CABIN_CLASSES.map((cabinClass) => {
                    const selected =
                      value.class === cabinClass.value;

                    return (
                      <button
                        key={cabinClass.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,
                            class: cabinClass.value,
                          })
                        }
                        className={`
                          w-full
                          flex items-center justify-between
                          text-left
                          group
                        `}
                      >
                        <span
                          className={`
                            text-sm font-medium
                            ${
                              selected
                                ? 'text-slate-800'
                                : 'text-slate-500 group-hover:text-slate-700'
                            }
                          `}
                        >
                          {cabinClass.label}
                        </span>

                        <span
                          className={`
                            w-7 h-7
                            rounded-full
                            border-2
                            flex items-center justify-center
                            transition
                            ${
                              selected
                                ? 'border-slate-800'
                                : 'border-slate-400'
                            }
                          `}
                        >
                          {selected && (
                            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                onChange({
                  adults: 1,
                  children: 0,
                  infants: 0,
                  class: 'ECONOMY',
                })
              }
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              Atur ulang
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-secondary text-white text-sm font-semibold transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

type PassengerRowProps = {
  title: string;
  description: string;
  value: number;
  min: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

const PassengerRow = ({
  title,
  description,
  value,
  min,
  onDecrease,
  onIncrease,
}: PassengerRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-bold text-slate-800">
          {title}
        </div>

        <div className="text-xs text-slate-400 mt-1">
          {description}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          disabled={value <= min}
          onClick={onDecrease}
          className={`
            w-10 h-10 rounded-lg
            flex items-center justify-center
            border
            transition
            ${
              value <= min
                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
            }
          `}
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="w-5 text-center text-sm font-bold text-slate-800">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrease}
          className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:border-primary hover:text-primary transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PassengerSelector;

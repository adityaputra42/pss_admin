import { ShieldAlert } from 'lucide-react';

/**
 * ⚠️ Backend reality: there is no baggage module, table, or endpoint
 * ANYWHERE in pss_modular_cqrs. checkin's request body has a
 * baggage_count/baggage_weight_kg pair recorded alongside a check-in
 * (see CheckinPage.tsx), but that's it -- no baggage tracking, status,
 * listing, or update capability exists server-side. See baggage.ts.
 */
const BaggagePage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Baggage</h1>
        <p className="text-slate-500 mt-1">Track and manage passenger baggage.</p>
      </div>

      <div className="premium-card p-10 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-lg font-bold text-slate-900">Not available yet</h2>
          <p className="text-sm text-slate-500">
            pss_modular_cqrs has no baggage module at all. The only baggage-related data that
            exists is an optional baggage_count/baggage_weight_kg recorded at check-in time --
            there's no tracking, status, or listing capability to build a page around.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BaggagePage;

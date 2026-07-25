import { useState } from 'react';
import { Search, ShieldAlert, Armchair } from 'lucide-react';

import { showErrorAlert } from '../../utils/alerts';
import ScaleIn from '../../components/animations/ScaleIn';
import { boardingPassApi } from '../../services/api-services';
import type { BoardingPass } from '../../types/api';
import DetailTable from '../../components/common/DetailTable';

/**
 * ⚠️ Backend reality: there is no separate boarding-pass module, list, or
 * reprint action (see boardingPass.ts) -- this is a single lookup by
 * passenger_id + segment_id, same endpoint as the boarding-pass lookup
 * on the Check-in page.
 */
const BoardingPassPage = () => {
  const [passengerId, setPassengerId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pass, setPass] = useState<BoardingPass | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async () => {
    if (!passengerId || !segmentId) return;
    setIsLoading(true);
    setSearched(true);
    setPass(null);
    try {
      const result = await boardingPassApi.getBoardingPass(passengerId, segmentId);
      setPass(result);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'No boarding pass found.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Boarding Pass</h1>
        <p className="text-slate-500 mt-1">Look up a boarding pass by passenger and segment.</p>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          No list or reprint action exists on the backend -- this is a single-lookup tool.
        </p>
      </div>

      <div className="premium-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            placeholder="Passenger ID"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="number"
            placeholder="Segment ID"
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            onClick={handleLookup}
            disabled={isLoading || !passengerId || !segmentId}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Look Up'}
          </button>
        </div>
      </div>

      {searched && !isLoading && (
        pass ? (
          <ScaleIn>
          <div className="premium-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Armchair className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{pass.BoardingPassNumber}</h2>
                <p className="text-sm text-slate-500">Group {pass.BoardingGroup} · Gate {pass.Gate}</p>
              </div>
            </div>
            <DetailTable
              rows={[
                { label: 'Boarding Pass #', value: pass.BoardingPassNumber },
                { label: 'Group', value: pass.BoardingGroup },
                { label: 'Gate', value: pass.Gate },
                { label: 'Status', value: pass.Status },
                { label: 'Boarding Time', value: pass.BoardingTime ?? '-' },
                { label: 'Baggage Count', value: pass.BaggageCount },
                { label: 'Checked In At', value: pass.CheckedInAt },
              ]}
            />
          </div>
          </ScaleIn>
        ) : (
          <div className="premium-card p-16 text-center">
            <p className="text-slate-500 font-medium">No boarding pass found.</p>
          </div>
        )
      )}
    </div>
  );
};

export default BoardingPassPage;

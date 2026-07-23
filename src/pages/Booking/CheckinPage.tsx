import { useState } from 'react';
import {
  Ticket,
  ShieldAlert,
  CheckCircle2,
  Search,
} from 'lucide-react';

import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { checkinsApi } from '../../services/api-services';
import type { Checkin, BoardingPass } from '../../types/api';

/**
 * ⚠️ Backend reality: checkin's only endpoints are POST /checkin
 * (by ticket_number) and GET /checkin/boarding-pass (by passenger_id +
 * segment_id). No list endpoint exists -- this page is a check-in action
 * form plus a boarding-pass lookup, not a check-ins table.
 */
const CheckinPage = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [baggageCount, setBaggageCount] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinResult, setCheckinResult] = useState<Checkin | null>(null);

  const [passengerId, setPassengerId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null);

  const handleCheckIn = async () => {
    if (!ticketNumber) return;
    setIsCheckingIn(true);
    setCheckinResult(null);
    try {
      const result = await checkinsApi.checkIn({
        ticket_number: ticketNumber,
        baggage_count: baggageCount ? Number(baggageCount) : undefined,
      });
      setCheckinResult(result);
      showSuccessAlert('Checked in successfully!');
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Check-in failed.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleLookupBoardingPass = async () => {
    if (!passengerId || !segmentId) return;
    setIsLookingUp(true);
    setBoardingPass(null);
    try {
      const result = await checkinsApi.getBoardingPass(passengerId, segmentId);
      setBoardingPass(result);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'No boarding pass found.');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Check-in</h1>
        <p className="text-slate-500 mt-1">Check in a passenger by ticket number, or look up a boarding pass.</p>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          No check-in activity list exists on the backend -- this page performs actions, it doesn't browse history.
        </p>
      </div>

      <div className="premium-card p-8 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Check In Passenger</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Ticket number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="number"
            placeholder="Baggage count (optional)"
            value={baggageCount}
            onChange={(e) => setBaggageCount(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !ticketNumber}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            {isCheckingIn ? 'Checking in...' : 'Check In'}
          </button>
        </div>

        {checkinResult && (
          <div className="mt-4 p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold">Checked in: {checkinResult.passenger_name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-slate-500">Booking code</span><div className="font-bold text-slate-900">{checkinResult.booking_code}</div></div>
              <div><span className="text-slate-500">Flight</span><div className="font-bold text-slate-900">{checkinResult.flight_number}</div></div>
              <div><span className="text-slate-500">Seat</span><div className="font-bold text-slate-900">{checkinResult.seat_number}</div></div>
              <div><span className="text-slate-500">Gate</span><div className="font-bold text-slate-900">{checkinResult.gate}</div></div>
              <div><span className="text-slate-500">Boarding pass #</span><div className="font-bold text-slate-900">{checkinResult.boarding_pass_number}</div></div>
              <div><span className="text-slate-500">Boarding time</span><div className="font-bold text-slate-900">{checkinResult.boarding_time}</div></div>
            </div>
          </div>
        )}
      </div>

      <div className="premium-card p-8 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Look Up Boarding Pass</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            placeholder="Passenger ID"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="number"
            placeholder="Segment ID"
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            onClick={handleLookupBoardingPass}
            disabled={isLookingUp || !passengerId || !segmentId}
            className="premium-button bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isLookingUp ? 'Looking up...' : 'Look Up'}
          </button>
        </div>

        {boardingPass && (
          <div className="mt-4 p-6 bg-slate-50 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-500">Boarding pass #</span><div className="font-bold text-slate-900">{boardingPass.BoardingPassNumber}</div></div>
            <div><span className="text-slate-500">Group</span><div className="font-bold text-slate-900">{boardingPass.BoardingGroup}</div></div>
            <div><span className="text-slate-500">Gate</span><div className="font-bold text-slate-900">{boardingPass.Gate}</div></div>
            <div><span className="text-slate-500">Status</span><div className="font-bold text-slate-900">{boardingPass.Status}</div></div>
            <div><span className="text-slate-500">Boarding time</span><div className="font-bold text-slate-900">{boardingPass.BoardingTime ?? '-'}</div></div>
            <div><span className="text-slate-500">Baggage count</span><div className="font-bold text-slate-900">{boardingPass.BaggageCount}</div></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinPage;

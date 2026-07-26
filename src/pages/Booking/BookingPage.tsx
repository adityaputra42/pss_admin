import { useState } from 'react';

import {
  Ticket,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

import {
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { bookingsApi } from '../../services/api-services/booking';
import ScaleIn from '../../components/animations/ScaleIn';
import DetailTable from '../../components/common/DetailTable';

import type { PNR } from '../../types/api';

const BookingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PNR | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [flightId, setFlightId] = useState('');
  const [fareClassId, setFareClassId] = useState('');
  const [flightSeatId, setFlightSeatId] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passengerType, setPassengerType] = useState('ADULT');

  const handleSubmit = async () => {
    if (!fullName || !phone || !flightId || !fareClassId || !firstName || !lastName) {
      showErrorAlert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    try {
      const pnr = await bookingsApi.createBooking({
        contact: { full_name: fullName, email: email || undefined, phone },
        passengers: [
          {
            passenger_type: passengerType,
            first_name: firstName,
            last_name: lastName,
          },
        ],
        segments: [{ flight_id: Number(flightId), fare_class_id: Number(fareClassId) }],
        seat_selections: flightSeatId
          ? [{ passenger_index: 0, segment_index: 0, flight_seat_id: Number(flightSeatId) }]
          : [],
      });
      setResult(pnr);
      showSuccessAlert('Booking created!');
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings</h1>
        <p className="text-slate-500 mt-1">Create a quick booking (single passenger, single segment).</p>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          No bookings list, detail, or cancel exists on the backend -- this form only creates.
          You'll need a flight_id/fare_class_id in hand (check the Flights page).
        </p>
      </div>

      <div className="premium-card p-8 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Passenger</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <select value={passengerType} onChange={(e) => setPassengerType(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20">
              <option value="ADULT">Adult</option>
              <option value="CHILD">Child</option>
              <option value="INFANT">Infant</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Flight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input type="number" placeholder="Fare Class ID" value={fareClassId} onChange={(e) => setFareClassId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input type="number" placeholder="Flight Seat ID (optional)" value={flightSeatId} onChange={(e) => setFlightSeatId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          {isSubmitting ? 'Creating booking...' : 'Create Booking'}
        </button>
      </div>

      {result && (
        <ScaleIn>
        <div className="premium-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Booking Created</h2>
          </div>
          <DetailTable
            rows={[
              { label: 'Booking Code', value: result.BookingCode },
              { label: 'PNR ID', value: result.PNRID },
              { label: 'Status', value: result.Status },
              { label: 'Total', value: `${result.Currency} ${result.TotalAmount}` },
            ]}
          />
        </div>
        </ScaleIn>
      )}
    </div>
  );
};

export default BookingPage;

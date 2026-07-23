import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import UserFormModal from '../../components/users/UserFormModal';
import {
  showSuccessAlert,
  showErrorAlert,
} from '../../utils/alerts';
import { Plus, ShieldAlert, Power, PowerOff, Lock } from 'lucide-react';

/**
 * ⚠️ Backend reality: pss_modular_cqrs's auth module has no GET /users
 * (list) or GET /users/{id} endpoint at all -- only create, update-by-id,
 * and set-status-by-id (all blind writes, no read-back). This page can't
 * show a browsable directory; it exposes the 3 real actions instead.
 * See users.ts for the full endpoint inventory.
 */
const UsersPage = () => {
  const { lastUser, isSubmitting, createUser, setUserStatus } = useUsers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [statusUserId, setStatusUserId] = useState('');
  const [statusValue, setStatusValue] = useState<'ACTIVE' | 'LOCKED' | 'INACTIVE'>('ACTIVE');

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createUser(data as any);
      showSuccessAlert('User created successfully!');
      setIsCreateOpen(false);
    } catch (err: any) {
      showErrorAlert(err.response?.data?.message || err.message || 'Failed to create user.');
    }
  };

  const handleSetStatus = async () => {
    if (!statusUserId) return;
    try {
      await setUserStatus(statusUserId, statusValue);
      showSuccessAlert(`User #${statusUserId} status set to ${statusValue}.`);
    } catch (err: any) {
      showErrorAlert(err.response?.data?.message || err.message || 'Failed to change status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Create staff accounts and manage their status by ID.</p>
        </div>
        <button
            onClick={() => setIsCreateOpen(true)}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          There's no user directory here on purpose: the backend has no endpoint to list or look
          up users. You can create an account, or change a user's status if you already know their ID.
        </p>
      </div>

      <div className="premium-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Change User Status</h2>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">User ID</label>
            <input
              type="number"
              value={statusUserId}
              onChange={(e) => setStatusUserId(e.target.value)}
              className="bg-slate-50 border-none rounded py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 w-40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Status</label>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value as any)}
              className="bg-slate-50 border-none rounded py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCKED">LOCKED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <button
            onClick={handleSetStatus}
            disabled={isSubmitting || !statusUserId}
            className="premium-button bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
          >
            {statusValue === 'ACTIVE' ? <Power className="w-4 h-4" /> : statusValue === 'LOCKED' ? <Lock className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
            Apply
          </button>
        </div>
      </div>

      {lastUser && (
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Last Created/Updated User</h2>
          <pre className="text-xs bg-slate-50 rounded p-4 overflow-x-auto">
            {JSON.stringify(
              { id: lastUser.id, username: lastUser.username, full_name: lastUser.full_name, email: lastUser.email, role_id: lastUser.role_id, status: lastUser.status },
              null,
              2,
            )}
          </pre>
        </div>
      )}

      <UserFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        user={null}
        onSave={handleCreate}
      />
    </div>
  );
};

export default UsersPage;

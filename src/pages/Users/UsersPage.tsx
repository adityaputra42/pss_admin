import { useEffect, useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import UserFormModal from '../../components/users/UserFormModal';
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from '../../utils/alerts';
import { Plus, Power, PowerOff, Lock, Search, Edit3, Users as UsersIcon } from 'lucide-react';
import { usersApi } from '../../services/api-services';
import type { User } from '../../types/api';

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  LOCKED: 'bg-amber-50 text-amber-600 ring-amber-100',
  INACTIVE: 'bg-slate-100 text-slate-500 ring-slate-200',
};

/**
 * Full directory view against GET /auth/users + GET /auth/users/{id}
 * (added alongside ListUsersHandler/GetUserHandler -- previously there
 * was no way to browse users at all, only blind create/update/status by
 * a manually-typed id, see git history on this file).
 */
const UsersPage = () => {
  const { isSubmitting, createUser, updateUser, setUserStatus } = useUsers();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(1, 100);
      setUsers(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const keyword = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.full_name?.toLowerCase().includes(keyword)
    );
  });

  const handleSave = async (data: Record<string, unknown>, userId: number | null) => {
    try {
      if (userId) {
        await updateUser(String(userId), data as any);
        showSuccessAlert('User updated successfully!');
      } else {
        await createUser(data as any);
        showSuccessAlert('User created successfully!');
      }
      setIsFormOpen(false);
      loadUsers();
    } catch (err: any) {
      showErrorAlert(err.response?.data?.message || err.message || 'Failed to save user.');
    }
  };

  const handleCycleStatus = async (user: User, status: 'ACTIVE' | 'LOCKED' | 'INACTIVE') => {
    if (user.status === status) return;
    const confirmed = await showConfirmAlert(
      `Set status to ${status}`,
      `Change ${user.username}'s status from ${user.status} to ${status}?`,
    );
    if (!confirmed) return;
    try {
      await setUserStatus(String(user.id), status);
      showSuccessAlert(`User status set to ${status}.`);
      loadUsers();
    } catch (err: any) {
      showErrorAlert(err.response?.data?.message || err.message || 'Failed to change status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Browse accounts, edit profiles, and manage status.</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsFormOpen(true); }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="premium-card p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search username, email, or full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium italic">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No users found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{user.role_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${statusStyle[user.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingUser(user); setIsFormOpen(true); }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                        title="Edit profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {user.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleCycleStatus(user, 'ACTIVE')}
                          disabled={isSubmitting}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all disabled:opacity-50"
                          title="Set ACTIVE"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                      {user.status !== 'LOCKED' && (
                        <button
                          onClick={() => handleCycleStatus(user, 'LOCKED')}
                          disabled={isSubmitting}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all disabled:opacity-50"
                          title="Set LOCKED"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                      {user.status !== 'INACTIVE' && (
                        <button
                          onClick={() => handleCycleStatus(user, 'INACTIVE')}
                          disabled={isSubmitting}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all disabled:opacity-50"
                          title="Set INACTIVE"
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > users.length && (
          <div className="px-6 py-3 text-xs text-slate-400 border-t border-slate-50">
            Showing {users.length} of {total} -- increase the page limit in getUsers() to see more.
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
};

export default UsersPage;

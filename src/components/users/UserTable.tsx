import { Edit3, PowerOff, Power } from 'lucide-react';
import type { User } from '../../types/api';

/**
 * ⚠️ Backend reality: this table has no data source. There is no
 * GET /users (list) endpoint in pss_modular_cqrs, so `users` will always
 * be an empty array in practice -- kept compilable/correct (matching the
 * real User shape: full_name not first/last, status is a string not
 * is_active, role_id not a nested role object) for whenever a list
 * endpoint exists. Delete/password-change actions removed: there is no
 * DELETE /users/{id} and no admin password-change endpoint at all.
 */
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Account</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role ID</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((user) => {
            const isActive = user.status === 'ACTIVE';
            return (
              <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden shadow-sm">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=f1f5f9&color=64748b`} alt="" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {user.full_name}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">@{user.username}</span>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 italic">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                       #{user.role_id}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 ring-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                      ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                      : 'bg-rose-50 text-rose-600 ring-rose-100'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                      <button
                          onClick={() => onEdit(user)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                          title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                          onClick={() => onToggleStatus(user)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                          title={isActive ? 'Lock account' : 'Activate account'}
                      >
                        {isActive ? <PowerOff className="w-4 h-4 text-rose-400" /> : <Power className="w-4 h-4 text-emerald-400" />}
                      </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

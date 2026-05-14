import { Edit3, PowerOff, Power, Trash2, Key } from 'lucide-react';
import type { User } from '../../types/api';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActivate: (user: User) => void;
  onUpdatePassword: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onToggleActivate, onUpdatePassword }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Account</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Access Info</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((user) => (
            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=f1f5f9&color=64748b`} alt="" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">@{user.username}</span>
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 italic">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                        {user.role?.name || 'No Role'}
                    </span>
                 </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 ring-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.is_active 
                    ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' 
                    : 'bg-rose-50 text-rose-600 ring-rose-100'
                }`}>
                  {user.is_active ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                    <button 
                        onClick={() => onEdit(user)} 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onUpdatePassword(user)} 
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Change Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onToggleActivate(user)} 
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title={user.is_active ? "Deactivate" : "Activate"}
                    >
                      {user.is_active ? <PowerOff className="w-4 h-4 text-rose-400" /> : <Power className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button 
                        onClick={() => onDelete(user)} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

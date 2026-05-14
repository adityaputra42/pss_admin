import type { Role } from '../../types/api';
import { Edit3, Trash2, Eye, ShieldCheck, ShieldAlert } from 'lucide-react';

interface RoleTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewDetails: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, onEdit, onDelete, onViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role Info</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rights</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <tr key={role.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${role.is_system_role ? 'bg-teal-50 text-primary' : 'bg-emerald-50 text-emerald-600'}`}>
                        {role.is_system_role ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{role.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium max-w-xs truncate">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                       role.is_system_role 
                       ? 'bg-slate-100 text-slate-600' 
                       : 'bg-emerald-50 text-emerald-700'
                   }`}>
                     {role.is_system_role ? 'System' : 'Custom'}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{role.permissions?.length || 0}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Permissions</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                   <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onViewDetails(role)} 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="View Permissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(role)} 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit Role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!role.is_system_role && (
                        <button 
                            onClick={() => onDelete(role)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                No roles found in the system.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoleTable;

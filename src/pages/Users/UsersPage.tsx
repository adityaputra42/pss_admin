import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import UserTable from '../../components/users/UserTable';
import UserFormModal from '../../components/users/UserFormModal';
import PasswordUpdateModal from '../../components/users/PasswordUpdateModal';
import { usersApi } from '../../services/api-services';
import type { User } from '../../types/api';
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from '../../utils/alerts';
import { Plus, Search, Filter } from 'lucide-react';

const UsersPage = () => {
  const [page] = useState(1);
  const [search, setSearch] = useState('');

  const {
    users,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useUsers(page, 10, search);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUpdateUser, setPasswordUpdateUser] = useState<User | null>(
    null
  );

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleOpenPasswordModal = (user: User) => {
    setPasswordUpdateUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordUpdateUser(null);
    setIsPasswordModalOpen(false);
  };

  const handleSave = async (data: any, userId: number | null) => {
    try {
      if (userId) {
        await usersApi.updateUser(userId, data);
        showSuccessAlert('User updated successfully!');
      } else {
        await usersApi.createUser(data);
        showSuccessAlert('User created successfully!');
      }

      await refetchUsers();
      handleCloseModal();
    } catch (error: any) {
      showErrorAlert(
        error.response?.data?.message ||
          error.message ||
          'Failed to save user.'
      );
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = await showConfirmAlert(
      'Delete User',
      `Are you sure you want to delete ${user.first_name}?`
    );

    if (!confirmed) return;

    try {
      await usersApi.deleteUser(user.id);
      await refetchUsers();
      showSuccessAlert('User deleted successfully!');
    } catch (error: any) {
      showErrorAlert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete user.'
      );
    }
  };

  const handleToggleActivate = async (user: User) => {
    const action = user.is_active ? 'deactivate' : 'activate';

    const confirmed = await showConfirmAlert(
      `${action === 'deactivate' ? 'Deactivate' : 'Activate'} User`,
      `Are you sure you want to ${action} ${user.first_name}?`
    );

    if (!confirmed) return;

    try {
      if (action === 'activate') {
        await usersApi.activateUser(user.id);
      } else {
        await usersApi.deactivateUser(user.id);
      }
      await refetchUsers();
      showSuccessAlert(`User ${action}d successfully!`);
    } catch (error: any) {
      showErrorAlert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${action} user.`
      );
    }
  };

  const handleUpdatePassword = async (
    userId: number,
    passwordData: any
  ) => {
    try {
      await usersApi.updatePassword(userId, passwordData);
      showSuccessAlert('Password updated successfully!');
      handleClosePasswordModal();
    } catch (error: any) {
      showErrorAlert(
        error.response?.data?.message ||
          error.message ||
          'Failed to update password.'
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 mt-1">Manage administrative accounts and their system status.</p>
        </div>
        <button 
            onClick={() => handleOpenModal(null)}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> 
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search users by name, email or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter className="w-4 h-4" />
               Filter
            </button>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block"></div>
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
               Sorted by <span className="text-slate-900 font-bold">Newest First</span>
            </p>
         </div>
      </div>

      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium italic">Fetching users...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
             <p className="text-rose-500 font-medium">{error}</p>
             <button onClick={() => refetchUsers()} className="mt-4 text-primary font-semibold hover:underline">Try again</button>
          </div>
        ) : (
          <UserTable
            users={users}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onToggleActivate={handleToggleActivate}
            onUpdatePassword={handleOpenPasswordModal}
          />
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSave={handleSave}
      />

      {passwordUpdateUser && (
        <PasswordUpdateModal
          isOpen={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
          userId={passwordUpdateUser.id}
          userFullName={`${passwordUpdateUser.first_name} ${passwordUpdateUser.last_name}`}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  );
};

export default UsersPage;

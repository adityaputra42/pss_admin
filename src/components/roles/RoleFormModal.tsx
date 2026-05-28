import {
  Dialog,
  Transition,
} from '@headlessui/react';

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import {
  Shield,
  KeyRound,
  Loader2,
} from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';

import type {
  Permission,
  Role,
} from '../../types/rbac';

// ===============================
// schema
// ===============================
const roleSchema = z.object({
  name: z
    .string()
    .min(
      1,
      'Role name is required',
    ),

  description:
    z.string().optional(),

  level: z.coerce
    .number()
    .min(
      1,
      'Level minimum is 1',
    ),

  permission_ids: z
    .array(z.number())
    .optional(),
});

type RoleFormInputs =
  z.infer<typeof roleSchema>;

interface RoleFormModalProps {
  isOpen: boolean;

  onClose: () => void;

  role: Role | null;

  isLoading?: boolean;

  onSave: (
    data: RoleFormInputs,
    roleId: number | null,
  ) => void | Promise<void>;
}

const RoleFormModal: React.FC<
  RoleFormModalProps
> = ({
  isOpen,
  onClose,
  role,
  onSave,
  isLoading = false,
}) => {
  // ===============================
  // permissions
  // ===============================
  const { permissions } =
    usePermissions();

  // ===============================
  // state
  // ===============================
  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = useState<number[]>([]);

  // ===============================
  // form
  // ===============================
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormInputs>({
    resolver:
      zodResolver(roleSchema),

    defaultValues: {
      name: '',
      description: '',
      level: 1,
      permission_ids: [],
    },
  });

  // ===============================
  // grouped permissions
  // ===============================
  const groupedPermissions =
    useMemo(() => {
      const groups: Record<
        string,
        Permission[]
      > = {};

      permissions?.forEach(
        (permission) => {
          const key =
            permission.resource ??
            'general';

          if (!groups[key]) {
            groups[key] = [];
          }

          groups[key].push(
            permission,
          );
        },
      );

      return groups;
    }, [permissions]);

  // ===============================
  // init edit/create
  // ===============================
  useEffect(() => {
    if (!isOpen) return;

    if (role) {
      const permissionIds =
        role.permissions?.map(
          (p) => p.id,
        ) ?? [];

      reset({
        name: role.name,
        description:
          role.description ?? '',
        level: role.level ?? 1,
        permission_ids:
          permissionIds,
      });

      setSelectedPermissions(
        permissionIds,
      );
    } else {
      reset({
        name: '',
        description: '',
        level: 1,
        permission_ids: [],
      });

      setSelectedPermissions([]);
    }
  }, [role, isOpen, reset]);

  // ===============================
  // permission toggle
  // ===============================
  const handlePermissionChange =
    (
      permissionId: number,
      checked: boolean,
    ) => {
      if (checked) {
        setSelectedPermissions(
          (prev) => [
            ...prev,
            permissionId,
          ],
        );
      } else {
        setSelectedPermissions(
          (prev) =>
            prev.filter(
              (id) =>
                id !== permissionId,
            ),
        );
      }
    };

  // ===============================
  // submit
  // ===============================
  const onSubmit = async (
    data: RoleFormInputs,
  ) => {
    await onSave(
      {
        ...data,
        permission_ids:
          selectedPermissions,
      },
      role?.id ?? null,
    );
  };

  return (
    <Transition
      appear
      show={isOpen}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-50"
        onClose={
          isLoading
            ? () => {}
            : onClose
        }
      >
        {/* overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <Shield className="w-7 h-7 text-primary" />

                      {role
                        ? 'Edit Role'
                        : 'Create Role'}
                    </Dialog.Title>

                    <p className="text-sm text-slate-500 mt-1">
                      Configure role
                      hierarchy and
                      permissions.
                    </p>
                  </div>
                </div>

                {/* form */}
                <form
                  onSubmit={handleSubmit(
                    onSubmit,
                  )}
                  className="p-8 space-y-8"
                >
                  {/* basic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* name */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Role Name
                      </label>

                      <input
                        {...register(
                          'name',
                        )}
                        placeholder="Supervisor"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />

                      {errors.name && (
                        <p className="text-sm text-red-500 mt-2">
                          {
                            errors.name
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {/* level */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Role Level
                      </label>

                      <input
                        type="number"
                        min={1}
                        {...register(
                          'level',
                        )}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />

                      {errors.level && (
                        <p className="text-sm text-red-500 mt-2">
                          {
                            errors.level
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* description */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      {...register(
                        'description',
                      )}
                      placeholder="Role description..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* permissions */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <KeyRound className="w-5 h-5 text-primary" />

                      <h3 className="text-lg font-bold text-slate-900">
                        Permissions
                      </h3>
                    </div>

                    <div className="space-y-5 max-h-87.5 overflow-y-auto pr-2">
                      {Object.entries(
                        groupedPermissions,
                      ).map(
                        ([
                          resource,
                          perms,
                        ]) => (
                          <div
                            key={
                              resource
                            }
                            className="border border-slate-200 rounded-2xl p-5"
                          >
                            <h4 className="font-bold text-slate-800 capitalize mb-4">
                              {resource}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {perms.map(
                                (
                                  permission,
                                ) => (
                                  <label
                                    key={
                                      permission.id
                                    }
                                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissions.includes(
                                        permission.id,
                                      )}
                                      onChange={(
                                        e,
                                      ) =>
                                        handlePermissionChange(
                                          permission.id,
                                          e
                                            .target
                                            .checked,
                                        )
                                      }
                                      className="mt-1"
                                    />

                                    <div>
                                      <div className="font-medium text-slate-800">
                                        {
                                          permission.name
                                        }
                                      </div>

                                      <div className="text-xs text-slate-500 mt-1">
                                        {
                                          permission.description
                                        }
                                      </div>
                                    </div>
                                  </label>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={
                        isLoading
                      }
                      className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isLoading
                      }
                      className="px-5 py-3 rounded-xl bg-primary text-white hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      {isLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}

                      {role
                        ? 'Update Role'
                        : 'Create Role'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RoleFormModal;

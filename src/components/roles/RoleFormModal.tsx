/**
 * ⚠️ Unused: no backend role-management API exists (see roles.ts /
 * RolesPage.tsx). Kept as a minimal, compiling stub rather than deleted,
 * so the import surface stays stable if this feature comes back.
 */
interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = () => null;

export default RoleFormModal;

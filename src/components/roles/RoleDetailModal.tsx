/**
 * ⚠️ Unused: no backend role-management API exists (see roles.ts /
 * RolesPage.tsx). Kept as a minimal, compiling stub rather than deleted,
 * so the import surface stays stable if this feature comes back.
 */
interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleDetailModal: React.FC<RoleDetailModalProps> = () => null;

export default RoleDetailModal;

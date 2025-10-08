"use client";

import { useAuth } from "@/contexts/AuthContext";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
}

export default function ActionButtons({
  onEdit,
  onDelete,
  onView,
  showEdit = true,
  showDelete = true,
  showView = false,
  editLabel = "Sửa",
  deleteLabel = "Xóa",
  viewLabel = "Xem"
}: ActionButtonsProps) {
  const { user } = useAuth();

  // Only admin can edit and delete
  const canEdit = user?.isAdmin && showEdit;
  const canDelete = user?.isAdmin && showDelete;
  const canView = showView;

  return (
    <div className="flex gap-2">
      {canView && onView && (
        <button
          onClick={onView}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {viewLabel}
        </button>
      )}
      {canEdit && onEdit && (
        <button
          onClick={onEdit}
          className="text-green-600 hover:text-green-800 text-sm"
        >
          {editLabel}
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          {deleteLabel}
        </button>
      )}
    </div>
  );
}


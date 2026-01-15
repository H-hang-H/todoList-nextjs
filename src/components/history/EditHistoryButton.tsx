import type { TodoItem } from '@/types/todo';

interface EditHistoryButtonProps {
  todo: TodoItem;
  onClick: () => void;
}

export default function EditHistoryButton({ todo, onClick }: EditHistoryButtonProps) {
  if (!todo.editHistory || todo.editHistory.length === 0) {
    return null;
  }

  return (
    <div className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline" onClick={onClick}>
      查看编辑记录 ({todo.editHistory.length})
    </div>
  );
}

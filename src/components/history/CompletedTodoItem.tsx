import type { TodoItem } from '@/types/todo';
import TodoItemContent from './TodoItemContent';
import EditHistoryButton from './EditHistoryButton';
import TodoItemActions from './TodoItemActions';

interface CompletedTodoItemProps {
  todo: TodoItem;
  onViewHistory: (todo: TodoItem) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  isUncompleting?: boolean;
  isDeleting?: boolean;
}

export default function CompletedTodoItem({ 
  todo, 
  onViewHistory, 
  onUncomplete, 
  onDelete,
  isUncompleting = false,
  isDeleting = false
}: CompletedTodoItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg transition-all duration-300 bg-gray-50">
      <div className="flex-1 min-w-0">
        <TodoItemContent todo={todo} />
        <EditHistoryButton 
          todo={todo} 
          onClick={() => onViewHistory(todo)} 
        />
      </div>
      <TodoItemActions
        onUncomplete={() => onUncomplete(todo.id)}
        onDelete={() => onDelete(todo.id)}
        isUncompleting={isUncompleting}
        isDeleting={isDeleting}
      />
    </div>
  );
}

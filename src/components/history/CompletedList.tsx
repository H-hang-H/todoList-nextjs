import { Card, Empty } from 'antd';
import type { TodoItem } from '@/types/todo';
import CompletedTodoItem from '@/components/history/CompletedTodoItem';

interface CompletedListProps {
  completedTodos: TodoItem[];
  onViewHistory: (todo: TodoItem) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  uncompletingIds: Set<string>;
  deletingId: string | null;
}

export default function CompletedList({
  completedTodos,
  onViewHistory,
  onUncomplete,
  onDelete,
  uncompletingIds,
  deletingId
}: CompletedListProps) {
  return (
    <Card className="shadow-md" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      {completedTodos.length === 0 ? (
        <Empty
          description="暂无已完成事项"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="space-y-2">
          {completedTodos.map((todo) => (
            <CompletedTodoItem
              key={todo.id}
              todo={todo}
              onViewHistory={onViewHistory}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
              isUncompleting={uncompletingIds.has(todo.id)}
              isDeleting={deletingId === todo.id}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

import type { TodoItem } from '@/types/todo';

interface TodoItemContentProps {
  todo: TodoItem;
}

export default function TodoItemContent({ todo }: TodoItemContentProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-base mb-1 line-through text-gray-400">
        {todo.text}
      </div>
      <div className="text-xs text-gray-500">
        创建于: {new Date(todo.createdAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
        {todo.completedAt && (
          <span className="ml-2">
            完成于: {new Date(todo.completedAt).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </div>
  );
}

import { Card } from 'antd';
import type { TodoItem } from '@/types/todo';
import HistoryHeader from '@/components/history/HistoryHeader';
import StatsTags from '@/components/history/StatsTags';
import CompletedList from '@/components/history/CompletedList';

interface HistoryPageContentProps {
  completedTodos: TodoItem[];
  activeCount: number;
  onViewHistory: (todo: TodoItem) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  uncompletingIds: Set<string>;
  deletingId: string | null;
}

export default function HistoryPageContent({
  completedTodos,
  activeCount,
  onViewHistory,
  onUncomplete,
  onDelete,
  uncompletingIds,
  deletingId
}: HistoryPageContentProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6 shadow-lg">
        <HistoryHeader />
        <div className="mt-4">
          <StatsTags 
            activeCount={activeCount} 
            completedCount={completedTodos.length} 
          />
        </div>
      </Card>

      <CompletedList
        completedTodos={completedTodos}
        onViewHistory={onViewHistory}
        onUncomplete={onUncomplete}
        onDelete={onDelete}
        uncompletingIds={uncompletingIds}
        deletingId={deletingId}
      />
    </div>
  );
}

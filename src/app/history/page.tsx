'use client';

import { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import type { TodoItem } from '@/types/todo';
import LoadingSpinner from '@/components/history/LoadingSpinner';
import HistoryPageContent from '@/components/history/HistoryPageContent';
import HistoryModal from '@/components/history/HistoryModal';
import { 
  fetchCompletedTodos,
  fetchActiveTodos, 
  fetchStats,
  markAsUncompleted,
  deleteTodo
} from '@/lib/todoService';

export default function History() {
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<TodoItem | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uncompletingIds, setUncompletingIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 从 Supabase 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [active, completed, stats] = await Promise.all([
        fetchActiveTodos(),
        fetchCompletedTodos(),
        fetchStats()
      ]);
      setCompletedTodos(completed);
      setActiveCount(active.length);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 撤销完成（从已完成列表移回待办列表）
  const handleUncomplete = async (id: string) => {
    setUncompletingIds(prev => new Set(prev).add(id));
    try {
      const success = await markAsUncompleted(id);
      if (success) {
        setCompletedTodos(completedTodos.filter(t => t.id !== id));
        setActiveCount(activeCount + 1);
        message.success('已撤销完成状态');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setUncompletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 删除任务
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingId(id);
        try {
          const success = await deleteTodo(id);
          if (success) {
            setCompletedTodos(completedTodos.filter(todo => todo.id !== id));
            message.success('删除成功');
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // 查看编辑历史
  const handleViewHistory = (todo: TodoItem) => {
    setHistoryItem(todo);
    setHistoryModalOpen(true);
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
        <HistoryPageContent
          completedTodos={completedTodos}
          activeCount={activeCount}
          onViewHistory={handleViewHistory}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          uncompletingIds={uncompletingIds}
          deletingId={deletingId}
        />

        <HistoryModal
          open={historyModalOpen}
          todo={historyItem}
          onClose={() => {
            setHistoryModalOpen(false);
            setHistoryItem(null);
          }}
        />
      </div>
    </>
  );
}

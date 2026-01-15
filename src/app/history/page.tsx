'use client';

import { useState, useEffect } from 'react';
import { Modal, message, Card, Empty } from 'antd';
import type { TodoItem } from '@/types/todo';
import LoadingSpinner from '@/components/history/LoadingSpinner';
import HistoryHeader from '@/components/history/HistoryHeader';
import CompletedTodoItem from '@/components/history/CompletedTodoItem';
import HistoryModal from '@/components/history/HistoryModal';

export default function History() {
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<TodoItem | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedCompletedTodos = localStorage.getItem('completedTodos');
    if (savedCompletedTodos) {
      setCompletedTodos(JSON.parse(savedCompletedTodos));
    }
    
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setActiveCount(JSON.parse(savedTodos).length);
    }
    
    setIsLoading(false);
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
    localStorage.setItem('completedCount', completedTodos.length.toString());
  }, [completedTodos]);

  // 撤销完成（从已完成列表移回待办列表）
  const handleUncomplete = (id: number) => {
    const todo = completedTodos.find(t => t.id === id);
    if (todo) {
      const uncompletedTodo = {
        ...todo,
        completed: false,
        completedAt: undefined,
      };
      
      // 保存到待办列表
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      localStorage.setItem('todos', JSON.stringify([uncompletedTodo, ...todos]));
      
      setCompletedTodos(completedTodos.filter(t => t.id !== id));
      message.success('已撤销完成状态');
    }
  };

  // 删除任务
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setCompletedTodos(completedTodos.filter(todo => todo.id !== id));
        message.success('删除成功');
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
      <div className="max-w-2xl mx-auto">
        <HistoryHeader activeCount={activeCount} completedCount={completedTodos.length} />

        {/* 已完成列表 */}
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
                  onViewHistory={handleViewHistory}
                  onUncomplete={handleUncomplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Card>

        <HistoryModal
          open={historyModalOpen}
          todo={historyItem}
          onClose={() => {
            setHistoryModalOpen(false);
            setHistoryItem(null);
          }}
        />
      </div>
    </div>
    </>
  );
}

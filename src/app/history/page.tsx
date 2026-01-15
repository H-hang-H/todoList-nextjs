'use client';

import { useState, useEffect } from 'react';
import { DeleteOutlined, CloseOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Modal, message, Empty, Card, Tag } from 'antd';
import Link from 'next/link';
import type { TodoItem } from '@/types/todo';

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
      {/* 加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题卡片 */}
        <Card className="mb-6 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
            📋 已完成事件
          </h1>
          <div className="flex justify-center gap-4 text-sm">
            <Tag color="blue">未完成: {activeCount}</Tag>
            <Tag color="green">已完成: {completedTodos.length}</Tag>
          </div>
          <div className="flex justify-center mt-4">
            <Link href="/home">
              <Button type="primary" icon={<HomeOutlined />}>
                返回待办列表
              </Button>
            </Link>
          </div>
        </Card>

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
                <div
                  key={todo.id}
                  className="flex items-start gap-4 p-4 rounded-lg transition-all duration-300 bg-gray-50"
                >
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
                    {todo.editHistory && todo.editHistory.length > 0 && (
                      <div className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline" onClick={() => handleViewHistory(todo)}>
                        查看编辑记录 ({todo.editHistory.length})
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="default"
                      icon={<CloseOutlined />}
                      onClick={() => handleUncomplete(todo.id)}
                      size="small"
                      className="text-green-600"
                    >
                      撤销
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(todo.id)}
                      size="small"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 编辑历史弹窗 */}
        <Modal
          title="编辑历史"
          open={historyModalOpen}
          onCancel={() => {
            setHistoryModalOpen(false);
            setHistoryItem(null);
          }}
          footer={[
            <Button key="close" type="primary" onClick={() => {
              setHistoryModalOpen(false);
              setHistoryItem(null);
            }}>
              关闭
            </Button>
          ]}
        >
          {historyItem && historyItem.editHistory && historyItem.editHistory.length > 0 ? (
            <div className="space-y-3">
              {historyItem.editHistory.map((record, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-800 mb-1">
                    原内容: {record.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    编辑时间: {new Date(record.editedAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              description="暂无编辑记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Modal>
      </div>
    </div>
    </>
  );
}

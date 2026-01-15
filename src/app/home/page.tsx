'use client';

import { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, HistoryOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Empty, Card, Space, Tag } from 'antd';
import type { TodoItem } from '@/types/todo';
import { 
  fetchActiveTodos, 
  fetchCompletedTodos,
  createTodo,
  updateTodoText,
  markAsCompleted,
  deleteTodo
} from '@/lib/todoService';

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<TodoItem | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [addingTodo, setAddingTodo] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // 从 Supabase 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [active, completed] = await Promise.all([
        fetchActiveTodos(),
        fetchCompletedTodos()
      ]);
      setTodos(active);
      setCompletedCount(completed.length);
    } catch (error) {
      message.error('加载待办事项失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新任务
  const handleAdd = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入任务内容');
      return;
    }

    setAddingTodo(true);
    try {
      const newTodo = await createTodo(inputValue.trim());
      if (newTodo) {
        setTodos([newTodo, ...todos]);
        setInputValue('');
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    } catch (error) {
      message.error('添加失败');
      console.error(error);
    } finally {
      setAddingTodo(false);
    }
  };

  // 切换完成状态
  const handleToggle = async (id: string) => {
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      const success = await markAsCompleted(id);
      if (success) {
        const updatedTodos = todos.filter(t => t.id !== id);
        setTodos(updatedTodos);
        setCompletedCount(completedCount + 1);
        message.success('任务已完成');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setTogglingIds(prev => {
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
            setTodos(todos.filter(todo => todo.id !== id));
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

  // 打开编辑弹窗
  const handleEdit = (todo: TodoItem) => {
    setEditingItem(todo);
    setEditingValue(todo.text);
    setIsModalOpen(true);
  };

  // 查看编辑历史
  const handleViewHistory = (todo: TodoItem) => {
    setHistoryItem(todo);
    setHistoryModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingValue.trim()) {
      message.warning('任务内容不能为空');
      return;
    }

    if (editingItem) {
      setSavingEdit(true);
      try {
        const success = await updateTodoText(editingItem.id, editingValue.trim());
        if (success) {
          const updatedTodos = todos.map(todo => {
            if (todo.id === editingItem.id) {
              const newEditRecord = {
                text: todo.text,
                editedAt: new Date().toISOString(),
              };
              return {
                ...todo,
                text: editingValue.trim(),
                editHistory: [newEditRecord, ...todo.editHistory],
              };
            }
            return todo;
          });
          setTodos(updatedTodos);
          setIsModalOpen(false);
          setEditingItem(null);
          message.success('修改成功');
        } else {
          message.error('修改失败');
        }
      } catch (error) {
        message.error('修改失败');
        console.error(error);
      } finally {
        setSavingEdit(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* 加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        {/* 标题卡片 */}
        <Card className="mb-6 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
            📝 待办事项
          </h1>
          <div className="flex justify-center gap-4 text-sm">
            <Tag color="blue">未完成: {todos.length}</Tag>
            <Tag color="green">已完成: {completedCount}</Tag>
          </div>
          <div className="flex justify-center mt-4">
            <Button 
              type="primary" 
              icon={<HistoryOutlined />}
              onClick={async () => {
                window.location.href = '/history';
              }}
            >
              查看已完成事件
            </Button>
          </div>
        </Card>

        {/* 输入框卡片 */}
        <Card className="mb-6 shadow-md">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="添加新的待办事项..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleAdd}
              size="large"
              maxLength={100}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              loading={addingTodo}
              disabled={addingTodo}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {addingTodo ? '添加中...' : '添加'}
            </Button>
          </Space.Compact>
        </Card>

        {/* 待办列表 */}
        <Card className="shadow-md" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {todos.length === 0 ? (
            <Empty
              description="暂无待办事项"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-4 p-4 rounded-lg transition-all duration-300 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base mb-1 text-gray-800">
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
                    </div>
                    {todo.editHistory.length > 0 && (
                      <div className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline" onClick={() => handleViewHistory(todo)}>
                        查看编辑记录 ({todo.editHistory.length})
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleToggle(todo.id)}
                      size="small"
                      loading={togglingIds.has(todo.id)}
                      disabled={togglingIds.has(todo.id)}
                    >
                      {togglingIds.has(todo.id) ? '完成中...' : '完成'}
                    </Button>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(todo)}
                      size="small"
                      disabled={togglingIds.has(todo.id) || deletingId === todo.id}
                    >
                      编辑
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(todo.id)}
                      size="small"
                      loading={deletingId === todo.id}
                      disabled={deletingId === todo.id || togglingIds.has(todo.id)}
                    >
                      {deletingId === todo.id ? '删除中...' : '删除'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) }
        </Card>

        {/* 编辑弹窗 */}
        <Modal
          title="编辑任务"
          open={isModalOpen}
          onOk={handleSaveEdit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          okText="保存"
          cancelText="取消"
          confirmLoading={savingEdit}
          okButtonProps={{ disabled: savingEdit }}
        >
          <Input
            placeholder="请输入任务内容"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onPressEnter={handleSaveEdit}
            maxLength={100}
            autoFocus
          />
        </Modal>

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
            }} >
              关闭
            </Button>
          ]}
        >
          {historyItem && historyItem.editHistory.length > 0 ? (
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
  );
}

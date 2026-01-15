import { supabase } from './supabase';
import { TodoItem, TodoRow, TodoStats } from '@/types/todo';

// 数据库行到应用模型的转换
const rowToTodoItem = (row: TodoRow, editHistory: any[] = []): TodoItem => ({
  id: row.id,
  text: row.text,
  completed: row.completed,
  createdAt: row.created_at,
  completedAt: row.completed_at || undefined,
  editHistory: editHistory.map((eh: any) => ({
    text: eh.text,
    editedAt: eh.edited_at,
  })),
});

// 获取所有待办事项
export async function fetchTodos(): Promise<TodoItem[]> {
  const { data, error } = await supabase
    .from('todos_with_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }

  return (data || []).map((item: any) => rowToTodoItem(item, item.edit_history || []));
}

// 获取未完成的待办事项
export async function fetchActiveTodos(): Promise<TodoItem[]> {
  const { data, error } = await supabase
    .from('todos_with_history')
    .select('*')
    .eq('completed', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active todos:', error);
    return [];
  }

  return (data || []).map((item: any) => rowToTodoItem(item, item.edit_history || []));
}

// 获取已完成的待办事项
export async function fetchCompletedTodos(): Promise<TodoItem[]> {
  const { data, error } = await supabase
    .from('todos_with_history')
    .select('*')
    .eq('completed', true)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching completed todos:', error);
    return [];
  }

  return (data || []).map((item: any) => rowToTodoItem(item, item.edit_history || []));
}

// 获取统计数据
export async function fetchStats(): Promise<TodoStats> {
  const { data, error } = await supabase.rpc('get_todo_stats');

  if (error) {
    console.error('Error fetching stats:', error);
    return { active_count: 0, completed_count: 0 };
  }

  return (data as any) || { active_count: 0, completed_count: 0 };
}

// 创建新的待办事项
export async function createTodo(text: string): Promise<TodoItem | null> {
  const { data, error } = await supabase
    .from('todos')
    .insert([{ text, completed: false }])
    .select()
    .single();

  if (error) {
    console.error('Error creating todo:', error);
    return null;
  }

  return rowToTodoItem(data);
}

// 更新待办事项文本
export async function updateTodoText(id: string, newText: string): Promise<boolean> {
  // 先获取当前文本以保存编辑历史
  const { data: currentTodo } = await supabase
    .from('todos')
    .select('text')
    .eq('id', id)
    .single();

  if (!currentTodo || currentTodo.text === newText) {
    return false;
  }

  // 保存编辑历史
  await supabase
    .from('edit_history')
    .insert([{ todo_id: id, text: currentTodo.text }]);

  // 更新文本
  const { error } = await supabase
    .from('todos')
    .update({ text: newText })
    .eq('id', id);

  if (error) {
    console.error('Error updating todo text:', error);
    return false;
  }

  return true;
}

// 标记为完成
export async function markAsCompleted(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('todos')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error marking todo as completed:', error);
    return false;
  }

  return true;
}

// 撤销完成状态
export async function markAsUncompleted(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('todos')
    .update({ completed: false, completed_at: null })
    .eq('id', id);

  if (error) {
    console.error('Error marking todo as uncompleted:', error);
    return false;
  }

  return true;
}

// 删除待办事项
export async function deleteTodo(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    return false;
  }

  return true;
}

// 获取单个待办事项（包含编辑历史）
export async function fetchTodoById(id: string): Promise<TodoItem | null> {
  const { data, error } = await supabase
    .from('todos_with_history')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching todo:', error);
    return null;
  }

  return rowToTodoItem(data, data.edit_history || []);
}

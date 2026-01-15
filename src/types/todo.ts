export interface EditRecord {
  text: string;
  editedAt: string;
}

export interface TodoItem {
  id: string; // UUID
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  editHistory: EditRecord[];
}

// Supabase 数据库表类型
export interface TodoRow {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  user_id: string;
}

export interface EditHistoryRow {
  id: string;
  todo_id: string;
  text: string;
  edited_at: string;
}

// 视图返回类型（包含编辑历史）
export interface TodoWithHistory extends TodoRow {
  edit_history: EditRecord[];
}

// 统计信息类型
export interface TodoStats {
  active_count: number;
  completed_count: number;
}

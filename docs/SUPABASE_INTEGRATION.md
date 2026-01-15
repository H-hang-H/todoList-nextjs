# Supabase 集成指南

## 概述

本项目已集成 Supabase 数据库，用于替代 localStorage 进行数据存储。

## 已完成的配置

### 1. 环境变量配置
已在 `.env.local` 中配置：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 匿名访问密钥

### 2. 依赖安装
已安装 `@supabase/supabase-js` 客户端库。

### 3. 代码结构
```
src/
├── lib/
│   ├── supabase.ts         # Supabase 客户端初始化
│   └── todoService.ts      # 数据访问服务层
├── types/
│   └── todo.ts            # 类型定义（已更新为 UUID）
supabase/
├── migrations/
│   └── 001_initial_schema.sql  # 数据库迁移文件
└── README.md              # 数据库详细文档
```

## 应用数据库迁移

### 方法 1: 通过 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 点击 "New Query"
5. 将 `supabase/migrations/001_initial_schema.sql` 文件内容复制粘贴
6. 点击 "Run" 执行

### 方法 2: 使用 Supabase CLI（推荐）

```bash
# 安装 Supabase CLI（如果尚未安装）
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref boqcxsdqsyvypszmeecm

# 推送迁移
supabase db push
```

## 数据库服务 API

### 查询操作

```typescript
import { 
  fetchTodos,
  fetchActiveTodos, 
  fetchCompletedTodos,
  fetchStats,
  fetchTodoById
} from '@/lib/todoService';

// 获取所有待办事项
const allTodos = await fetchTodos();

// 获取未完成的待办事项
const activeTodos = await fetchActiveTodos();

// 获取已完成的待办事项
const completedTodos = await fetchCompletedTodos();

// 获取统计数据
const stats = await fetchStats();
// 返回: { active_count: number, completed_count: number }

// 获取单个待办事项（包含编辑历史）
const todo = await fetchTodoById(id);
```

### 增删改操作

```typescript
import { 
  createTodo,
  updateTodoText,
  markAsCompleted,
  markAsUncompleted,
  deleteTodo
} from '@/lib/todoService';

// 创建新的待办事项
const newTodo = await createTodo('完成项目文档');

// 更新待办事项文本（自动保存编辑历史）
const success = await updateTodoText(todoId, '更新后的文本');

// 标记为完成
const success = await markAsCompleted(todoId);

// 撤销完成状态
const success = await markAsUncompleted(todoId);

// 删除待办事项
const success = await deleteTodo(todoId);
```

## 迁移现有页面

### 示例：迁移 Home 页面

原代码（使用 localStorage）：
```typescript
const [todos, setTodos] = useState<TodoItem[]>([]);

useEffect(() => {
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    setTodos(JSON.parse(savedTodos));
  }
}, []);

const handleAddTodo = (text: string) => {
  const newTodo = createTodoItem(text);
  const updatedTodos = [newTodo, ...todos];
  setTodos(updatedTodos);
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
};
```

新代码（使用 Supabase）：
```typescript
import { fetchTodos, createTodo } from '@/lib/todoService';

const [todos, setTodos] = useState<TodoItem[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadTodos();
}, []);

async function loadTodos() {
  const data = await fetchTodos();
  setTodos(data);
  setIsLoading(false);
}

async function handleAddTodo(text: string) {
  const newTodo = await createTodo(text);
  if (newTodo) {
    setTodos([newTodo, ...todos]);
  }
}
```

## 主要变化

### 1. ID 类型
- **之前**: `number`
- **现在**: `string` (UUID)

### 2. 数据存储
- **之前**: localStorage（浏览器本地存储）
- **现在**: Supabase PostgreSQL 数据库（云端存储）

### 3. 数据同步
- **之前**: 单设备，无同步
- **现在**: 多设备实时同步

### 4. 用户隔离
- **之前**: 无用户隔离
- **现在**: 通过 RLS 实现用户数据隔离

### 5. 类型更新
```typescript
// 新增类型
export interface TodoRow {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  user_id: string;
}

export interface TodoWithHistory extends TodoRow {
  edit_history: EditRecord[];
}

export interface TodoStats {
  active_count: number;
  completed_count: number;
}
```

## 实时订阅（可选）

如果需要实时更新，可以使用 Supabase 的实时订阅功能：

```typescript
import { supabase } from '@/lib/supabase';

// 订阅 todos 表的变化
const subscription = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'todos'
    },
    (payload) => {
      console.log('Change received!', payload);
      // 根据变化更新本地状态
    }
  )
  .subscribe();

// 取消订阅
subscription.unsubscribe();
```

## 错误处理

所有服务函数都包含错误处理：

```typescript
const { data, error } = await supabase
  .from('todos')
  .select('*');

if (error) {
  console.error('Error:', error);
  // 处理错误
  return;
}

// 处理数据
```

## 下一步

1. ✅ 应用数据库迁移到 Supabase
2. 🔄 逐页替换 localStorage 为 Supabase 调用
3. 🔄 添加用户认证功能（如果需要）
4. 🔄 测试所有功能
5. 🔄 考虑添加实时订阅功能

## 注意事项

1. **认证**: 当前使用匿名访问，如果需要多用户支持，需要添加认证功能
2. **RLS**: 已配置行级安全策略，确保用户只能访问自己的数据
3. **性能**: 已创建必要的索引以优化查询性能
4. **错误处理**: 所有数据库操作都包含错误处理
5. **类型安全**: 使用 TypeScript 确保类型安全

## 故障排除

### 问题: "Relation does not exist"
**解决**: 确保已运行数据库迁移脚本，创建了所有必要的表和视图。

### 问题: "JWT expired" 或 "Invalid JWT"
**解决**: 检查 `.env.local` 中的密钥是否正确。

### 问题: 数据查询返回空数组
**解决**: 
1. 检查用户是否已认证
2. 检查 RLS 策略是否正确配置
3. 使用 Supabase Dashboard 查看数据库中的数据

### 问题: 编辑历史不显示
**解决**: 确保使用 `todos_with_history` 视图查询，或使用 `fetchTodoById` 获取完整数据。

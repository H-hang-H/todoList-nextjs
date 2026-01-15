# Supabase 数据库迁移说明

## 数据库结构

### 表结构

#### `todos` 表
待办事项主表，存储所有待办事项的基本信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| text | TEXT | 待办事项内容 |
| completed | BOOLEAN | 是否完成 |
| created_at | TIMESTAMPTZ | 创建时间 |
| completed_at | TIMESTAMPTZ | 完成时间（可选） |
| user_id | UUID | 用户ID，关联到auth.users |

#### `edit_history` 表
编辑历史记录表，存储每个待办事项的编辑历史。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| todo_id | UUID | 关联的待办事项ID |
| text | TEXT | 编辑前的文本内容 |
| edited_at | TIMESTAMPTZ | 编辑时间 |

### 视图

#### `todos_with_history` 视图
联合查询待办事项和编辑历史，返回完整的待办事项信息。

返回字段：
- id, text, completed, created_at, completed_at, user_id
- edit_history: JSON数组，包含所有编辑历史记录

### 函数

#### `get_todo_stats(user_id)` 函数
获取指定用户的待办事项统计信息。

返回：
- active_count: 未完成数量
- completed_count: 已完成数量

## 如何应用迁移

### 方法1: 使用 Supabase CLI

```bash
# 初始化 Supabase 项目
supabase init

# 应用迁移
supabase db push

# 或者仅应用特定迁移
supabase migration up
```

### 方法2: 在 Supabase Dashboard 中手动执行

1. 登录 Supabase Dashboard
2. 进入项目 → SQL Editor
3. 复制 `001_initial_schema.sql` 文件内容
4. 粘贴到 SQL Editor 中
5. 点击 "Run" 执行

## 常用 SQL 查询示例

### 获取所有待办事项（包含编辑历史）

```sql
SELECT * FROM todos_with_history WHERE user_id = auth.uid();
```

### 获取未完成的待办事项

```sql
SELECT * FROM todos 
WHERE user_id = auth.uid() AND completed = FALSE
ORDER BY created_at DESC;
```

### 获取已完成的待办事项

```sql
SELECT * FROM todos 
WHERE user_id = auth.uid() AND completed = TRUE
ORDER BY completed_at DESC;
```

### 获取待办事项统计

```sql
SELECT * FROM get_todo_stats(auth.uid());
```

### 创建新的待办事项

```sql
INSERT INTO todos (text, completed)
VALUES ('完成项目文档', FALSE);
```

### 更新待办事项

```sql
-- 标记为完成
UPDATE todos 
SET completed = TRUE, completed_at = NOW()
WHERE id = 'your-uuid-here';

-- 更新文本
UPDATE todos 
SET text = '新的文本内容'
WHERE id = 'your-uuid-here';
```

### 删除待办事项

```sql
DELETE FROM todos WHERE id = 'your-uuid-here';
```

### 添加编辑历史

```sql
INSERT INTO edit_history (todo_id, text)
VALUES ('todo-uuid-here', '编辑前的文本内容');
```

### 获取特定待办事项的编辑历史

```sql
SELECT eh.* 
FROM edit_history eh
JOIN todos t ON eh.todo_id = t.id
WHERE t.id = 'todo-uuid-here' AND t.user_id = auth.uid()
ORDER BY eh.edited_at DESC;
```

## 安全策略说明

所有表都启用了行级安全（Row Level Security），确保：

1. 用户只能查看自己的待办事项
2. 用户只能创建、编辑、删除自己的待办事项
3. 编辑历史记录与待办事项关联，自动继承访问权限
4. 触发器自动为新建的待办事项设置 user_id

## 数据类型映射

| TypeScript | PostgreSQL | 说明 |
|------------|-----------|------|
| string | UUID | UUID类型，主键使用 |
| string | TEXT | 文本内容 |
| boolean | BOOLEAN | 布尔值 |
| string | TIMESTAMPTZ | 带时区的时间戳 |
| object[] | JSON | 编辑历史数组 |

## 注意事项

1. **UUID vs Number**: Supabase 默认使用 UUID 作为主键，而当前应用使用 number 类型 ID。需要在应用层进行转换。
2. **时间戳格式**: PostgreSQL 使用 ISO 8601 格式，JavaScript 的 `Date` 对象可以直接解析。
3. **JSON 格式**: edit_history 以 JSON 数组形式存储，应用中需要相应解析。
4. **认证**: 所有操作都需要用户登录，通过 `auth.uid()` 获取当前用户ID。

## 迁移到应用

要将现有 localStorage 数据迁移到 Supabase，可以使用以下步骤：

1. 安装 Supabase 客户端
2. 在应用中初始化 Supabase
3. 逐步替换 localStorage 操作为 Supabase 查询
4. 添加用户认证功能
5. 处理数据类型转换（特别是 ID 从 number 到 UUID）

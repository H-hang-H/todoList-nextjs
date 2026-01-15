-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 todos 表
CREATE TABLE todos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 创建 edit_history 表
CREATE TABLE edit_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_edit_history_todo_id ON edit_history(todo_id);

-- 添加注释
COMMENT ON TABLE todos IS '待办事项表';
COMMENT ON TABLE edit_history IS '编辑历史记录表';
COMMENT ON COLUMN todos.user_id IS '用户ID，关联到认证用户';
COMMENT ON COLUMN todos.completed_at IS '完成时间';
COMMENT ON COLUMN edit_history.todo_id IS '关联的待办事项ID';
COMMENT ON COLUMN edit_history.text IS '编辑前的文本内容';
COMMENT ON COLUMN edit_history.edited_at IS '编辑时间';

-- 创建视图：获取待办事项及其编辑历史
CREATE VIEW todos_with_history AS
SELECT 
    t.id,
    t.text,
    t.completed,
    t.created_at,
    t.completed_at,
    t.user_id,
    COALESCE(
        json_agg(
            json_build_object(
                'text', eh.text,
                'editedAt', eh.edited_at
            ) ORDER BY eh.edited_at DESC
        ) FILTER (WHERE eh.id IS NOT NULL),
        '[]'::json
    ) as edit_history
FROM todos t
LEFT JOIN edit_history eh ON t.id = eh.todo_id
GROUP BY t.id;

-- 行级安全策略 (Row Level Security)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的数据
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view edit history of their todos" ON edit_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert edit history for their todos" ON edit_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete edit history of their todos" ON edit_history
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

-- 创建函数：自动为新插入的 todo 设置 user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在插入 todo 时自动设置 user_id
CREATE TRIGGER set_todo_user_id
    BEFORE INSERT ON todos
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- 创建函数：获取统计信息
CREATE OR REPLACE FUNCTION get_todo_stats(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    active_count BIGINT,
    completed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE completed = FALSE) as active_count,
        COUNT(*) FILTER (WHERE completed = TRUE) as completed_count
    FROM todos
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

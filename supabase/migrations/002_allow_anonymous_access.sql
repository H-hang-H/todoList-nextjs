-- 修改 RLS 策略以允许匿名访问
-- 保留现有的策略结构，但扩展以支持未认证用户
-- 这样既保持了认证功能，又允许开发/测试阶段的匿名访问

-- 修改查看策略：允许查看所有 todos（包括匿名用户）
DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 修改插入策略：允许插入 todos（自动设置 user_id）
DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT
    WITH CHECK (
        -- 如果已认证，设置为自己的 user_id
        auth.uid() = user_id
        -- 如果未认证，允许 user_id 为 NULL
        OR (auth.uid() IS NULL AND user_id IS NULL)
    );

-- 修改更新策略：允许更新自己的 todos 或匿名 todos
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR (auth.uid() IS NULL AND user_id IS NULL)
    )
    WITH CHECK (
        auth.uid() = user_id
        OR (auth.uid() IS NULL AND user_id IS NULL)
    );

-- 修改删除策略：允许删除自己的 todos 或匿名 todos
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;
CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR (auth.uid() IS NULL AND user_id IS NULL)
    );

-- 修改 edit_history 查看策略
DROP POLICY IF EXISTS "Users can view edit history of their todos" ON edit_history;
CREATE POLICY "Users can view edit history of their todos" ON edit_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND (
                todos.user_id = auth.uid()
                OR (auth.uid() IS NULL AND todos.user_id IS NULL)
            )
        )
    );

-- 修改 edit_history 插入策略
DROP POLICY IF EXISTS "Users can insert edit history for their todos" ON edit_history;
CREATE POLICY "Users can insert edit history for their todos" ON edit_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND (
                todos.user_id = auth.uid()
                OR (auth.uid() IS NULL AND todos.user_id IS NULL)
            )
        )
    );

-- 修改 edit_history 删除策略
DROP POLICY IF EXISTS "Users can delete edit history of their todos" ON edit_history;
CREATE POLICY "Users can delete edit history of their todos" ON edit_history
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = edit_history.todo_id 
            AND (
                todos.user_id = auth.uid()
                OR (auth.uid() IS NULL AND todos.user_id IS NULL)
            )
        )
    );

-- 修改触发器：允许未认证用户设置 user_id 为 NULL
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果未认证，user_id 保持为 NULL
    -- 如果已认证，设置为当前用户 ID
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id = auth.uid();
    ELSE
        NEW.user_id = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 修改统计函数：支持匿名用户
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
    WHERE user_id = p_user_id OR (p_user_id IS NULL AND user_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注释：这些策略允许认证用户和匿名用户同时使用
-- 已认证用户只能访问自己的数据（user_id = auth.uid()）
-- 未认证用户可以访问匿名数据（user_id IS NULL）
COMMENT ON POLICY "Users can view their own todos" ON todos IS '允许查看自己的数据或匿名数据';
COMMENT ON POLICY "Users can insert their own todos" ON todos IS '允许插入自己的数据或匿名数据';
COMMENT ON POLICY "Users can update their own todos" ON todos IS '允许更新自己的数据或匿名数据';
COMMENT ON POLICY "Users can delete their own todos" ON todos IS '允许删除自己的数据或匿名数据';

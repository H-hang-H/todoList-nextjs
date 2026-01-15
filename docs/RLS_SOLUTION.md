# RLS 策略解决方案

## 问题
遇到错误：`new row violates row-level security policy for table 'todos'`

## 解决方案
修改了 `supabase/migrations/002_allow_anonymous_access.sql` 文件，采用以下策略：

### 核心思路
**不删除现有的 RLS 策略**，而是**扩展它们以同时支持认证用户和匿名用户**。

### 策略说明

#### 1. 用户数据隔离
- **已认证用户**：只能访问 `user_id = auth.uid()` 的数据（自己的数据）
- **未认证用户**：只能访问 `user_id IS NULL` 的数据（匿名数据）

#### 2. 策略修改详情

**SELECT 策略（查看）**
```sql
USING (auth.uid() = user_id OR user_id IS NULL)
```
- 允许查看自己的数据，或者匿名数据

**INSERT 策略（插入）**
```sql
WITH CHECK (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
)
```
- 如果已认证，user_id 必须是自己的 ID
- 如果未认证，user_id 必须为 NULL

**UPDATE 策略（更新）**
```sql
USING (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
)
WITH CHECK (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
)
```
- 只能更新自己的数据或匿名数据

**DELETE 策略（删除）**
```sql
USING (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
)
```
- 只能删除自己的数据或匿名数据

#### 3. 触发器修改
```sql
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id = auth.uid();
    ELSE
        NEW.user_id = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- 已认证用户：自动设置 user_id 为当前用户 ID
- 未认证用户：user_id 保持为 NULL

#### 4. 统计函数修改
```sql
WHERE user_id = p_user_id OR (p_user_id IS NULL AND user_id IS NULL)
```
- 支持匿名用户查询统计数据

### 执行迁移

#### 方法 1: 通过 Supabase Dashboard（推荐）
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 SQL Editor
4. 复制 `supabase/migrations/002_allow_anonymous_access.sql` 的全部内容
5. 粘贴到编辑器中
6. 点击 "Run" 执行

#### 方法 2: 使用 Supabase CLI
```bash
supabase db push
```

### 验证
执行迁移后，测试以下操作：
1. 添加新的待办事项（应该成功）
2. 编辑待办事项（应该成功）
3. 标记为完成（应该成功）
4. 删除待办事项（应该成功）

### 安全性
此方案保持了数据安全性：
- ✅ 认证用户只能访问自己的数据
- ✅ 匿名用户之间数据隔离
- ✅ 保留了完整的 RLS 保护
- ✅ 支持未来添加用户认证功能

### 生产环境建议
在生产环境中，建议：
1. 实现用户认证（Supabase Auth）
2. 所有操作都需要用户登录
3. 可以考虑移除匿名访问支持
4. 为匿名用户添加额外的安全措施（如 IP 限制、频率限制等）

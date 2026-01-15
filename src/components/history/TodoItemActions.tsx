import { Button } from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';

interface TodoItemActionsProps {
  onUncomplete: () => void;
  onDelete: () => void;
  isUncompleting?: boolean;
  isDeleting?: boolean;
}

export default function TodoItemActions({ onUncomplete, onDelete, isUncompleting = false, isDeleting = false }: TodoItemActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button
        type="default"
        icon={<CloseOutlined />}
        onClick={onUncomplete}
        size="small"
        loading={isUncompleting}
        disabled={isUncompleting || isDeleting}
        className="text-green-600"
      >
        {isUncompleting ? '撤销中...' : '撤销'}
      </Button>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onDelete}
        size="small"
        loading={isDeleting}
        disabled={isDeleting || isUncompleting}
      >
        {isDeleting ? '删除中...' : '删除'}
      </Button>
    </div>
  );
}

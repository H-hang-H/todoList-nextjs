import { Button } from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';

interface TodoItemActionsProps {
  onUncomplete: () => void;
  onDelete: () => void;
}

export default function TodoItemActions({ onUncomplete, onDelete }: TodoItemActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button
        type="default"
        icon={<CloseOutlined />}
        onClick={onUncomplete}
        size="small"
        className="text-green-600"
      >
        撤销
      </Button>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onDelete}
        size="small"
      >
        删除
      </Button>
    </div>
  );
}

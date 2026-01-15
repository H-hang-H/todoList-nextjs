import { Modal, Button, Empty } from 'antd';
import type { TodoItem } from '@/types/todo';
import HistoryRecordItem from './HistoryRecordItem';

interface HistoryModalProps {
  open: boolean;
  todo: TodoItem | null;
  onClose: () => void;
}

export default function HistoryModal({ open, todo, onClose }: HistoryModalProps) {
  return (
    <Modal
      title="编辑历史"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      {todo && todo.editHistory && todo.editHistory.length > 0 ? (
        <div className="space-y-3">
          {todo.editHistory.map((record, index) => (
            <HistoryRecordItem key={index} record={record} />
          ))}
        </div>
      ) : (
        <Empty
          description="暂无编辑记录"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Modal>
  );
}

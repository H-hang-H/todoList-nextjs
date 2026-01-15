import { EditRecord } from '@/types/todo';

interface HistoryRecordItemProps {
  record: EditRecord;
}

export default function HistoryRecordItem({ record }: HistoryRecordItemProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-800 mb-1">
        原内容: {record.text}
      </div>
      <div className="text-xs text-gray-500">
        编辑时间: {new Date(record.editedAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

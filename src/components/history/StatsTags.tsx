import { Tag } from 'antd';

interface StatsTagsProps {
  activeCount: number;
  completedCount: number;
}

export default function StatsTags({ activeCount, completedCount }: StatsTagsProps) {
  return (
    <div className="flex justify-center gap-4 text-sm">
      <Tag color="blue">未完成: {activeCount}</Tag>
      <Tag color="green">已完成: {completedCount}</Tag>
    </div>
  );
}

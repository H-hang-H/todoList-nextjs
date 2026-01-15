import { Button, Card, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface HistoryHeaderProps {
  activeCount: number;
  completedCount: number;
}

export default function HistoryHeader({ activeCount, completedCount }: HistoryHeaderProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
        📋 已完成事件
      </h1>
      <div className="flex justify-center gap-4 text-sm">
        <Tag color="blue">未完成: {activeCount}</Tag>
        <Tag color="green">已完成: {completedCount}</Tag>
      </div>
      <div className="flex justify-center mt-4">
        <Link href="/home">
          <Button type="primary" icon={<HomeOutlined />}>
            返回待办列表
          </Button>
        </Link>
      </div>
    </Card>
  );
}

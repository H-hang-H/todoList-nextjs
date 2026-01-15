import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function HistoryHeader() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
        📝 待办事项历史
      </h1>
      <div className="flex justify-center mt-4">
        <Link href="/home">
          <Button type="primary" icon={<HomeOutlined />}>
            返回待办列表
          </Button>
        </Link>
      </div>
    </div>
  );
}

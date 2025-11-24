import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Drawer
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  points: number;
  contactInfo: string;
  tags: string[];
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  user: {
    id: string;
    phone: string;
    wechatId: string;
  };
}

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTitle, setSearchTitle] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize, searchTitle, typeFilter, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize
      };

      if (searchTitle) {
        params.title = searchTitle;
      }

      if (typeFilter) {
        params.type = typeFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get('http://localhost:3001/api/admin/posts', { params });

      if (response.data.success) {
        setPosts(response.data.data.posts);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error) {
      message.error('获取信息列表失败');
      console.error('获取信息列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/admin/posts/${postId}`
      );

      if (response.data.success) {
        message.success('删除信息成功');
        fetchPosts();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除信息失败');
      console.error('删除信息失败:', error);
    }
  };

  const handleViewDetail = (post: Post) => {
    setSelectedPost(post);
    setDetailDrawerVisible(true);
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'BUY': 'green',
          'SELL': 'red',
          'LONG': 'blue',
          'SHORT': 'orange'
        };
        const typeMap: Record<string, string> = {
          'BUY': '买入',
          'SELL': '卖出',
          'LONG': '做多',
          'SHORT': '做空'
        };
        return <Tag color={colorMap[type]}>{typeMap[type]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'ACTIVE': { text: '活跃', color: 'green' },
          'COMPLETED': { text: '已完成', color: 'blue' },
          'EXPIRED': { text: '已过期', color: 'gray' },
          'HIDDEN': { text: '已隐藏', color: 'red' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points: number) => `${points}`
    },
    {
      title: '查看次数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count: number) => (
        <Tag color={count > 50 ? 'green' : count > 10 ? 'orange' : 'default'}>
          {count}
        </Tag>
      )
    },
    {
      title: '发布者',
      dataIndex: ['user', 'phone'],
      key: 'user',
      width: 120,
      render: (phone: string, record: Post) => (
        <Tooltip title={record.user.wechatId}>
          <span>{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
        </Tooltip>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <div>
          {tags.map((tag, index) => (
            <Tag key={index} size="small">{tag}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_, record: Post) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条信息吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="删除信息">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>信息管理</h1>
        <p className="page-description">管理平台交易信息</p>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索标题"
              prefix={<SearchOutlined />}
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="类型筛选"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="BUY">买入</Select.Option>
              <Select.Option value="SELL">卖出</Select.Option>
              <Select.Option value="LONG">做多</Select.Option>
              <Select.Option value="SHORT">做空</Select.Option>
            </Select>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="ACTIVE">活跃</Select.Option>
              <Select.Option value="COMPLETED">已完成</Select.Option>
              <Select.Option value="EXPIRED">已过期</Select.Option>
              <Select.Option value="HIDDEN">已隐藏</Select.Option>
            </Select>
            <Button icon={<SearchOutlined />} onClick={fetchPosts}>
              搜索
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize || 10);
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="信息详情"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        extra={
          <Button onClick={() => setDetailDrawerVisible(false)}>
            关闭
          </Button>
        }
      >
        {selectedPost && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>基本信息</h3>
              <p><strong>标题:</strong> {selectedPost.title}</p>
              <p><strong>类型:</strong>
                <Tag style={{ marginLeft: 8 }}>
                  {selectedPost.type === 'BUY' ? '买入' :
                   selectedPost.type === 'SELL' ? '卖出' :
                   selectedPost.type === 'LONG' ? '做多' : '做空'}
                </Tag>
              </p>
              <p><strong>状态:</strong>
                <Tag style={{ marginLeft: 8 }}>
                  {selectedPost.status === 'ACTIVE' ? '活跃' :
                   selectedPost.status === 'COMPLETED' ? '已完成' :
                   selectedPost.status === 'EXPIRED' ? '已过期' : '已隐藏'}
                </Tag>
              </p>
              <p><strong>积分:</strong> {selectedPost.points}</p>
              <p><strong>查看次数:</strong> {selectedPost.viewCount}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>内容详情</h3>
              <div style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedPost.content}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>联系方式</h3>
              <div style={{
                background: '#e6f7ff',
                padding: 12,
                borderRadius: 6,
                border: '1px solid #91d5ff'
              }}>
                {selectedPost.contactInfo}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>标签</h3>
              <div>
                {selectedPost.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>发布信息</h3>
              <p><strong>发布者:</strong> {selectedPost.user.phone} ({selectedPost.user.wechatId})</p>
              <p><strong>发布时间:</strong> {new Date(selectedPost.createdAt).toLocaleString()}</p>
              <p><strong>过期时间:</strong> {new Date(selectedPost.expiresAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PostManagement;
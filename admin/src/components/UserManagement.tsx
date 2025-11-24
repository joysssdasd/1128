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
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

interface User {
  id: string;
  phone: string;
  wechatId: string;
  points: number;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  inviteCode?: string;
  invitedBy?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, searchPhone, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize
      };

      if (searchPhone) {
        params.phone = searchPhone;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get('http://localhost:3001/api/admin/users', { params });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      points: user.points,
      status: user.status
    });
    setEditModalVisible(true);
  };

  const handleSave = async (values: any) => {
    if (!editingUser) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/admin/users/${editingUser.id}`,
        values
      );

      if (response.data.success) {
        message.success('更新用户信息成功');
        setEditModalVisible(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      message.error('更新用户信息失败');
      console.error('更新用户信息失败:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/admin/users/${userId}`
      );

      if (response.data.success) {
        message.success('删除用户成功');
        fetchUsers();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除用户失败');
      console.error('删除用户失败:', error);
    }
  };

  const columns = [
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    {
      title: '微信号',
      dataIndex: 'wechatId',
      key: 'wechatId',
      ellipsis: true,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => (
        <Tag color={points >= 50 ? 'green' : points >= 10 ? 'orange' : 'red'}>
          {points}
        </Tag>
      ),
      sorter: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'ACTIVE': { text: '正常', color: 'green' },
          'BANNED': { text: '封禁', color: 'red' },
          'INACTIVE': { text: '未激活', color: 'orange' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '邀请人',
      dataIndex: 'invitedBy',
      key: 'invitedBy',
      render: (invitedBy: string) => invitedBy ? invitedBy.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '-'
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Tooltip title="编辑用户">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="删除用户">
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
        <h1>用户管理</h1>
        <p className="page-description">管理平台用户信息</p>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索手机号"
              prefix={<SearchOutlined />}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="ACTIVE">正常</Select.Option>
              <Select.Option value="BANNED">封禁</Select.Option>
              <Select.Option value="INACTIVE">未激活</Select.Option>
            </Select>
            <Button icon={<SearchOutlined />} onClick={fetchUsers}>
              搜索
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
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
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="积分"
            name="points"
            rules={[{ required: true, message: '请输入积分数' }]}
          >
            <Input type="number" placeholder="请输入积分数" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="ACTIVE">正常</Select.Option>
              <Select.Option value="BANNED">封禁</Select.Option>
              <Select.Option value="INACTIVE">未激活</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
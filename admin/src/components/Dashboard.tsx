import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Spin } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalPoints: number;
  todayRegistrations: number;
  todayPosts: number;
  userGrowth: number;
  postGrowth: number;
}

interface RecentPost {
  id: string;
  title: string;
  type: string;
  status: string;
  points: number;
  createdAt: string;
  user: {
    phone: string;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalPoints: 0,
    todayRegistrations: 0,
    todayPosts: 0,
    userGrowth: 0,
    postGrowth: 0
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 获取统计数据
      const statsResponse = await axios.get('http://localhost:3001/api/admin/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // 获取最近发布的信息
      const postsResponse = await axios.get('http://localhost:3001/api/admin/posts?page=1&limit=5');
      if (postsResponse.data.success) {
        setRecentPosts(postsResponse.data.data.posts);
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据用于图表展示
  const chartData = [
    { date: '11-15', users: 120, posts: 45 },
    { date: '11-16', users: 132, posts: 52 },
    { date: '11-17', users: 145, posts: 48 },
    { date: '11-18', users: 168, posts: 61 },
    { date: '11-19', users: 182, posts: 58 },
    { date: '11-20', users: 201, posts: 72 },
    { date: '11-21', users: stats.totalUsers, posts: stats.totalPosts }
  ];

  const pieData = [
    { name: '买入', value: 35, color: '#52c41a' },
    { name: '卖出', value: 25, color: '#ff4d4f' },
    { name: '做多', value: 25, color: '#1890ff' },
    { name: '做空', value: 15, color: '#faad14' }
  ];

  const postColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
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
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'ACTIVE': { text: '活跃', color: 'green' },
          'COMPLETED': { text: '已完成', color: 'blue' },
          'EXPIRED': { text: '已过期', color: 'gray' }
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => `${points} 积分`
    },
    {
      title: '发布者',
      dataIndex: ['user', 'phone'],
      key: 'user',
      render: (phone: string) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>仪表盘</h1>
        <p className="page-description">平台运营数据总览</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} className="stats-grid">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div className="stats-trend">
              {stats.userGrowth > 0 ? (
                <><ArrowUpOutlined /> {stats.userGrowth}% 增长</>
              ) : (
                <><ArrowDownOutlined /> {Math.abs(stats.userGrowth)}% 下降</>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title="总信息数"
              value={stats.totalPosts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div className="stats-trend">
              {stats.postGrowth > 0 ? (
                <><ArrowUpOutlined /> {stats.postGrowth}% 增长</>
              ) : (
                <><ArrowDownOutlined /> {Math.abs(stats.postGrowth)}% 下降</>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title="总积分池"
              value={stats.totalPoints}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div className="stats-trend">
              今日发放 {stats.todayRegistrations * 100} 积分
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Statistic
              title="今日收入"
              value={stats.todayPosts * 10}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fff' }}
              suffix="积分"
            />
            <div className="stats-trend">
              查看 {stats.todayPosts} 条信息
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[24, 24]} className="charts-grid">
        <Col xs={24} lg={16}>
          <Card title="用户增长趋势" className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#667eea"
                  fill="#667eea"
                  fillOpacity={0.3}
                  name="用户数"
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="#f093fb"
                  fill="#f093fb"
                  fillOpacity={0.3}
                  name="信息数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="信息类型分布" className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 最近发布的信息 */}
      <Card title="最近发布的信息" className="table-container">
        <Table
          columns={postColumns}
          dataSource={recentPosts}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
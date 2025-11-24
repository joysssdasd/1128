import React from 'react';
import { Layout, Dropdown, Avatar, Button, Space, message } from 'antd';
import { UserOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('退出登录成功');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <AntHeader style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      paddingLeft: 200
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
        管理后台
      </div>

      <Space size="middle">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: 16 }}
          onClick={() => message.info('暂无新消息')}
        />

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1890ff',
                marginRight: 8
              }}
            />
            <span style={{ color: '#262626', fontSize: 14 }}>
              {user?.username || '管理员'}
            </span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
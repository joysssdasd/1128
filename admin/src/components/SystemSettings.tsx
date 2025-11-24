import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Divider,
  message,
  Tabs,
  Select,
  Space,
  Table,
  Modal,
  Popconfirm
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface SystemSettings {
  registerRewardPoints: number;
  inviteRewardPoints: number;
  postCostPoints: number;
  viewContactCostPoints: number;
  maxPostsPerDay: number;
  postExpireHours: number;
  systemMaintenance: boolean;
  registrationEnabled: boolean;
  postApprovalRequired: boolean;
}

interface SensitiveWord {
  id: string;
  word: string;
  replacement: string;
  createdAt: string;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    registerRewardPoints: 100,
    inviteRewardPoints: 50,
    postCostPoints: 10,
    viewContactCostPoints: 1,
    maxPostsPerDay: 5,
    postExpireHours: 72,
    systemMaintenance: false,
    registrationEnabled: true,
    postApprovalRequired: false
  });

  const [sensitiveWords, setSensitiveWords] = useState<SensitiveWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [addWordModalVisible, setAddWordModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<SensitiveWord | null>(null);
  const [form] = Form.useForm();
  const [wordForm] = Form.useForm();

  useEffect(() => {
    fetchSystemSettings();
    fetchSensitiveWords();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/system/settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('获取系统设置失败:', error);
    }
  };

  const fetchSensitiveWords = async () => {
    setWordsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/system/sensitive-words');
      if (response.data.success) {
        setSensitiveWords(response.data.data);
      }
    } catch (error) {
      console.error('获取敏感词失败:', error);
    } finally {
      setWordsLoading(false);
    }
  };

  const handleSaveSettings = async (values: SystemSettings) => {
    setLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:3001/api/admin/system/settings',
        values
      );

      if (response.data.success) {
        message.success('保存设置成功');
        setSettings(values);
      } else {
        message.error(response.data.message || '保存失败');
      }
    } catch (error) {
      message.error('保存设置失败');
      console.error('保存设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (values: { word: string; replacement: string }) => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/admin/system/sensitive-words',
        values
      );

      if (response.data.success) {
        message.success('添加敏感词成功');
        setAddWordModalVisible(false);
        wordForm.resetFields();
        fetchSensitiveWords();
      } else {
        message.error(response.data.message || '添加失败');
      }
    } catch (error) {
      message.error('添加敏感词失败');
      console.error('添加敏感词失败:', error);
    }
  };

  const handleEditWord = (word: SensitiveWord) => {
    setEditingWord(word);
    wordForm.setFieldsValue({
      word: word.word,
      replacement: word.replacement
    });
    setAddWordModalVisible(true);
  };

  const handleUpdateWord = async (values: { word: string; replacement: string }) => {
    if (!editingWord) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/admin/system/sensitive-words/${editingWord.id}`,
        values
      );

      if (response.data.success) {
        message.success('更新敏感词成功');
        setAddWordModalVisible(false);
        setEditingWord(null);
        wordForm.resetFields();
        fetchSensitiveWords();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      message.error('更新敏感词失败');
      console.error('更新敏感词失败:', error);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/admin/system/sensitive-words/${wordId}`
      );

      if (response.data.success) {
        message.success('删除敏感词成功');
        fetchSensitiveWords();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除敏感词失败');
      console.error('删除敏感词失败:', error);
    }
  };

  const wordColumns = [
    {
      title: '敏感词',
      dataIndex: 'word',
      key: 'word'
    },
    {
      title: '替换内容',
      dataIndex: 'replacement',
      key: 'replacement'
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: SensitiveWord) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditWord(record)}
          />
          <Popconfirm
            title="确定要删除这个敏感词吗？"
            onConfirm={() => handleDeleteWord(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>系统设置</h1>
        <p className="page-description">管理系统参数和配置</p>
      </div>

      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本设置" key="basic">
          <Card title="积分设置">
            <Form
              layout="vertical"
              initialValues={settings}
              onFinish={handleSaveSettings}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                <Form.Item
                  label="注册奖励积分"
                  name="registerRewardPoints"
                  rules={[{ required: true, message: '请输入注册奖励积分' }]}
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 积分`}
                    parser={value => value!.replace(/ 积分/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="邀请奖励积分"
                  name="inviteRewardPoints"
                  rules={[{ required: true, message: '请输入邀请奖励积分' }]}
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 积分`}
                    parser={value => value!.replace(/ 积分/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="发布信息消耗积分"
                  name="postCostPoints"
                  rules={[{ required: true, message: '请输入发布信息消耗积分' }]}
                >
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 积分`}
                    parser={value => value!.replace(/ 积分/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="查看联系方式消耗积分"
                  name="viewContactCostPoints"
                  rules={[{ required: true, message: '请输入查看联系方式消耗积分' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 积分`}
                    parser={value => value!.replace(/ 积分/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="每日最大发布数量"
                  name="maxPostsPerDay"
                  rules={[{ required: true, message: '请输入每日最大发布数量' }]}
                >
                  <InputNumber
                    min={1}
                    max={100}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 条`}
                    parser={value => value!.replace(/ 条/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="信息过期时间(小时)"
                  name="postExpireHours"
                  rules={[{ required: true, message: '请输入信息过期时间' }]}
                >
                  <InputNumber
                    min={1}
                    max={720}
                    style={{ width: '100%' }}
                    formatter={value => `${value} 小时`}
                    parser={value => value!.replace(/ 小时/g, '')}
                  />
                </Form.Item>
              </div>

              <Divider />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                <Form.Item
                  label="系统维护模式"
                  name="systemMaintenance"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="允许用户注册"
                  name="registrationEnabled"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="发布信息需要审核"
                  name="postApprovalRequired"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="敏感词管理" key="sensitive">
          <Card
            title="敏感词列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddWordModalVisible(true)}
              >
                添加敏感词
              </Button>
            }
          >
            <Table
              columns={wordColumns}
              dataSource={sensitiveWords}
              rowKey="id"
              loading={wordsLoading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingWord ? "编辑敏感词" : "添加敏感词"}
        open={addWordModalVisible}
        onCancel={() => {
          setAddWordModalVisible(false);
          setEditingWord(null);
          wordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={wordForm}
          layout="vertical"
          onFinish={editingWord ? handleUpdateWord : handleAddWord}
        >
          <Form.Item
            label="敏感词"
            name="word"
            rules={[{ required: true, message: '请输入敏感词' }]}
          >
            <Input placeholder="请输入敏感词" />
          </Form.Item>

          <Form.Item
            label="替换内容"
            name="replacement"
            rules={[{ required: true, message: '请输入替换内容' }]}
          >
            <Input placeholder="请输入替换内容" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingWord ? '更新' : '添加'}
              </Button>
              <Button onClick={() => {
                setAddWordModalVisible(false);
                setEditingWord(null);
                wordForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;
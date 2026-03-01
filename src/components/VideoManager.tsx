import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Upload, message, Space, Card, Tag, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, SyncOutlined, CloudUploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { api } from '../services/api';

// 1. Cấu hình danh sách vùng miền
const REGION_OPTIONS = [
  { value: 'all', label: '⚡ Tất cả vùng miền' },
  { value: 'hoa_de', label: 'Hoà Đê' },
  { value: 'vsl', label: 'VSL Chung' }
];

// Định nghĩa kiểu dữ liệu cho Video để code gợi ý cho sướng
interface VideoData {
  id: number;
  word: string;
  slug: string;
  region: string;
  topic: string | string[];
  variant_id: string;
  preview_url: string;
}

const VideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State lưu tùy chọn Publish (Mặc định chọn 'all')
  const [publishTarget, setPublishTarget] = useState('all');

  const [form] = Form.useForm();

  // ---------------------------------------------------------
  // 1. Load dữ liệu
  // ---------------------------------------------------------
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res: any = await api.getVideos();
      
      // ✅ FIX QUAN TRỌNG: API trả về { data: [...], total: ... }
      // Phải lấy res.data mới là mảng
      if (res && Array.isArray(res.data)) {
        setVideos(res.data);
      } else {
        // Fallback nếu API trả về mảng trực tiếp
        setVideos(Array.isArray(res) ? res : []);
      }
    } catch (error) {
      console.error(error);
      message.error('Không tải được danh sách video');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ---------------------------------------------------------
  // 2. Xử lý Upload Video
  // ---------------------------------------------------------
  const handleUpload = async (values: any) => {
    const formData = new FormData();
    
    // Append các trường text
    formData.append('word_text', values.word_text);
    formData.append('topics', values.topics); // Backend nhận List hoặc String
    formData.append('region', values.region);
    
1
    formData.append('variant_id', values.variant_id); 
    
    formData.append('version', 'v1');
    
    // Append file
    if (values.file && values.file.length > 0) {
      formData.append('file', values.file[0].originFileObj);
    } else {
      message.error("Vui lòng chọn video!");
      return;
    }

    try {
      message.loading({ content: 'Đang upload lên Cloudinary...', key: 'upload' });
      await api.uploadVideo(formData);
      
      message.success({ content: 'Upload thành công!', key: 'upload' });
      setIsModalOpen(false);
      form.resetFields();
      fetchVideos(); // Refresh lại bảng
    } catch (error) {
      console.error(error);
      message.error({ content: 'Upload thất bại', key: 'upload' });
    }
  };

  // ---------------------------------------------------------
  // 3. Xử lý Xóa Video
  // ---------------------------------------------------------
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xóa video này?',
      content: 'Hành động này sẽ xóa video khỏi Database và Cloudinary vĩnh viễn.',
      okText: 'Xóa luôn',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.deleteVideo(id);
          message.success('Đã xóa video');
          fetchVideos();
        } catch (error) {
          message.error('Lỗi khi xóa');
        }
      }
    });
  };

  // ---------------------------------------------------------
  // 4. Xử lý Publish (Update App) - Hỗ trợ "All"
  // ---------------------------------------------------------
  const handlePublish = async () => {
    try {
      let regionsToPublish: string[] = [];

      if (publishTarget === 'all') {
        // Lấy tất cả value trừ 'all'
        regionsToPublish = REGION_OPTIONS
            .filter(opt => opt.value !== 'all')
            .map(opt => opt.value);
      } else {
        regionsToPublish = [publishTarget];
      }

      message.loading({ content: `Đang đóng gói ${regionsToPublish.length} vùng miền...`, key: 'pub', duration: 0 });

      // Chạy vòng lặp gọi API tuần tự
      for (const region of regionsToPublish) {
        console.log(`Publishing: ${region}...`);
        await api.publishRegion(region);
      }

      message.success({ content: '✅ Đã Publish xong toàn bộ!', key: 'pub', duration: 3 });
      
    } catch (e) {
      console.error(e);
      message.error({ content: 'Lỗi khi Publish', key: 'pub' });
    }
  };

  // ---------------------------------------------------------
  // Cấu hình cột bảng
  // ---------------------------------------------------------
  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' as const },
    { 
      title: 'Từ vựng', 
      dataIndex: 'word', 
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text> 
    },
    { title: 'Slug', dataIndex: 'slug', render: (t:string) => <Typography.Text type="secondary">{t}</Typography.Text> },
    { 
      title: 'Vùng', 
      dataIndex: 'region', 
      render: (t:string) => <Tag color="blue">{t}</Tag> 
    },
    { 
      title: 'Chủ đề', 
      dataIndex: 'topic',
      // Xử lý hiển thị nếu topic là mảng hoặc chuỗi
      render: (t: any) => (Array.isArray(t) ? t.map(x => <Tag key={x}>{x}</Tag>) : <Tag>{t}</Tag>)
    },
    { 
      title: 'Diễn viên', 
      dataIndex: 'variant', 
      render: (t:string) => <Tag color="green">{t}</Tag> 
    },
    { 
      title: 'Preview', 
      key: 'url',
      render: (_: any, record: VideoData) => (
        <Button 
          type="link" 
          icon={<VideoCameraOutlined />} 
          href={record.preview_url} 
          target="_blank" 
          rel="noreferrer"
        >
          Xem
        </Button>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: VideoData) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      )
    }
  ];

  return (
    <div style={{ 
    padding: '24px', // Giảm bớt padding một chút cho cân đối
    background: '#f0f2f5', 
    minHeight: '100%', // Đổi từ 100vh thành 100% để đi theo cha
    width: '100%',
    boxSizing: 'border-box' // Đảm bảo padding không làm tăng chiều rộng
  }}>
      <Card 
        title="🎬 Trung Tâm Quản Lý Video SignBridge" 
        bordered={false}
        extra={
          <Space>
             <span style={{ fontSize: 13, color: '#888' }}>Publish:</span>
             <Select 
                value={publishTarget}
                onChange={setPublishTarget}
                options={REGION_OPTIONS}
                style={{ width: 180 }}
             />
             <Button icon={<SyncOutlined />} onClick={handlePublish}>
                Cập nhật App
             </Button>

             <div style={{ width: 1, height: 20, background: '#e8e8e8', margin: '0 8px' }} />

             <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setIsModalOpen(true)}>
                Upload Video Mới
             </Button>
          </Space>
        }
      >
        <Table 
            dataSource={videos} 
            columns={columns} 
            rowKey="id" 
            loading={loading} 
            pagination={{ pageSize: 8 }}
            bordered
        />
      </Card>

      {/* ----------------- MODAL UPLOAD FORM ----------------- */}
      <Modal 
        title="Thêm Video Từ Điển Mới" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          
          <Form.Item name="word_text" label="Từ vựng" rules={[{ required: true, message: 'Nhập từ vựng vào!' }]}>
            <Input placeholder="Ví dụ: Cảm ơn" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="region" label="Vùng miền" initialValue="vsl" style={{ flex: 1 }}>
               <Select options={
                REGION_OPTIONS.filter(opt => opt.value !== 'all')
               } />
            </Form.Item>
            
            <Form.Item name="topics" label="Chủ đề" initialValue="giao_tiep" style={{ flex: 1 }}>
               <Input placeholder="vd: giao_tiep" />
            </Form.Item>
          </div>

          {/* Lưu ý: name="variant" để khớp với logic FormData ở trên */}
          <Form.Item name="variant_id" label="Diễn viên" initialValue="actor_male">
             <Select options={[
                 { value: 'actor_male', label: 'Nam diễn viên' },
                 { value: 'actor_female', label: 'Nữ diễn viên' },
                 { value: 'avatar_robot', label: 'Robot 3D' }
             ]} />
          </Form.Item>

          <Form.Item name="file" label="File Video" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList} rules={[{ required: true, message: 'Chưa chọn video!' }]}>
            <Upload beforeUpload={() => false} maxCount={1} accept="video/*">
              <Button icon={<UploadOutlined />}>Chọn file video (MP4)</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} icon={<CloudUploadOutlined />} size="large">
            Bắt đầu Upload
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoManager;
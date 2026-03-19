'use client';

import { Upload, Typography, Button, App } from 'antd';
import { InboxOutlined, FilePdfOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const { Dragger } = Upload;
const { Text } = Typography;

const MAX_SIZE_MB = 10;

interface CvUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

export default function CvUpload({ value, onChange }: CvUploadProps) {
  const { message } = App.useApp();

  const beforeUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      message.error('Chỉ hỗ trợ file PDF');
      return false;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(`File quá lớn, tối đa ${MAX_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append('file', file as File);
    try {
      const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/upload/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => onProgress?.({ percent: Math.round((e.loaded / (e.total ?? 1)) * 100) }),
      });
      onChange?.(data.data?.url ?? '');
      onSuccess?.('ok');
      message.success('Upload CV thành công!');
    } catch (err: any) {
      onError?.(err);
      message.error('Lỗi upload CV');
    }
  };

  if (value) {
    return (
      <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FilePdfOutlined style={{ color: '#DC2626', fontSize: 24 }} />
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>CV đã tải lên</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>PDF</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<DownloadOutlined />} href={value} target="_blank" rel="noopener">
            Xem
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange?.('')}>
            Xóa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dragger
      accept=".pdf"
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      showUploadList={false}
      multiple={false}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#4F46E5' }} />
      </p>
      <p className="ant-upload-text">Kéo thả hoặc nhấn để tải lên CV</p>
      <p className="ant-upload-hint">Chỉ hỗ trợ file PDF, tối đa {MAX_SIZE_MB}MB</p>
    </Dragger>
  );
}

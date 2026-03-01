import axios from 'axios';

// Đổi URL này thành địa chỉ backend của bạn
//  const API_URL = 'https://se.cit.ctu.edu.vn/signbridge/api/v1'; 
//const API_URL = 'http://localhost:8000/api/v1';
const API_URL= "https://api-signbridge.tamdevx.id.vn/api/v1"
export const api = {
  // Lấy danh sách video
  getVideos: async () => {
    const res = await axios.get(`${API_URL}/admin/videos`);
    return res.data;
  },

  // Xóa video
  deleteVideo: async (id: number) => {
    return await axios.delete(`${API_URL}/admin/videos/${id}`);
  },

  // Upload video (Dùng FormData)
  uploadVideo: async (formData: FormData) => {
    return await axios.post(`${API_URL}/admin/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

   getInfo: async (token: string) => {
    const res = await axios.get(`${API_URL}/auth/me`,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.data;
  },
  // Publish (Build JSON)
  publishRegion: async (region: string) => {
      return await axios.post(`${API_URL}/admin/publish/${region}`);
  }
};
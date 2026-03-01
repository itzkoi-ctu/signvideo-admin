

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login'; // Component Login của bạn
import VideoManager from './components/VideoManager'; // Component quản lý video của bạn
import { Button, Layout, theme } from 'antd';
import { supabase } from './supabaseClient';

const { Header, Content } = Layout;

const App = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <Layout style={{ minHeight: '100vh', width: '100%' }}> {/* Thêm width 100% ở đây */}
              <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529' }}>
                <div style={{ color: 'white', fontWeight: 'bold' }}>SIGNBRIDGE ADMIN</div>
                <Button type="primary" danger onClick={handleLogout}>Đăng xuất</Button>
              </Header>
              
              <Content style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* Bọc VideoManager trong một container ép chiều rộng */}
                <div style={{ flex: 1, width: '100%' }}>
                  <VideoManager />
                </div>
              </Content>
            </Layout>
            } />
          </Route>

          {/* Redirect 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import  {api}  from '../services/api';
export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      console.log(data)
      const info = await api.getInfo(data.session!.access_token);
      localStorage.setItem('user', JSON.stringify(info));
      navigate('/');
      alert('Đăng nhập thành công!');
    }
    setLoading(false);
  };

  // Các biến style để code gọn hơn
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    card: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '100%',
      maxWidth: '400px'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '14px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '5px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Đăng nhập</h2>
          <p style={styles.subtitle}>Chào mừng bạn quay trở lại</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading} 
            style={{
              ...styles.button, 
              opacity: loading ? 0.7 : 1,
              backgroundColor: loading ? '#60a5fa' : '#2563eb'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Chưa có tài khoản? <a href="/signup" style={{ color: '#2563eb', textDecoration: 'none' }}>Đăng ký</a>
        </p> */}
      </div>
    </div>
  );
}
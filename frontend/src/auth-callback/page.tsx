import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { api } from '../../../services/api'; // pastikan path ini benar

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
      try {
          navigate("/yatta");
        
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/");
      }

  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Processing login...
    </div>
  );
};

export default AuthCallbackPage;

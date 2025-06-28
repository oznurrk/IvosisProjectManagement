import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert('Giriş başarısız. Bilgileri kontrol edin.');
    }
  };

  return (
    <div style={{background:'url("ivosis.webp")'}} className='h-screen w-screen !bg-cover !bg-center !bg-no-repeat flex flex-col items-center justify-center'>
      <div className='w-[450px] backdrop-blur-md p-10 py-8 rounded-lg'>
        <form className='flex flex-col gap-5'>
          <div className='self-center font-medium font-heading text-white text-xl'>Giriş Yap</div>
        </form>
      </div>
    </div>
  );
};

export default Login;

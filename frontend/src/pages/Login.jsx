import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const data = response.data;

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);

        // Kullanıcı bilgilerini kaydet
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.userId,
            name: data.userName,
            role: data.role,
          })
        );

        setErrorMessage('');
        navigate('/projects');
      } else {
        setErrorMessage('Giriş başarısız. Yanıt geçersiz.');
      }
    } catch (error) {
      setErrorMessage('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div
      style={{ background: 'url("login-bg.jpg")' }}
      className="h-screen w-screen !bg-cover !bg-center !bg-no-repeat flex flex-col items-center justify-center"
    >
      <div className="w-[450px] backdrop-blur-md p-10 py-8 rounded-lg border border-primary-400">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-5 [&_input]:placeholder-natural-100 [&_.mantine-Input-input]:!border-white focus-within:[&_.mantine-Input-input]:!border-ivosis-400 [&_.mantine-Input-input]:!border [&_input]:!pl-2 [&_svg]:text-ivosis-950"
        >
          <img
            src="/ivosislogo3.png"
            alt="logo"
            style={{ width: '70%', height: '70%' }}
            className="self-center"
          />
          <div className="self-center font-medium font-heading text-ivosis-800 text-xl">
            Giriş Yap
          </div>

          <TextInput
            className="transition duration-300"
            variant="unstyled"
            size="md"
            radius="md"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <PasswordInput
            variant="unstyled"
            size="md"
            radius="md"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Checkbox
            label="Beni Hatırla"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.currentTarget.checked)}
            className="text-white"
          />

          {errorMessage && (
            <div className="text-red-700 text-md mt-2 text-center">
              {errorMessage}
            </div>
          )}

          <Button type="submit" color="ivosis.8">
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
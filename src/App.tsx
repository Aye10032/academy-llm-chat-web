import LoginForm from './pages/login-form';
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RegisterForm from './pages/register-form';
import ForgotPasswordForm from './pages/forgot-password-form';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element:  <LoginForm />,
    },
    {
      path: "/register",
      element: <RegisterForm />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordForm />,
    }
  ]);
  return (
    <>
        <RouterProvider router={router} />

    </>
  )
}

export default App

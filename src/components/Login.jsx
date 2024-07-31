import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightToBracket, faEye, faEyeSlash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error messages

    if (!formData.username || !formData.password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post('http://182.18.139.138:9000/api/auth-service/auth/sign-in',
        {
          "email": formData.username,
          "password": formData.password
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: 'Login Successful!',
          icon: 'success',
          confirmButtonText: 'OK',
         });

       
        sessionStorage.setItem('accessToken', response.data.accessToken);

        
        navigate('/dashboard');
      } else {
        
        setErrorMessage(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.log(error)
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex justify-center items-center h-[90vh]">
      <div className="flex w-[800px] shadow-lg bg-white rounded-md overflow-hidden h-[600px]">
        {/* Left Side */}
        <div className="relative w-1/2">
          <img
            src="https://media.istockphoto.com/id/1352603244/photo/shot-of-an-unrecognizable-businessman-working-on-his-laptop-in-the-office.jpg?s=612x612&w=0&k=20&c=upiDYeAZEsxbUBdhX35MXm79drIXA-5Q-FcfmZk71lM="
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white p-4">
            <h2 className="text-4xl font-bold mb-2 text-center">
              Welcome to Student GPT
            </h2>
            <p className="text-center">
              Please log in to access your account.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col justify-center items-center p-6 bg-white">
          <div className="w-full">
            <h1 className="text-3xl block text-center font-semibold mb-4">
              <FontAwesomeIcon icon={faUser} /> Login
            </h1>
            <hr className="mb-4" />

            {errorMessage && (
              <div className="mb-4 text-red-600 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-base mb-2">
                  Enter The Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="border w-full text-base px-4 py-2 focus:outline-none focus:ring-0 focus:border-gray-600 rounded"
                  placeholder="Enter Username..."
                  style={{ height: '40px' }}
                />
              </div>
              <div className="mb-4 relative">
                <label htmlFor="password" className="block text-base mb-2">
                Enter The Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border w-full text-base px-4 py-2 pr-10 focus:outline-none focus:ring-0 focus:border-gray-600 rounded"
                  placeholder="Enter Password..."
                  style={{ height: '40px' }}
                />
                <span
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                  />
                </span>
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="border-2 border-indigo-700 bg-indigo-700 text-white py-2 w-full rounded-md  hover:text-indigo-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  &nbsp;&nbsp;Login
                </button>
              </div>
            </form>
            <div>
              <Link
                to="/register"
                className="block text-center border-2 border-gray-400 text-gray-700 py-2 w-full rounded-md hover:bg-gray-100 font-semibold"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                &nbsp;&nbsp;Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

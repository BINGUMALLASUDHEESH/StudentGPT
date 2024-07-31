import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';


const SignUp = () => {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1); // 1 for initial, 2 for OTP
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phonenumber: '',
    gender: '',
    mobileotp: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  let templateName = '';
  let roleId = '';
  let mobileOtpSession = '';

  const validateInitialForm = () => {
    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = 'First Name is required.';
    if (!formData.lastname) newErrors.lastname = 'Last Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!formData.password) newErrors.password = 'Password is required.';
    if (!formData.phonenumber) newErrors.phonenumber = 'Phone Number is required.';
    else if (!/^\d+$/.test(formData.phonenumber))
      newErrors.phonenumber = 'Phone Number should contain only digits.';
    return newErrors;
  };

  const validateOtpForm = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.mobileotp) newErrors.mobileotp = 'OTP is required.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const initialErrors = validateInitialForm();
    if (Object.keys(initialErrors).length > 0) {
      setErrors(initialErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://182.18.139.138:9000/api/auth-service/user/send-mobile-otp?type=check',
        {
          mobileNumber: formData.phonenumber,
          templateName: 'OXYBRICKS',
        }
      );

      localStorage.setItem('moblieotpsession', response.data.mobileOtpSession);
      if (response.data.mobileOtpSession !== ' ') {
        templateName = response.data.templateName;
        roleId = response.data.roleId;
        mobileOtpSession = response.data.mobileOtpSession;
        setFormStep(2); 
      } else {
        setErrors({ phonenumber: 'Failed to send OTP. Please try again.' });
      }
    } catch (err) {
      
       setErrors({ phonenumber: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpErrors = validateOtpForm();
    if (Object.keys(otpErrors).length > 0) {
      setErrors(otpErrors);
      return;
    }

    setIsLoading(true);

    const moblieotpsession = localStorage.getItem('moblieotpsession');
    console.log(moblieotpsession)
    try {
      const response = await axios.post(
        'http://182.18.139.138:9000/api/auth-service/auth/sign-up',
        {
          "alternativeMobile": formData.phonenumber,
          "designation": "string",
          "email": formData.email,
          "firstName": formData.firstname,
          "gender": formData.gender,
          "lastName": formData.lastname,
          "middleName": "string",
          "mobileNumber": formData.phonenumber,
          "mobileOtp": formData.mobileotp,
          "organization": "Oxyloans",
          "otpSession": moblieotpsession,
          "password": formData.password,
          "roleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        }
      );

      console.log(response.data)
      if (response.data.success) {
       
        
       navigate('/dashboard');
        setSuccess('Signup successful!');

      } else {
        setErrors({ mobileotp: 'Invalid OTP. Please try again.' });
      }
    } catch (err) {
      console.log(err.response);
      setErrors({ mobileotp: 'An error occurred. Please try again.' });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="flex w-full max-w-4xl shadow-lg bg-white rounded-md overflow-hidden">
        {/* Left Side */}
        <div className="relative w-1/2 hidden md:block">
          <img
            src="https://media.istockphoto.com/id/1352603244/photo/shot-of-an-unrecognizable-businessman-working-on-his-laptop-in-the-office.jpg?s=612x612&w=0&k=20&c=upiDYeAZEsxbUBdhX35MXm79drIXA-5Q-FcfmZk71lM="
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white p-4">
            <h2 className="text-4xl font-bold mb-2 text-center">
              Welcome to Student GPT
            </h2>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 bg-white">
          <div className="w-full">
            <h1 className="text-3xl block text-center font-semibold mb-4">
              <FontAwesomeIcon icon={faUser} /> Sign Up
            </h1>
            <hr className="mb-4" />
            {success && (
              <div className="alert alert-success text-green-500 mb-4 text-center">
                {success}
              </div>
            )}

            {formStep === 1 && (
              <>
                <div className="mb-4">
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.firstname ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                  {errors.firstname && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstname}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.lastname ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastname}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phonenumber"
                    name="phonenumber"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.phonenumber ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.phonenumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                  {errors.phonenumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phonenumber}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className={`w-full py-2 mb-2 text-base rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            )}

            {formStep === 2 && (
              <>
                <div className="mb-4">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="mobileotp" className="block text-sm font-medium text-gray-700">
                    OTP
                  </label>
                  <input
                    type="text"
                    id="mobileotp"
                    name="mobileotp"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.mobileotp ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.mobileotp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                  />
                  {errors.mobileotp && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobileotp}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`w-full py-2 text-base rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </>
            )}

            <div className="text-center mt-4">
              Already have an account?
              <Link to="/" className="ml-1 text-blue-500 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default SignUp;

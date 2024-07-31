import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 


const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phonenumber: '',
    gender: '',
    mobileotp: '',
  });

  const [formStep, setFormStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const validateInitialForm = () => {
    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = 'First name is required';
    if (!formData.lastname) newErrors.lastname = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.phonenumber) newErrors.phonenumber = 'Phone number is required';
    else if (!/^\d+$/.test(formData.phonenumber)) newErrors.phonenumber = 'Phone number should be digits only';
    return newErrors;
  };

  const validateOtpForm = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.mobileotp) newErrors.mobileotp = 'OTP is required';
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
      const response = await axios.post('http://your-api-url/api/auth-service/user/send-mobile-otp', {
        mobileNumber: formData.phonenumber,
      });

      if (response.data.mobileOtpSession) {
        setFormStep(2); // Show additional fields
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

    try {
      const response = await axios.post('http://your-api-url/api/auth-service/auth/sign-up', {
        email: formData.email,
        firstName: formData.firstname,
        gender: formData.gender,
        lastName: formData.lastname,
        mobileNumber: formData.phonenumber,
        mobileOtp: formData.mobileotp,
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess('Signup successful!');
        setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      } else {
        setErrors({ mobileotp: 'Invalid OTP. Please try again.' });
      }
    } catch (err) {
      setErrors({ mobileotp: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6 image-section">
          <img src={require('../assets/GlobalEducation.jpg')} alt="Signup" className="img-fluid" />
        </div>
        <div className="col-md-6 form-section">
          <h1 className="main-heading">Sign Up</h1>
          {success && <div className="alert alert-success">{success}</div>}
          {formStep === 1 && (
            <form onSubmit={handleSendOtp} className="signup-form">
              <div className="form-group">
                <label className="label">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your first name"
                />
                {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
              </div>
              <div className="form-group">
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your last name"
                />
                {errors.lastname && <div className="text-danger">{errors.lastname}</div>}
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your phone number"
                />
                {errors.phonenumber && <div className="text-danger">{errors.phonenumber}</div>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {formStep === 2 && (
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div className="text-danger">{errors.gender}</div>}
              </div>
              <div className="form-group">
                <label className="label">Mobile OTP</label>
                <input
                  type="text"
                  name="mobileotp"
                  value={formData.mobileotp}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter the OTP"
                />
                {errors.mobileotp && <div className="text-danger">{errors.mobileotp}</div>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;

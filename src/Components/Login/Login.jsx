import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../hooks/useNotification';
import './Login.css';

import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const API_URL = 'http://127.0.0.1:5000/api/auth';

const Login = () => {
    const navigate = useNavigate();
    const { isLoading, startLoading, stopLoading } = useLoading();
    const { showSuccess, showError, showInfo } = useNotification();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isResetMode, setIsResetMode] = useState(false);

    const validateForm = () => {
        let tempErrors = {};
        
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }

        if (!isResetMode && !formData.password) {
            tempErrors.password = "Password is required";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            startLoading(isResetMode ? 'Sending reset link...' : 'Logging in...');
            
            try {
                const endpoint = isResetMode ? '/reset-password' : '/login';
                const response = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'An error occurred');
                }

                if (isResetMode) {
                    showSuccess('Password reset link has been sent to your email');
                    setIsResetMode(false);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showSuccess('Login successful!');
                    navigate('/Homepage');
                }
            } catch (error) {
                showError(error.message || 'An error occurred. Please try again.');
                console.error('Login error:', error);
            } finally {
                stopLoading();
            }
        }
    };

    const renderErrorMessage = (field) => {
        return errors[field] ? (
            <div className="error-message">
                {errors[field]}
            </div>
        ) : null;
    };

    return (
        <div className="login-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Please wait...</p>
                </div>
            )}
            
            <div className="header">
                <div className="text">
                    {isResetMode ? "Reset Password" : "Login"}
                </div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
                <div className="inputs">
                    <div className="input-group">
                        <div className="input">
                            <img src={email_icon} alt="" className="image-size"/>
                            <input 
                                type="email" 
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        {renderErrorMessage('email')}
                    </div>
                    
                    {!isResetMode && (
                        <div className="input-group">
                            <div className="input">
                                <img src={password_icon} alt="" className="image-size"/>
                                <input 
                                    type="password" 
                                    placeholder="Password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {renderErrorMessage('password')}
                        </div>
                    )}
                </div>

                {!isResetMode && (
                    <div className="forgot-password">
                        Lost Password? <span onClick={() => {
                            setIsResetMode(true);
                            showInfo('Enter your email to reset password');
                        }}>Click Here!</span>
                    </div>
                )}

                <div className="submit-container">
                    {isResetMode ? (
                        <>
                            <button type="submit" className="submit">
                                Reset Password
                            </button>
                            <button 
                                type="button" 
                                className="submit gray"
                                onClick={() => setIsResetMode(false)}
                            >
                                Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="submit" className="submit">
                                Login
                            </button>
                            <button 
                                type="button" 
                                className="submit gray"
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;

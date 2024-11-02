import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../hooks/useNotification';
import './Signup.css';

import user_icon from '../Assets/user.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const API_URL = 'http://127.0.0.1:5000/api/auth';

const Signup = () => {
    const navigate = useNavigate();
    const { isLoading, startLoading, stopLoading } = useLoading();
    const { showSuccess, showError } = useNotification();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        date_of_birth: ''
    });
    const [errors, setErrors] = useState({});
    const [isDateFocused, setIsDateFocused] = useState(false);

    const validateForm = () => {
        let tempErrors = {};
        
        if (!formData.first_name.trim()) {
            tempErrors.first_name = "First name is required";
        }
        if (!formData.last_name.trim()) {
            tempErrors.last_name = "Last name is required";
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }

        const passwordRegex = {
            minLength: 8,
            hasUpperCase: /[A-Z]/,
            hasLowerCase: /[a-z]/,
            hasNumber: /[0-9]/,
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
        };

        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else {
            let passwordErrors = [];
            
            if (formData.password.length < passwordRegex.minLength) {
                passwordErrors.push("at least 8 characters");
            }
            if (!passwordRegex.hasUpperCase.test(formData.password)) {
                passwordErrors.push("an uppercase letter");
            }
            if (!passwordRegex.hasLowerCase.test(formData.password)) {
                passwordErrors.push("a lowercase letter");
            }
            if (!passwordRegex.hasNumber.test(formData.password)) {
                passwordErrors.push("a number");
            }
            if (!passwordRegex.hasSpecialChar.test(formData.password)) {
                passwordErrors.push("a special character");
            }

            if (passwordErrors.length > 0) {
                tempErrors.password = "Password must contain " + passwordErrors.join(", ");
            }
        }

        if (!formData.date_of_birth) {
            tempErrors.date_of_birth = "Date of birth is required";
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
            startLoading('Creating your account...');
            
            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'An error occurred');
                }

                showSuccess('Account created successfully!');
                navigate('/login');
            } catch (error) {
                showError(error.message || 'An error occurred. Please try again.');
                console.error('Signup error:', error);
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
        <div className="signup-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Please wait...</p>
                </div>
            )}
            
            <div className="header">
                <div className="text">Sign Up</div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
                <div className="inputs">
                    <div className="input-group">
                        <div className="input">
                            <img src={user_icon} alt="" className="image-size"/>
                            <input 
                                type="text" 
                                placeholder="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        {renderErrorMessage('first_name')}
                    </div>

                    <div className="input-group">
                        <div className="input">
                            <img src={user_icon} alt="" className="image-size"/>
                            <input 
                                type="text" 
                                placeholder="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        {renderErrorMessage('last_name')}
                    </div>

                    <div className="input-group">
                        <div className="input">
                            <img src={user_icon} alt="" className="image-size"/>
                            <div className="date-input-container">
                                <input 
                                    type={isDateFocused ? "date" : "text"}
                                    placeholder="Date of Birth"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    onFocus={() => setIsDateFocused(true)}
                                    onBlur={(e) => {
                                        if (!e.target.value) {
                                            setIsDateFocused(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        {renderErrorMessage('date_of_birth')}
                    </div>

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
                </div>

                <div className="submit-container">
                    <button type="submit" className="submit">
                        Create Account
                    </button>
                    <button 
                        type="button" 
                        className="submit gray"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Signup;

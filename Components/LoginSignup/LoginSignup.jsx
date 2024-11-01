import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import './LoginSignup.css';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../hooks/useNotification';

import user_icon from '../Assets/user.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignup = () => {
    const navigate = useNavigate();
    const { isLoading, startLoading, stopLoading } = useLoading();
    const { showSuccess, showError, showInfo } = useNotification();
    const [action, setAction] = useState("Login");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isResetMode, setIsResetMode] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Simulate initial load
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const validateForm = () => {
        let tempErrors = {};
        
        if (action === "Sign Up" && !formData.name.trim()) {
            tempErrors.name = "Name is required";
        } else if (action === "Sign Up" && formData.name.trim().length < 2) {
            tempErrors.name = "Name must be at least 2 characters long";
        } else if (action === "Sign Up" && formData.name.trim().length > 50) {
            tempErrors.name = "Name cannot exceed 50 characters";
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }

        if (!isResetMode) {
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
        
        // Real-time validation
        const tempErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (value.trim().length < 2 && value.trim().length > 0) {
                    tempErrors.name = "Name must be at least 2 characters long";
                } else if (value.trim().length > 50) {
                    tempErrors.name = "Name cannot exceed 50 characters";
                } else {
                    delete tempErrors.name;
                }
                break;
                
            case 'email':
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                if (value && !emailRegex.test(value)) {
                    tempErrors.email = "Please enter a valid email address";
                } else {
                    delete tempErrors.email;
                }
                break;
                
            case 'password':
                if (value) {
                    let passwordErrors = [];
                    if (value.length < 8) passwordErrors.push("at least 8 characters");
                    if (!/[A-Z]/.test(value)) passwordErrors.push("an uppercase letter");
                    if (!/[a-z]/.test(value)) passwordErrors.push("a lowercase letter");
                    if (!/[0-9]/.test(value)) passwordErrors.push("a number");
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) passwordErrors.push("a special character");
                    
                    if (passwordErrors.length > 0) {
                        tempErrors.password = "Password must contain " + passwordErrors.join(", ");
                    } else {
                        delete tempErrors.password;
                    }
                } else {
                    delete tempErrors.password;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(tempErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            startLoading(isResetMode ? 'Sending reset link...' : `${action}ing...`);
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (isResetMode) {
                    showSuccess('Password reset link has been sent to your email');
                    setIsResetMode(false);
                } else {
                    showSuccess(`${action} successful!`);
                    // Simulate navigation after successful login/signup
                    setTimeout(() => navigate('/homepage'), 1000);
                }
            } catch (error) {
                showError(error.message || 'An error occurred. Please try again.');
            } finally {
                stopLoading();
            }
        } else {
            showError('Please fix the errors in the form');
        }
    };

    const renderErrorMessage = (field) => {
        return errors[field] ? (
            <div className="error-message">
                {errors[field]}
            </div>
        ) : null;
    };

    if (isInitialLoad) {
        return (
            <div className="container">
                <div className="header">
                    <Skeleton height={40} width={200} />
                    <div className="underline"><Skeleton height={4} width={100} /></div>
                </div>
                <div className="inputs">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="input">
                            <Skeleton circle height={30} width={30} />
                            <Skeleton height={40} width="100%" />
                        </div>
                    ))}
                </div>
                <div className="submit-container">
                    <Skeleton height={50} width={120} />
                    <Skeleton height={50} width={120} />
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Please wait...</p>
                </div>
            )}
            
            <div className="header">
                <div className="text">
                    {isResetMode ? "Reset Password" : action}
                </div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
                <div className="inputs">
                    {action === "Sign Up" && !isResetMode && (
                        <div className="input-group">
                            <div className="input">
                                <img src={user_icon} alt="" className="image-size"/>
                                <input 
                                    type="text" 
                                    placeholder="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    maxLength={50}
                                />
                            </div>
                            {renderErrorMessage('name')}
                        </div>
                    )}
                    
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

                {!isResetMode && action === "Login" && (
                    <div className="forgot-password">
                        Lost Password? <span onClick={() => {
                            setIsResetMode(true);
                            showInfo('Enter your email to reset password');
                        }}>Click Here!</span>
                    </div>
                )}

                {isResetMode ? (
                    <div className="submit-container">
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
                    </div>
                ) : (
                    <div className="submit-container">
                        <button 
                            type="button"
                            className={action === "Login" ? "submit gray" : "submit"}
                            onClick={() => setAction("Sign Up")}
                        >
                            Sign Up
                        </button>
                        <button 
                            type="button"
                            className={action === "Sign Up" ? "submit gray" : "submit"}
                            onClick={() => setAction("Login")}
                        >
                            Login
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default LoginSignup;

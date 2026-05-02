// src/features/auth/otpService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

export const sendRegistrationOtp = async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/accounts/send-registration-otp`, {
        email,
        type: 'registration',
    });
    return response.data;
};

export const verifyRegistrationOtp = async (email: string, otp: string) => {
    const response = await axios.post(`${API_BASE_URL}/accounts/verify-registration-otp`, {
        email,
        otp,
        type: 'registration',
    });
    return response.data;
};
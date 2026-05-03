import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { useNavigate } from 'react-router-dom';
import { getRestaurantProfile } from '../services';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchRequirements() {
    const res = await fetch(`${API_BASE_URL}/verification/requirements`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.msg || 'Failed to fetch requirements');
    return data.data;
}

async function applyVerification(form: any) {
    const res = await fetch(`${API_BASE_URL}/verification/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.msg || 'Failed to apply');
    return data;
}

function Stepper({ step }: { step: number }) {
    return (
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10">
            {[1, 2, 3].map((n, idx) => (
                <React.Fragment key={n}>
                    <div className="flex flex-col items-center relative">
                        <div
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                transition-all duration-300 ease-in-out
                                ${step >= n
                                    ? 'bg-gradient-to-r from-[#ffcf1c] to-[#8BC34A] text-white shadow-lg shadow-[#ffcf1c]/30'
                                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                }
                            `}
                        >
                            {step > n ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                n
                            )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${step >= n ? 'text-[#ffcf1c]' : 'text-gray-400'}`}>
                            {n === 1 ? 'Submit' : n === 2 ? 'Review' : 'Verified'}
                        </span>
                    </div>
                    {idx < 2 && (
                        <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${step > n ? 'bg-[#ffcf1c]' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function RestaurantVerificationPage() {
    const [profile, setProfile] = React.useState<any>(null);
    const [requirements, setRequirements] = React.useState<any[]>([]);
    const [form, setForm] = React.useState<any>({});
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const prof = await getRestaurantProfile();
                setProfile(prof);
                if (prof.verificationStatus === 'not_verified') {
                    setRequirements(await fetchRequirements());
                }
            } catch (e) {
                await showErrorAlert(e, 'Failed to load verification info');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await applyVerification(form);
            await showSuccessAlert('Verification application submitted!');
            navigate(0);
        } catch (e) {
            await showErrorAlert(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (name: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] to-[#e8f0e5] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#ffcf1c] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Loading verification details...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] to-[#e8f0e5] flex items-center justify-center">
                <Card className="rounded-2xl shadow-xl border-none p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-500">Please complete your restaurant profile first.</p>
                </Card>
            </div>
        );
    }

    let content = null;
    let statusIcon = null;

    if (profile.verificationStatus === 'not_verified') {
        content = (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    {requirements.map((field: any) => (
                        <div key={field.name} className="group">
                            <label className="sr-only block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="relative">
                                {field.name === 'ownerName' && (
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                                {field.name === 'ownerPhoneNumber' && (
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                )}
                                {field.name === 'restaurantLocation' && (
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                                {field.name === 'ownerEmail' && (
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <input
                                    type={field.type || 'text'}
                                    required={field.required}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ffcf1c] focus:ring-2 focus:ring-[#ffcf1c]/20 transition-all duration-200 outline-none bg-gray-50/50"
                                    value={form[field.name] || ''}
                                    onChange={e => handleInputChange(field.name, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#ffcf1c] to-[#8BC34A] hover:from-[#5d8f4c] hover:to-[#7cb342] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#ffcf1c]/30 transition-all duration-200 transform hover:scale-[1.02]"
                >
                    {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                        </div>
                    ) : (
                        'Submit Verification'
                    )}
                </Button>
            </form>
        );
    } else if (profile.verificationStatus === 'pending') {
        statusIcon = (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        );
        content = (
            <div className="text-center py-8">
                {statusIcon}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Application Under Review</h3>
                <p className="text-gray-500">Our team is carefully reviewing your verification request. We'll notify you once it's processed.</p>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-700">⏱️ Typical review time: 2-3 business days</p>
                </div>
            </div>
        );
    } else if (profile.verificationStatus === 'step2') {
        statusIcon = (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
        );
        content = (
            <div className="text-center py-8">
                {statusIcon}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Admin Contact Pending</h3>
                <p className="text-gray-500">Our admin will reach out to you within 2 business days to complete the verification process.</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-sm text-blue-700 text-left">Please ensure your contact information is up to date.</p>
                </div>
            </div>
        );
    } else if (profile.verificationStatus === 'approved') {
        statusIcon = (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ffcf1c]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#ffcf1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        );
        content = (
            <div className="text-center py-8">
                {statusIcon}
                <h3 className="text-xl font-bold text-[#ffcf1c] mb-2">Verified Restaurant!</h3>
                <p className="text-gray-500">Your restaurant is now verified and visible to customers. Congratulations!</p>
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gradient-to-r from-[#ffcf1c] to-[#8BC34A] hover:from-[#5d8f4c] hover:to-[#7cb342] text-white font-semibold px-8 rounded-xl shadow-md"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-[#f0f5ec] to-[#e8f0e5] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
                        <svg className="w-8 h-8 text-[#ffcf1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">Restaurant Verification</h1>
                    <p className="text-gray-500 mt-2">Complete the verification process to unlock all features</p>
                </div>

                <Card className="rounded-2xl border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <Stepper step={
                            profile.verificationStatus === 'approved' ? 3 :
                                profile.verificationStatus === 'step2' ? 2 :
                                    profile.verificationStatus === 'pending' ? 1 :
                                        profile.verificationStatus === 'not_verified' ? 1 : 1
                        } />
                        {content}
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        Need help? Contact our support team at support@restaurantapp.com
                    </p>
                </div>
            </div>
        </div>
    );
}

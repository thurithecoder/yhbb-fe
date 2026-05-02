import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Store, Upload, User, Mail, Shield, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CUISINE_OPTIONS } from '@/constants/cuisines';
import { forgotPassword, login, register, verifyResetPassword } from '@/features/auth/services';
import { sendRegistrationOtp, verifyRegistrationOtp } from '@/features/auth/otpService';
import { getHomeRouteForRole } from '@/lib/auth';
import { showErrorAlert, showSuccessAlert, showToast } from '@/lib/alerts';
import { readFileAsDataUrl } from '@/utils';
import MapPicker from '@/features/map/components/MapPicker';
import { MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';
type RegisterAccountType = 'user' | 'restaurant' | null;
type RegisterForm = {
  account_type: 'user' | 'restaurant';
  firstname: string;
  lastname: string;
  restaurant_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  working_time_from: string;
  working_time_from_period: 'AM' | 'PM';
  working_time_to: string;
  working_time_to_period: 'AM' | 'PM';
  phone: string;
  cuisine: string;
  profilepic: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

const defaultLoginForm = {
  email: '',
  password: '',
};

const defaultRegisterForm: RegisterForm = {
  account_type: 'user',
  firstname: '',
  lastname: '',
  restaurant_name: '',
  location: '',
  latitude: null,
  longitude: null,
  working_time_from: '09:00',
  working_time_from_period: 'AM',
  working_time_to: '10:00',
  working_time_to_period: 'PM',
  phone: '',
  cuisine: '',
  profilepic: '',
  email: '',
  password: '',
  confirmPassword: '',
  otp: '',
};

const defaultForgotForm = {
  email: '',
};

const defaultResetForm = {
  email: '',
  otp: '',
  newPassword: '',
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = React.useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [registerAccountType, setRegisterAccountType] = React.useState<RegisterAccountType>(null);
  const [userRegisterStep, setUserRegisterStep] = React.useState(1);
  const [restaurantRegisterStep, setRestaurantRegisterStep] = React.useState(1);
  const [loginForm, setLoginForm] = React.useState(defaultLoginForm);
  const [registerForm, setRegisterForm] = React.useState(defaultRegisterForm);
  const [forgotForm, setForgotForm] = React.useState(defaultForgotForm);
  const [resetForm, setResetForm] = React.useState(defaultResetForm);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpTimer, setOtpTimer] = React.useState(0);
  const timeOptions = React.useMemo(() => buildTimeOptions(), []);

  const registerTotalSteps = registerAccountType === 'restaurant' ? 6 : 3; // Added OTP step
  const activeRegisterStep = registerAccountType === 'restaurant' ? restaurantRegisterStep : userRegisterStep;
  const isRegisterFinalStep = Boolean(registerAccountType) && activeRegisterStep === registerTotalSteps;
  const isOtpStep = activeRegisterStep === (registerAccountType === 'restaurant' ? 2 : 2); // Step 2 is OTP verification
  const [mapPickerOpen, setMapPickerOpen] = React.useState(false);

  // Timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const resetRegisterFlow = React.useCallback(() => {
    setRegisterAccountType(null);
    setUserRegisterStep(1);
    setRestaurantRegisterStep(1);
    setRegisterForm(defaultRegisterForm);
    setOtpSent(false);
    setOtpTimer(0);
    // No need to manually clear lat/lng because defaultRegisterForm already has null
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setView('login');
      resetRegisterFlow();
    }
  }, [isOpen, resetRegisterFlow]);

  const closeModal = () => {
    setView('login');
    resetRegisterFlow();
    onClose();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(loginForm);
      await showSuccessAlert(result.msg || 'Login successful.');
      closeModal();
      navigate(getHomeRouteForRole(result.user.role));
    } catch (error) {
      await showErrorAlert(error, 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  // دوال OTP - تأكد من وجودها
  const handleSendOtp = async () => {
    if (!registerForm.email.trim()) {
      await showErrorAlert('Please enter your email address.', 'Email Required');
      return;
    }

    if (!isEmail(registerForm.email)) {
      await showErrorAlert('Please enter a valid email address (e.g., name@example.com).', 'Invalid Email');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendRegistrationOtp(registerForm.email);
      if (result.success) {
        await showSuccessAlert(result.data.msg);
        // الانتقال إلى خطوة OTP
        if (registerAccountType === 'restaurant') {
          setRestaurantRegisterStep(2);
        } else {
          setUserRegisterStep(2);
        }
        setOtpSent(true);
        setOtpTimer(120);
        setRegisterForm((current) => ({ ...current, otp: '' }));
      } else {
        await showErrorAlert(result.data?.msg || 'Failed to send verification code.', 'Unable to Send');
      }
    } catch (error: any) {
      // معالجة أخطاء مختلفة من الـ backend
      console.error('Send OTP error:', error);

      // رسائل مخصصة حسب نوع الخطأ
      let errorMessage = 'Failed to send verification code. Please try again.';

      if (error.response?.data?.data?.msg) {
        errorMessage = error.response.data.data.msg;
      } else if (error.response?.status === 400) {
        errorMessage = 'This email may be already registered. Please use a different email or login.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      await showErrorAlert(errorMessage, 'Unable to Send');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!registerForm.otp.trim()) {
      await showErrorAlert('Please enter the verification code.', 'Code Required');
      return;
    }

    if (registerForm.otp.length !== 6) {
      await showErrorAlert('Verification code must be 6 digits.', 'Invalid Code');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyRegistrationOtp(registerForm.email, registerForm.otp);
      if (result.success && result.data.verified) {
        await showSuccessAlert(result.data.msg);
        // الانتقال إلى الخطوة التالية بعد التحقق
        if (registerAccountType === 'restaurant') {
          setRestaurantRegisterStep(3);
        } else {
          setUserRegisterStep(3);
        }
        setOtpSent(false);
        setOtpTimer(0);
        setRegisterForm((current) => ({ ...current, otp: '' }));
      } else {
        await showErrorAlert(result.data?.msg || 'Invalid verification code. Please try again.', 'Verification Failed');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);

      let errorMessage = 'Failed to verify code. Please try again.';

      if (error.response?.data?.data?.msg) {
        errorMessage = error.response.data.data.msg;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid or expired verification code. Please request a new code.';
      }

      await showErrorAlert(errorMessage, 'Verification Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!registerAccountType) {
      await showErrorAlert('Please choose whether you are registering as a user or a restaurant.', 'Choose account type');
      return;
    }

    // التحقق من صحة البيانات بناءً على الخطوة الحالية
    const validationError = getRegisterStepValidationError(registerAccountType, activeRegisterStep, registerForm);
    if (validationError) {
      await showErrorAlert(new Error(validationError), 'Please check this');
      return;
    }

    // إذا كنا في الخطوة 1 (إدخال البيانات الأساسية) - نرسل OTP
    if (activeRegisterStep === 1) {
      await handleSendOtp();
      return;
    }

    // إذا كنا في خطوة OTP (التحقق)
    if (activeRegisterStep === 2 && otpSent) {
      await handleVerifyOtp();
      return;
    }

    // إذا كنا في الخطوة الأخيرة (إنشاء الحساب)
    if (!isRegisterFinalStep) {
      // الانتقال إلى الخطوة التالية
      if (registerAccountType === 'restaurant') {
        setRestaurantRegisterStep((current) => Math.min(current + 1, registerTotalSteps));
      } else {
        setUserRegisterStep((current) => Math.min(current + 1, registerTotalSteps));
      }
      return;
    }

    // التسجيل النهائي
    setIsSubmitting(true);

    try {
      const payload =
        registerAccountType === 'restaurant'
          ? {
            account_type: 'restaurant' as const,
            restaurant_name: registerForm.restaurant_name,
            location: registerForm.location,
            latitude: registerForm.latitude,
            longitude: registerForm.longitude,
            working_time_from: registerForm.working_time_from,
            working_time_from_period: registerForm.working_time_from_period,
            working_time_to: registerForm.working_time_to,
            working_time_to_period: registerForm.working_time_to_period,
            phone: registerForm.phone,
            cuisine: registerForm.cuisine,
            profilepic: registerForm.profilepic,
            email: registerForm.email,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword,
          }
          : {
            account_type: 'user' as const,
            firstname: registerForm.firstname,
            lastname: registerForm.lastname,
            email: registerForm.email,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword,
          };

      const result = await register(payload);
      await showSuccessAlert(result.msg || 'Account created successfully! You can now login.');
      setLoginForm({ email: registerForm.email, password: '' });
      resetRegisterFlow();
      setView('login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.data?.msg || error.message || 'Unable to create account. Please try again.';
      await showErrorAlert(errorMessage, 'Registration Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRegisterType = (type: Exclude<RegisterAccountType, null>) => {
    setRegisterAccountType(type);
    setUserRegisterStep(1);
    setRestaurantRegisterStep(1);
    setRegisterForm((current) => ({
      ...defaultRegisterForm,
      account_type: type,
      email: current.email,
    }));
    setOtpSent(false);
    setOtpTimer(0);
  };

  const handleRegisterBack = () => {
    if (!registerAccountType) return;

    if (registerAccountType === 'restaurant') {
      if (restaurantRegisterStep > 1) {
        setRestaurantRegisterStep((current) => current - 1);
        return;
      }
    } else if (userRegisterStep > 1) {
      setUserRegisterStep((current) => current - 1);
      return;
    }

    setRegisterAccountType(null);
    setOtpSent(false);
    setOtpTimer(0);
  };

  const handleRestaurantImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setRegisterForm((current) => ({ ...current, profilepic: dataUrl }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to read restaurant image');
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(forgotForm);
      await showSuccessAlert(result.msg || 'OTP sent successfully.');
      setResetForm((current) => ({ ...current, email: forgotForm.email }));
      setView('reset');
    } catch (error) {
      await showErrorAlert(error, 'Unable to send reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await verifyResetPassword(resetForm);
      await showSuccessAlert(result.msg || 'Password reset successful.');
      setResetForm(defaultResetForm);
      setLoginForm({ email: resetForm.email, password: '' });
      setView('login');
    } catch (error) {
      await showErrorAlert(error, 'Unable to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <div className="bg-neutral-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6EA15C] blur-[80px] opacity-20 -mr-16 -mt-16" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
              {view === 'forgot' ? 'Forgot Password' : view === 'reset' ? 'Reset Password' : t('auth.welcome_title', 'Welcome Habibi')}
            </DialogTitle>
            <DialogDescription className="text-neutral-400 font-medium">
              {view === 'forgot'
                ? 'We will send a one-time reset code to your email.'
                : view === 'reset'
                  ? 'Enter the OTP from your email and choose a new password.'
                  : t('auth.welcome_subtitle', 'Join our community of food lovers')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 bg-white">
          {(view === 'login' || view === 'register') && (
            <Tabs value={view} onValueChange={(value) => setView(value as AuthView)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-neutral-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-[#6EA15C] data-[state=active]:shadow-sm transition-all">
                  {t('auth.login', 'Login')}
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-[#6EA15C] data-[state=active]:shadow-sm transition-all">
                  {t('auth.register', 'Register')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="habibi@example.com"
                        className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-neutral-400">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Password"
                        className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotForm({ email: loginForm.email });
                        setView('forgot');
                      }}
                      className="text-sm font-bold text-[#6EA15C] hover:underline"
                    >
                      Forgot password?
                    </button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-36 h-12 bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-xl font-black uppercase tracking-wide transition-all shadow-lg"
                    >
                      {isSubmitting ? 'Please wait...' : t('auth.login_submit', 'Log In')}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  {!registerAccountType ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-neutral-600">Choose how you want to register:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleSelectRegisterType('user')}
                          className="rounded-2xl border border-neutral-200 p-5 text-left hover:border-[#6EA15C] hover:bg-[#F7FBF6] transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-[#6EA15C]/10 grid place-items-center">
                              <User className="w-5 h-5 text-[#6EA15C]" />
                            </div>
                            <p className="font-black uppercase tracking-tight text-neutral-900">As a User</p>
                          </div>
                          <p className="text-sm text-neutral-500">Create a customer account to browse and save favorites.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectRegisterType('restaurant')}
                          className="rounded-2xl border border-neutral-200 p-5 text-left hover:border-[#6EA15C] hover:bg-[#F7FBF6] transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-[#6EA15C]/10 grid place-items-center">
                              <Store className="w-5 h-5 text-[#6EA15C]" />
                            </div>
                            <p className="font-black uppercase tracking-tight text-neutral-900">As a Restaurant</p>
                          </div>
                          <p className="text-sm text-neutral-500">Create a restaurant account and complete your business profile.</p>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
                            {registerAccountType === 'restaurant' ? 'Restaurant registration' : 'User registration'}
                          </p>
                          <p className="text-xs font-bold text-neutral-500">
                            Step {activeRegisterStep} of {registerTotalSteps}
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full bg-[#6EA15C] transition-all"
                            style={{ width: `${(activeRegisterStep / registerTotalSteps) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* User Registration Steps */}
                      {registerAccountType === 'user' && activeRegisterStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reg-firstname" className="text-xs font-black uppercase tracking-widest text-neutral-400">First Name</Label>
                              <Input
                                id="reg-firstname"
                                value={registerForm.firstname}
                                onChange={(event) => setRegisterForm((current) => ({ ...current, firstname: event.target.value }))}
                                placeholder="John"
                                className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reg-lastname" className="text-xs font-black uppercase tracking-widest text-neutral-400">Last Name</Label>
                              <Input
                                id="reg-lastname"
                                value={registerForm.lastname}
                                onChange={(event) => setRegisterForm((current) => ({ ...current, lastname: event.target.value }))}
                                placeholder="Doe"
                                className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-email" className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
                            <Input
                              id="reg-email"
                              type="email"
                              value={registerForm.email}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                              placeholder="habibi@example.com"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                        </div>
                      )}

                      {/* User OTP Step */}
                      {registerAccountType === 'user' && activeRegisterStep === 2 && (
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-800">Email Verification Required</p>
                              <p className="text-xs text-blue-600 mt-1">
                                We've sent a 6-digit OTP to <span className="font-bold">{registerForm.email}</span>
                              </p>
                              {otpTimer > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Code expires in {formatTimer(otpTimer)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-otp" className="text-xs font-black uppercase tracking-widest text-neutral-400">OTP Code</Label>
                            <div className="flex gap-2">
                              <Input
                                id="reg-otp"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={registerForm.otp}
                                onChange={(event) => setRegisterForm((current) => ({ ...current, otp: event.target.value }))}
                                className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20 flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={isSubmitting || otpTimer > 0}
                                className="h-12 px-4 rounded-xl font-bold"
                              >
                                {otpTimer > 0 ? formatTimer(otpTimer) : 'Resend'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* User Password Step */}
                      {registerAccountType === 'user' && activeRegisterStep === 3 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-password" className="text-xs font-black uppercase tracking-widest text-neutral-400">Password</Label>
                            <Input
                              id="reg-password"
                              type="password"
                              value={registerForm.password}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                              placeholder="At least 6 characters"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-confirm-password" className="text-xs font-black uppercase tracking-widest text-neutral-400">Confirm Password</Label>
                            <Input
                              id="reg-confirm-password"
                              type="password"
                              value={registerForm.confirmPassword}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                              placeholder="Re-enter your password"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                        </div>
                      )}

                      {/* Restaurant Registration Steps */}
                      {registerAccountType === 'restaurant' && activeRegisterStep === 1 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-name" className="text-xs font-black uppercase tracking-widest text-neutral-400">Restaurant Name</Label>
                            <Input
                              id="reg-restaurant-name"
                              value={registerForm.restaurant_name}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, restaurant_name: event.target.value }))}
                              placeholder="Habibi Grill"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-location" className="text-xs font-black uppercase tracking-widest text-neutral-400">Location</Label>
                            <div className="space-y-2">
                              <Label htmlFor="reg-restaurant-location" className="text-xs font-black uppercase tracking-widest text-neutral-400">Location</Label>
                              <button
                                type="button"
                                onClick={() => setMapPickerOpen(true)}
                                className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-left flex items-center gap-2 hover:border-[#6EA15C] transition-colors"
                              >
                                <MapPin className="w-5 h-5 text-neutral-400" />
                                <span className={registerForm.location ? 'text-neutral-900' : 'text-neutral-500'}>
                                  {registerForm.location || 'Click to select location on map'}
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-email" className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
                            <Input
                              id="reg-restaurant-email"
                              type="email"
                              value={registerForm.email}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                              placeholder="owner@habibi-grill.com"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                        </div>
                      )}

                      {/* Restaurant OTP Step */}
                      {registerAccountType === 'restaurant' && activeRegisterStep === 2 && (
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-800">Email Verification Required</p>
                              <p className="text-xs text-blue-600 mt-1">
                                We've sent a 6-digit OTP to <span className="font-bold">{registerForm.email}</span>
                              </p>
                              {otpTimer > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Code expires in {formatTimer(otpTimer)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-otp" className="text-xs font-black uppercase tracking-widest text-neutral-400">OTP Code</Label>
                            <div className="flex gap-2">
                              <Input
                                id="reg-restaurant-otp"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={registerForm.otp}
                                onChange={(event) => setRegisterForm((current) => ({ ...current, otp: event.target.value }))}
                                className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20 flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={isSubmitting || otpTimer > 0}
                                className="h-12 px-4 rounded-xl font-bold"
                              >
                                {otpTimer > 0 ? formatTimer(otpTimer) : 'Resend'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {registerAccountType === 'restaurant' && activeRegisterStep === 3 && (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-neutral-600">Work Time</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TimeBlock
                              label="From"
                              time={registerForm.working_time_from}
                              period={registerForm.working_time_from_period}
                              timeOptions={timeOptions}
                              onTimeChange={(value) => setRegisterForm((current) => ({ ...current, working_time_from: value }))}
                              onPeriodChange={(value) => setRegisterForm((current) => ({ ...current, working_time_from_period: value }))}
                            />
                            <TimeBlock
                              label="To"
                              time={registerForm.working_time_to}
                              period={registerForm.working_time_to_period}
                              timeOptions={timeOptions}
                              onTimeChange={(value) => setRegisterForm((current) => ({ ...current, working_time_to: value }))}
                              onPeriodChange={(value) => setRegisterForm((current) => ({ ...current, working_time_to_period: value }))}
                            />
                          </div>
                        </div>
                      )}

                      {registerAccountType === 'restaurant' && activeRegisterStep === 4 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-phone" className="text-xs font-black uppercase tracking-widest text-neutral-400">Phone Number</Label>
                            <Input
                              id="reg-restaurant-phone"
                              value={registerForm.phone}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                              placeholder="+60 123 456 789"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-cuisine" className="text-xs font-black uppercase tracking-widest text-neutral-400">Cuisine</Label>
                            <Input
                              id="reg-restaurant-cuisine"
                              value={registerForm.cuisine}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, cuisine: event.target.value }))}
                              list="register-cuisine-options"
                              placeholder="Start typing cuisine..."
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                            <datalist id="register-cuisine-options">
                              {CUISINE_OPTIONS.map((cuisine) => (
                                <option key={cuisine} value={cuisine} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                      )}

                      {registerAccountType === 'restaurant' && activeRegisterStep === 5 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-image" className="text-xs font-black uppercase tracking-widest text-neutral-400">Select Image</Label>
                            <input
                              id="reg-restaurant-image"
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleRestaurantImageChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="reg-restaurant-image"
                              className="relative block h-48 overflow-hidden rounded-2xl border-2 border-dashed border-[#6EA15C]/50 bg-[#F7FBF6] cursor-pointer transition-colors hover:border-[#6EA15C]"
                            >
                              {registerForm.profilepic ? (
                                <>
                                  <img src={registerForm.profilepic} alt="Restaurant preview" className="h-full w-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs font-black uppercase tracking-wide py-2 text-center">
                                    Change Image
                                  </div>
                                </>
                              ) : (
                                <div className="h-full w-full grid place-items-center px-4">
                                  <div className="flex flex-col items-center gap-2 text-[#6EA15C]">
                                    <div className="h-14 w-14 rounded-2xl bg-white border border-[#6EA15C]/30 grid place-items-center">
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <p className="font-black uppercase tracking-wide text-sm flex items-center gap-2">
                                      <Upload className="w-4 h-4" />
                                      Upload
                                    </p>
                                    <p className="text-xs font-semibold text-neutral-500">Click to select restaurant image</p>
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      {registerAccountType === 'restaurant' && activeRegisterStep === 6 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-password" className="text-xs font-black uppercase tracking-widest text-neutral-400">Password</Label>
                            <Input
                              id="reg-restaurant-password"
                              type="password"
                              value={registerForm.password}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                              placeholder="At least 6 characters"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-restaurant-confirm-password" className="text-xs font-black uppercase tracking-widest text-neutral-400">Confirm Password</Label>
                            <Input
                              id="reg-restaurant-confirm-password"
                              type="password"
                              value={registerForm.confirmPassword}
                              onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                              placeholder="Re-enter your password"
                              className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRegisterBack}
                          className="flex-1 h-12 rounded-xl font-black uppercase tracking-wide"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-12 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide transition-all shadow-lg"
                        >
                          {isSubmitting ? 'Please wait...' : isRegisterFinalStep ? t('auth.register_submit', 'Create Account') : 'Next Step'}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotForm.email}
                  onChange={(event) => setForgotForm({ email: event.target.value })}
                  placeholder="habibi@example.com"
                  className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setView('login')} className="flex-1 h-12 rounded-xl font-black uppercase tracking-wide">
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide">
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetForm.email}
                    onChange={(event) => setResetForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="habibi@example.com"
                    className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-otp" className="text-xs font-black uppercase tracking-widest text-neutral-400">OTP Code</Label>
                  <Input
                    id="reset-otp"
                    value={resetForm.otp}
                    onChange={(event) => setResetForm((current) => ({ ...current, otp: event.target.value }))}
                    placeholder="6-digit OTP"
                    className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-password" className="text-xs font-black uppercase tracking-widest text-neutral-400">New Password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    value={resetForm.newPassword}
                    onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                    placeholder="At least 6 characters"
                    className="h-12 rounded-xl border-neutral-200 focus:border-[#6EA15C] focus:ring-[#6EA15C]/20"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setView('login')} className="flex-1 h-12 rounded-xl font-black uppercase tracking-wide">
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide">
                  {isSubmitting ? 'Updating...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-400 font-medium">
              By continuing, you agree to our <span className="text-neutral-900 font-bold underline cursor-pointer">Terms of Service</span>
            </p>
          </div>
        </div>
      </DialogContent>
      <MapPicker
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelect={(address, lat, lng) => {
          setRegisterForm(prev => ({
            ...prev,
            location: address,
            latitude: lat,
            longitude: lng,
          }));
        }}
        initialAddress={registerForm.location || undefined}
        initialLat={registerForm.latitude || undefined}
        initialLng={registerForm.longitude || undefined}
      />
    </Dialog>
  );
}

function getRegisterStepValidationError(
  accountType: Exclude<RegisterAccountType, null>,
  step: number,
  form: RegisterForm
) {
  // Skip validation for OTP step in parent, handled separately
  if (step === 2) return null; // OTP step handled separately

  if (accountType === 'user') {
    if (step === 1) {
      if (!form.firstname.trim()) return 'First name is required.';
      if (!form.lastname.trim()) return 'Last name is required.';
      if (!form.email.trim()) return 'Email is required.';
      if (!isEmail(form.email)) return 'Please enter a valid email address.';
    }

    if (step === 3) {
      if (form.password.trim().length < 6) return 'Password should be more than 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords are not matching.';
    }

    return null;
  }

  if (step === 1) {
    if (!form.restaurant_name.trim()) return 'Restaurant name is required.';
    if (!form.location.trim()) return 'Location is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!isEmail(form.email)) return 'Please enter a valid email address.';
  }

  if (step === 3) {
    if (!form.working_time_from.trim() || !form.working_time_to.trim()) return 'Working time is required.';
    if (!form.working_time_from_period.trim() || !form.working_time_to_period.trim()) return 'Working time period is required.';
  }

  if (step === 4) {
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!form.cuisine.trim()) return 'Cuisine is required.';
  }

  if (step === 5) {
    if (!form.profilepic.trim()) return 'Please upload a restaurant image.';
  }

  if (step === 6) {
    if (form.password.trim().length < 6) return 'Password should be more than 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords are not matching.';
  }

  return null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function TimeBlock({
  label,
  time,
  period,
  timeOptions,
  onTimeChange,
  onPeriodChange,
}: {
  label: string;
  time: string;
  period: string;
  timeOptions: string[];
  onTimeChange: (value: string) => void;
  onPeriodChange: (value: 'AM' | 'PM') => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#6EA15C]"
        >
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as 'AM' | 'PM')}
          className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#6EA15C]"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

function buildTimeOptions() {
  const options: string[] = [];
  for (let hour = 1; hour <= 12; hour += 1) {
    ['00', '30'].forEach((minute) => {
      options.push(`${String(hour).padStart(2, '0')}:${minute}`);
    });
  }
  return options;
}
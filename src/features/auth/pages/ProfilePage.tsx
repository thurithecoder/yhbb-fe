import * as React from 'react';
import { User, Store, ShieldCheck, Heart, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { changePassword } from '@/features/auth/services';
import ProfileIdentityCard from '@/features/auth/components/ProfileIdentityCard';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

const emptyPasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { canAccess, isReady } = useRequireRole();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState(emptyPasswordForm);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await changePassword(passwordForm);
      await showSuccessAlert(result.msg || 'Password updated successfully.');
      setPasswordForm(emptyPasswordForm);
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading profile...</div>;
  }

  if (!canAccess || !user) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container px-4 mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="space-y-8">
            <ProfileIdentityCard user={user} />
          </div>

          <div className="lg:col-span-3 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="First Name" value={user.firstname || 'Not set'} icon={User} />
              <StatCard label="Last Name" value={user.lastname || 'Not set'} icon={User} />
              <StatCard label="Role" value={user.role} icon={user.role === 'admin' ? ShieldCheck : user.role === 'restaurant' ? Store : Heart} />
            </div>

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
              <CardContent className="p-0 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Security</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Change Password</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <FormInput label="Old Password" type="password" value={passwordForm.oldPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, oldPassword: value }))} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="New Password" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} />
                    <FormInput label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide">
                    <KeyRound className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-none shadow-sm rounded-[32px] bg-white p-8 flex items-center gap-6">
      <div className="bg-green-50 p-4 rounded-2xl">
        <Icon className="w-8 h-8 text-[#6EA15C]" />
      </div>
      <div>
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-[#6EA15C]">{value}</p>
      </div>
    </Card>
  );
}

function FormInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Input type={type} placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

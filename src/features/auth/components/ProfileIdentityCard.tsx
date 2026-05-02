import * as React from 'react';
import { Loader2, PenLine, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { User } from '@/types';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { getMyProfile, updateMyProfileImage } from '@/features/auth/services';
import { readFileAsDataUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';

type ProfileIdentityCardProps = {
  user: User;
};

export default function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const { setUser } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const loadedUserIdRef = React.useRef<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = React.useState(false);

  const profileInitial = user.displayName?.slice(0, 1).toUpperCase() || user.email.slice(0, 1).toUpperCase();
  const hasImage = Boolean(user.photoURL);

  React.useEffect(() => {
    if (loadedUserIdRef.current === user.id) return;
    loadedUserIdRef.current = user.id;

    let isMounted = true;
    const syncProfileFromBackend = async () => {
      try {
        const refreshedUser = await getMyProfile();
        if (!isMounted) return;
        setUser({
          ...user,
          ...refreshedUser,
          photoURL: refreshedUser.photoURL,
        });
      } catch {
        // keep current session data when profile fetch fails
      }
    };

    syncProfileFromBackend();

    return () => {
      isMounted = false;
    };
  }, [setUser, user]);

  const openFilePicker = () => {
    if (isUpdatingImage) return;
    fileInputRef.current?.click();
  };

  const applyProfileImage = async (profilepic: string | null) => {
    setIsUpdatingImage(true);
    try {
      const result = await updateMyProfileImage(profilepic);
      setUser(result.user);
      await showSuccessAlert(result.msg);
    } catch (error) {
      await showErrorAlert(error, 'Unable to update profile image');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      await applyProfileImage(dataUrl);
    } catch (error) {
      await showErrorAlert(error, 'Unable to read profile image');
    }
  };

  const handleRemoveImage = async () => {
    const confirmed = await confirmAction({
      title: 'Remove profile image?',
      text: 'Your profile image will be removed and replaced with your initials.',
      confirmButtonText: 'Remove image',
      icon: 'warning',
    });

    if (!confirmed) return;
    await applyProfileImage(null);
  };

  return (
    <Card className="border-none shadow-sm rounded-[32px] bg-white p-8 text-center space-y-6">
      <div className="relative h-32 w-32 mx-auto group/avatar">
        <Avatar className="h-32 w-32 ring-4 ring-green-50 ring-offset-4 overflow-hidden">
          <AvatarImage src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
          <AvatarFallback className="text-4xl font-black bg-green-50 text-[#6EA15C]">{profileInitial}</AvatarFallback>
        </Avatar>

        <div className="pointer-events-none absolute inset-0 rounded-full bg-black/45 opacity-0 transition-opacity group-hover/avatar:opacity-100 group-focus-within/avatar:opacity-100" />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUpdatingImage}
          title={hasImage ? 'Change image' : 'Add image'}
          className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity outline-none group-hover/avatar:opacity-100 group-focus-within/avatar:opacity-100 disabled:cursor-not-allowed"
        >
          <span className="h-10 w-10 rounded-full bg-white text-[#6EA15C] shadow-md flex items-center justify-center">
            {isUpdatingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenLine className="w-5 h-5" />}
          </span>
          <span className="sr-only">{hasImage ? 'Change image' : 'Add image'}</span>
        </button>

        {hasImage && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isUpdatingImage}
            title="Remove image"
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white text-red-600 shadow-md flex items-center justify-center opacity-0 transition-opacity group-hover/avatar:opacity-100 group-focus-within/avatar:opacity-100 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove image</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleImageSelect}
        className="hidden"
      />

      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight uppercase text-[#6EA15C]">{user.displayName}</h2>
        <p className="text-neutral-400 font-medium text-sm">{user.email}</p>
      </div>
      <Badge className="bg-green-50 text-[#6EA15C] border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
        {user.role}
      </Badge>
    </Card>
  );
}

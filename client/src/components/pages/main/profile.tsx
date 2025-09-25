'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileForm } from '@/features/profile/components/profile-form';
import { NavUmum } from '@/components/umum/nav-umum';
import { updateProfileForm } from '@/features/profile/hooks/useProfile';
import { toast } from 'sonner';

export function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile,
  } = useProfile(shouldFetch);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  const handleUpdateProfile = (data: updateProfileForm) => {
    const toastId = toast.loading('Updating profile...');
    updateProfile.mutate(data, {
      onSuccess: (res) => {
        setIsEditing(false);
        toast.success(res?.message || 'Profile updated successfully!', {
          id: toastId,
        });
      },
      onError: () => {
        toast.error('Failed to update profile.', {
          id: toastId,
        });
      },
    });
  };

  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen pt-16 pb-5 md:px-10 px-5">
      <NavUmum />

      <section className="flex flex-col flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold my-4">
          User Profile
        </h1>

        <article
          className="bg-glass-bg bg-background/40 border-glass-border text-foreground backdrop-blur-xl sm:p-10 p-5 rounded-xl shadow-lg transition"
          style={{
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {isLoggedIn && (
            <ProfileForm
              user={profile}
              isLoadingUser={authLoading || isLoading}
              isError={isError}
              isEditing={isEditing}
              isPending={updateProfile.isPending}
              onEditToggle={() => setIsEditing(!isEditing)}
              onSubmit={handleUpdateProfile}
              onRetry={refetch}
            />
          )}
        </article>
      </section>
    </main>
  );
}

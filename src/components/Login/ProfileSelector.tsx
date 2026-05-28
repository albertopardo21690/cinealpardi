import ImageFader from '@app/components/Common/ImageFader';
import { useUser } from '@app/hooks/useUser';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Image from 'next/image';
import { useState } from 'react';
import useSWR from 'swr';

interface Profile {
  id: number;
  displayName: string;
  avatar: string;
  isAdmin: boolean;
}

interface ProfileSelectorProps {
  backdrops?: string[];
  onUsePassword: () => void;
}

const ProfileSelector = ({
  backdrops,
  onUsePassword,
}: ProfileSelectorProps) => {
  const { revalidate } = useUser();
  const { data: profiles, error } = useSWR<Profile[]>('/api/v1/auth/profiles');
  const [selecting, setSelecting] = useState<number | null>(null);

  const selectProfile = async (userId: number) => {
    setSelecting(userId);
    try {
      const response = await axios.post('/api/v1/auth/profile', { userId });
      if (response.data?.id) {
        revalidate();
      }
    } catch {
      setSelecting(null);
    }
  };

  // If the feature isn't actually enabled (404) or returns nothing, render
  // nothing so the caller can fall back to the normal login form.
  if (error || (profiles && profiles.length === 0)) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gray-900 py-14">
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://image.tmdb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      <div className="relative z-40 mx-auto flex w-full max-w-2xl flex-col items-center px-4">
        <div className="relative mb-2 h-28 w-full max-w-[220px]">
          <Image src="/logo_stacked.svg" alt="Cinealpardi" fill />
        </div>
        <h1 className="mb-10 text-center text-3xl font-bold tracking-wide text-white">
          ¿Quién pide hoy?
        </h1>

        <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-4">
          {!profiles &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-gray-700/40"
              />
            ))}

          {profiles?.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => selectProfile(profile.id)}
              disabled={selecting !== null}
              className={`group flex flex-col items-center rounded-2xl border bg-gray-800/40 p-4 backdrop-blur transition duration-150 hover:border-indigo-500 hover:bg-gray-700/50 focus:border-indigo-500 focus:outline-none disabled:opacity-50 ${
                selecting === profile.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500'
                  : 'border-white/10'
              }`}
            >
              <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full ring-2 ring-transparent transition group-hover:ring-indigo-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="truncate text-base font-semibold text-white">
                {profile.displayName}
              </span>
              <span
                className={`mt-1 text-xs font-medium uppercase tracking-wider ${
                  profile.isAdmin ? 'text-indigo-400' : 'text-gray-400'
                }`}
              >
                {profile.isAdmin ? 'Admin' : 'Miembro'}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onUsePassword}
          className="mt-10 flex items-center text-sm text-gray-400 transition hover:text-indigo-400"
        >
          <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
          Entrar con contraseña
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;

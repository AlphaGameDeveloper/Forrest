'use client';

import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Logout
      </button>
    </form>
  );
}

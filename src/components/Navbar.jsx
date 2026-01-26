"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "lib/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="w-full border-b bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          <span className="text-blue-600">Neon</span> Code
        </Link>

        {/* Right side */}
        {!user && (
          <div className="flex gap-3">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-70">
              {user.displayName || user.email}
            </span>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

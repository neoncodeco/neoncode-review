"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "lib/auth";



export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <nav className="w-full border-b bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          <span className="text-blue-600">Neon</span> Code
        </Link>

        {!user && (
          <div className="flex gap-3">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        )}

        {user && (
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}

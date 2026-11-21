"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
      }

      setPassword("");
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করো।");
      } else if (err.code === "auth/network-request-failed") {
        setError("ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো।");
      } else {
        setError("লগইন হয়নি। ইমেইল ও পাসওয়ার্ড পরীক্ষা করো।");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setError("");
    setBusy(true);

    try {
      await signOut(auth);
      setPassword("");
    } catch {
      setError("লগআউট হয়নি। আবার চেষ্টা করো।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-bold">Docly Admin</h1>

        {checking ? (
          <p className="mt-6">লগইন পরীক্ষা হচ্ছে…</p>
        ) : user?.uid === ADMIN_UID ? (
          <>
            <p className="mt-4 break-all">{user.email}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href="/admin/doctors"
                className="rounded-2xl border border-[#dce5d9] bg-[#f3f7f2] p-5"
              >
                <h2 className="text-xl font-semibold">
                  ডাক্তার পরিচালনা
                </h2>
                <p className="mt-2 text-sm leading-7">
                  তালিকা, তথ্য Edit, চেম্বার ও Publish পরিচালনা করুন।
                </p>
              </a>

              <a
                href="/admin/doctors/new"
                className="rounded-2xl border border-[#dce5d9] bg-[#f3f7f2] p-5"
              >
                <h2 className="text-xl font-semibold">
                  ডাক্তার যোগ করুন
                </h2>
                <p className="mt-2 text-sm leading-7">
                  নতুন ডাক্তারের তথ্য ড্রাফট হিসেবে সেভ করুন।
                </p>
              </a>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              className="mt-8 rounded-xl bg-[#16735d] px-6 py-3 text-white disabled:opacity-60"
            >
              {busy ? "অপেক্ষা করো…" : "লগআউট"}
            </button>
          </>
        ) : user ? (
          <div className="mt-6">
            <p>এই অ্যাকাউন্টের Admin অনুমতি নেই।</p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              className="mt-5 rounded-xl bg-[#16735d] px-6 py-3 text-white disabled:opacity-60"
            >
              লগআউট
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-8">
            <fieldset disabled={busy} className="space-y-5">
              <label className="block">
                <span>ইমেইল</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span>পাসওয়ার্ড</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#16735d] px-6 py-3 text-white disabled:opacity-60"
              >
                {busy ? "লগইন হচ্ছে…" : "লগইন করুন"}
              </button>
            </fieldset>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-5 text-red-700">{error}</p>
        )}
      </section>
    </main>
  );
}

const inputClass =
  "mt-2 block w-full rounded-xl border border-[#b9cbb6] bg-white p-3 text-base text-[#234737] focus:outline-2 focus:outline-[#16735d]";
"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase-auth";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";

export default function DoctorsPage() {
  const [access, setAccess] = useState("checking");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [changingId, setChangingId] = useState("");
  const changing = useRef(false);

  useEffect(() => {
    let unsubscribeDoctors = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeDoctors();
      unsubscribeDoctors = () => {};

      setDoctors([]);
      setError("");
      setActionError("");
      setMessage("");

      if (user?.uid !== ADMIN_UID) {
        setAccess("denied");
        setLoading(false);
        return;
      }

      setAccess("allowed");
      setLoading(true);

      const doctorsQuery = query(
        collection(db, "doctors"),
        orderBy("createdAt", "desc"),
        limit(100)
      );

      unsubscribeDoctors = onSnapshot(
        doctorsQuery,
        (snapshot) => {
          setDoctors(
            snapshot.docs.map((document) => ({
              ...document.data(),
              id: document.id,
            }))
          );
          setLoading(false);
        },
        (err) => {
          setError(`তালিকা আনা যায়নি। Error: ${err.code || "unknown"}`);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDoctors();
    };
  }, []);

  async function changeStatus(doctor) {
    if (changing.current) return;

    setActionError("");
    setMessage("");

    if (auth.currentUser?.uid !== ADMIN_UID) {
      setActionError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
      return;
    }

    const nextStatus =
      doctor.status === "published" ? "draft" : "published";

    if (nextStatus === "published") {
      if (
        !doctor.name?.trim() ||
        !doctor.specialty?.trim() ||
        !doctor.chambers?.length
      ) {
        setActionError("প্রকাশের আগে নাম, বিশেষজ্ঞতা ও চেম্বার যোগ করো।");
        return;
      }

      const confirmed = window.confirm(
        `"${doctor.name}" প্রকাশ করবে?\n\nপ্রকাশিত প্রোফাইলের তথ্য সাধারণ ব্যবহারকারী পড়তে পারবে। এটি তথ্য যাচাইয়ের চিহ্ন যোগ করবে না।`
      );

      if (!confirmed) return;
    }

    changing.current = true;
    setChangingId(doctor.id);

    try {
      await updateDoc(doc(db, "doctors", doctor.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        nextStatus === "published"
          ? "প্রোফাইল প্রকাশিত হয়েছে।"
          : "প্রোফাইল ড্রাফটে ফেরানো হয়েছে।"
      );
    } catch (err) {
      setActionError(
        `পরিবর্তন হয়নি। Error: ${err.code || "unknown"}`
      );
    } finally {
      changing.current = false;
      setChangingId("");
    }
  }
async function handleTrashRestore(doctor) {
  if (changing.current) return;

  setActionError("");
  setMessage("");

  if (auth.currentUser?.uid !== ADMIN_UID) {
    setActionError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
    return;
  }

  const restoring = doctor.status === "trashed";

  if (
    !restoring &&
    !window.confirm(
      `"${doctor.name}" ট্র্যাশে রাখবে? পরে Restore করা যাবে।`
    )
  ) {
    return;
  }

  changing.current = true;
  setChangingId(doctor.id);

  try {
    await updateDoc(doc(db, "doctors", doctor.id), {
      status: restoring ? "draft" : "trashed",
      trashedAt: restoring ? null : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setMessage(
      restoring
        ? "প্রোফাইল ড্রাফট হিসেবে ফিরেছে।"
        : "প্রোফাইল ট্র্যাশে রাখা হয়েছে।"
    );
  } catch (err) {
    setActionError(`পরিবর্তন হয়নি। Error: ${err.code || "unknown"}`);
  } finally {
    changing.current = false;
    setChangingId("");
  }
}
  const filteredDoctors = doctors.filter((doctor) => {
    if (statusFilter === "active" && doctor.status === "trashed") {
  return false;
}

if (
  statusFilter !== "active" &&
  doctor.status !== statusFilter
) {
  return false;
}
    const searchableText = [
      doctor.name,
      doctor.specialty,
      ...(doctor.districts || []),
      ...(doctor.chambers || []).map((chamber) => chamber.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(search.trim().toLocaleLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <section className="mx-auto max-w-4xl">
        <a href="/admin" className="text-[#16735d] underline">
          Admin পেজে ফিরুন
        </a>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">ডাক্তারদের তালিকা</h1>

          {access === "allowed" && (
            <a
              href="/admin/doctors/new"
              className="rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              ডাক্তার যোগ করুন
            </a>
          )}
        </div>

        {access === "checking" ? (
          <p className="mt-6">লগইন পরীক্ষা হচ্ছে…</p>
        ) : access === "denied" ? (
          <p className="mt-6">
            আগে Admin অ্যাকাউন্ট দিয়ে লগইন করো।
          </p>
        ) : (
          <>
            <div
  aria-label="প্রোফাইলের অবস্থা অনুযায়ী ফিল্টার"
  className="mt-6 flex flex-wrap gap-3"
>
  {[
    ["active", "সব — ট্র্যাশ ছাড়া"],
    ["published", "প্রকাশিত"],
    ["draft", "ড্রাফট"],
    ["trashed", "ট্র্যাশ"],
  ].map(([value, label]) => (
    <button
      key={value}
      type="button"
      aria-pressed={statusFilter === value}
      onClick={() => setStatusFilter(value)}
      className={`rounded-xl border px-4 py-2 ${
        statusFilter === value
          ? "border-[#16735d] bg-[#16735d] text-white"
          : "border-[#b9cbb6] bg-white text-[#234737]"
      }`}
    >
      {label}
    </button>
  ))}
</div>
            <label className="mt-6 block">
              <span>নাম, বিশেষজ্ঞতা, জেলা বা চেম্বার দিয়ে খুঁজুন</span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="যেমন: ডেমো ডাক্তার"
                className="mt-2 w-full rounded-xl border border-[#b9cbb6] bg-white p-3 text-base focus:outline-2 focus:outline-[#16735d]"
              />
            </label>

            <p className="mt-3 text-sm">
              সর্বশেষ সর্বোচ্চ ১০০টি প্রোফাইল দেখানো হবে।
              সার্চ এই তালিকার মধ্যে কাজ করবে।
            </p>

            {actionError && (
              <p role="alert" className="mt-5 text-red-700">
                {actionError}
              </p>
            )}

            {message && (
              <p role="status" className="mt-5 text-[#16735d]">
                {message}
              </p>
            )}

            {error ? (
              <p role="alert" className="mt-6 text-red-700">
                {error}
              </p>
            ) : loading ? (
              <p role="status" className="mt-6">তালিকা আসছে…</p>
            ) : (
              <>
                <p className="mt-6">
                  পাওয়া গেছে: {filteredDoctors.length}টি
                </p>

                {filteredDoctors.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-white p-5">
                    {doctors.length === 0
                      ? "এখনো কোনো ডাক্তার যোগ করা হয়নি।"
                      : "এই সার্চে কোনো ডাক্তার পাওয়া যায়নি।"}
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {filteredDoctors.map((doctor) => (
                      <article
                        key={doctor.id}
                        className="rounded-2xl border border-[#dce5d9] bg-white p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h2 className="text-xl font-semibold">
                            {doctor.name || "নাম দেওয়া হয়নি"}
                          </h2>

                          <span className="rounded-lg bg-[#edf3e9] px-3 py-1 text-sm">
                            {doctor.status === "published"
  ? "প্রকাশিত"
  : doctor.status === "draft"
  ? "ড্রাফট"
  : doctor.status === "trashed"
  ? "ট্র্যাশ"
  : doctor.status || "অজানা"}
                          </span>
                        </div>

                        <p className="mt-2 text-[#16735d]">
                          {doctor.specialty || "বিশেষজ্ঞতা দেওয়া হয়নি"}
                        </p>

                        {doctor.qualifications && (
                          <p className="mt-2">{doctor.qualifications}</p>
                        )}

                        <p className="mt-3">
                          জেলা: {(doctor.districts || []).join(", ") || "দেওয়া হয়নি"}
                        </p>

                        {(doctor.chambers || []).map((chamber, index) => (
                          <div
                            key={`${doctor.id}-${index}`}
                            className="mt-4 border-t border-[#dce5d9] pt-4"
                          >
                            <p className="font-semibold">{chamber.name}</p>

                            <p className="mt-1">
                              {[chamber.area, chamber.district]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        ))}

                        <div className="mt-5 flex flex-wrap gap-3">
  {doctor.status !== "trashed" && (
    <>
      <a
        href={`/admin/doctors/${doctor.id}/edit`}
        className="rounded-lg bg-[#edf3e9] px-4 py-2 text-[#16735d]"
      >
        Edit করুন
      </a>

      <a
        href={`/admin/doctors/${doctor.id}/chambers`}
        className="rounded-lg bg-[#edf3e9] px-4 py-2 text-[#16735d]"
      >
        চেম্বার Edit
      </a>

      {["draft", "published"].includes(doctor.status) && (
        <button
          type="button"
          onClick={() => changeStatus(doctor)}
          disabled={Boolean(changingId)}
          className="rounded-lg bg-[#16735d] px-4 py-2 text-white disabled:opacity-50"
        >
          {changingId === doctor.id
            ? "সেভ হচ্ছে…"
            : doctor.status === "published"
            ? "ড্রাফটে ফেরান"
            : "Publish করুন"}
        </button>
      )}
    </>
  )}

  <button
    type="button"
    onClick={() => handleTrashRestore(doctor)}
    disabled={Boolean(changingId)}
    className={`rounded-lg border px-4 py-2 disabled:opacity-50 ${
      doctor.status === "trashed"
        ? "border-[#16735d] text-[#16735d]"
        : "border-red-300 text-red-700"
    }`}
  >
    {changingId === doctor.id
      ? "অপেক্ষা করো…"
      : doctor.status === "trashed"
      ? "Restore করুন"
      : "ট্র্যাশে রাখুন"}
  </button>
</div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
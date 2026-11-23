"use client";

import { useEffect, useState } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SaveDoctorButton from "@/components/SaveDoctorButton";
import DoctorPhoto from "@/components/DoctorPhoto";

const STORAGE_KEY = "docly-saved-doctors";
const CHANGE_EVENT = "docly-saved-change";

function readSavedIds() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) return [];

  const value = JSON.parse(raw);

  if (
    !Array.isArray(value) ||
    !value.every(
      (id) => typeof id === "string" && id.length > 0 && !id.includes("/")
    )
  ) {
    throw new Error("Invalid saved list");
  }

  return [...new Set(value)];
}

export default function SavedDoctorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let requestNumber = 0;

    async function loadSavedDoctors() {
      const thisRequest = ++requestNumber;

      setLoading(true);
      setError("");
      setItems([]);

      try {
        const ids = readSavedIds();

        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const snapshot = await getDocFromServer(
                doc(db, "doctors", id)
              );

              if (
                !snapshot.exists() ||
                snapshot.data().status !== "published"
              ) {
                return { id, state: "unavailable" };
              }

              return {
                id,
                state: "available",
                doctor: snapshot.data(),
              };
            } catch (err) {
              if (
                err.code === "permission-denied" ||
                err.code === "not-found"
              ) {
                return { id, state: "unavailable" };
              }

              return { id, state: "failed" };
            }
          })
        );

        if (!active || thisRequest !== requestNumber) return;

        setItems(results);

        if (results.some((item) => item.state === "failed")) {
          setError(
            "কিছু প্রোফাইলের তথ্য আনা যায়নি। তালিকা থেকে মুছে দেওয়া হয়নি। আবার চেষ্টা করুন।"
          );
        }
      } catch {
        if (active && thisRequest === requestNumber) {
          setError("এই ব্রাউজারে সেভ করা তালিকা পড়া যাচ্ছে না।");
        }
      } finally {
        if (active && thisRequest === requestNumber) {
          setLoading(false);
        }
      }
    }

    function handleStorage(event) {
      if (event.key === STORAGE_KEY || event.key === null) {
        loadSavedDoctors();
      }
    }

    loadSavedDoctors();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHANGE_EVENT, loadSavedDoctors);

    return () => {
      active = false;
      requestNumber++;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CHANGE_EVENT, loadSavedDoctors);
    };
  }, [retry]);

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-8 text-[#234737]">
      <div className="mx-auto max-w-4xl">
        

        <h1 className="text-3xl font-bold">
          সেভ করা ডাক্তার
        </h1>

        <p className="mt-3 leading-7">
          এই ব্রাউজারে সেভ করা প্রোফাইলগুলো এখানে পাবেন।
        </p>

        {error && (
          <div className="mt-5 rounded-2xl bg-white p-5">
            <p role="alert" className="text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-4 rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {loading ? (
          <p role="status" className="mt-6">তালিকা আসছে…</p>
        ) : items.length === 0 && !error ? (
          <section className="mt-6 rounded-2xl border border-[#dce5d9] bg-white p-6">
            <h2 className="text-xl font-semibold">
              এখনো কোনো ডাক্তার সেভ করা হয়নি।
            </h2>

            <p className="mt-3">
              ডাক্তারের প্রোফাইল খুলে “ডাক্তার সেভ করুন” চাপুন।
            </p>

            <a
              href="/"
              className="mt-5 inline-block rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              ডাক্তার খুঁজুন
            </a>
          </section>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[#dce5d9] bg-white p-6"
              >
                {item.state === "available" ? (
                  <>
                    <div className="mb-4">
  <DoctorPhoto
    src={item.doctor.photoUrl}
    name={item.doctor.name}
  />
</div>
                    <h2 className="text-xl font-bold">
                      <a
                        href={`/doctors/${encodeURIComponent(item.id)}`}
                        className="underline underline-offset-4"
                      >
                        {item.doctor.name}
                      </a>
                    </h2>

                    <p className="mt-3 text-[#16735d]">
                      {item.doctor.specialty}
                    </p>

                    {item.doctor.qualifications && (
                      <p className="mt-2">
                        {item.doctor.qualifications}
                      </p>
                    )}

                    <p className="mt-3">
                      জেলা: {(item.doctor.districts || []).join(", ") || "তথ্য দেওয়া হয়নি"}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold">
                      {item.state === "failed"
                        ? "প্রোফাইলের তথ্য আনা যায়নি"
                        : "প্রোফাইলটি এখন পাওয়া যাচ্ছে না"}
                    </h2>

                    <p className="mt-3 leading-7">
                      {item.state === "failed"
                        ? "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।"
                        : "প্রোফাইলটি অপ্রকাশিত বা সরিয়ে দেওয়া হয়ে থাকতে পারে। চাইলে সেভ করা তালিকা থেকে সরাতে পারেন।"}
                    </p>
                  </>
                )}

                <div className="mt-5">
                  <SaveDoctorButton doctorId={item.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
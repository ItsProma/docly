"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  getDocsFromServer,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { districtGroups } from "@/lib/locations";
import DoctorPhoto from "@/components/DoctorPhoto";

const specialties = [
  "মেডিসিন", "শিশু", "গাইনি ও প্রসূতি", "চর্ম ও যৌন",
  "হৃদরোগ", "নিউরোলজি", "অর্থোপেডিক্স", "নাক-কান-গলা",
  "চক্ষু", "দন্ত", "সার্জারি", "কিডনি", "ইউরোলজি",
  "ডায়াবেটিস ও হরমোন", "মানসিক স্বাস্থ্য", "বক্ষব্যাধি",
  "গ্যাস্ট্রোএন্টারোলজি", "ক্যান্সার", "অন্যান্য",
];

export default function HomePage() {
  const [district, setDistrict] = useState("সিলেট");
  const [specialty, setSpecialty] = useState("");
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      setLoading(true);
      setDoctors([]);
      setError("");

      try {
        const doctorsQuery = query(
          collection(db, "doctors"),
          where("status", "==", "published"),
          where("districts", "array-contains", district),
          limit(50)
        );

        const snapshot = await getDocsFromServer(doctorsQuery);

        if (active) {
          setDoctors(
            snapshot.docs.map((document) => ({
              ...document.data(),
              id: document.id,
            }))
          );
        }
      } catch (err) {
        console.error("Docly doctors query failed", err);

        if (active) {
          setError("ডাক্তারদের তালিকা আনা যায়নি। আবার চেষ্টা করুন।");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [district, retry]);

  const filteredDoctors = doctors.filter((doctor) => {
    const chambers = (doctor.chambers || []).filter(
      (chamber) => chamber.district === district
    );

    const text = [
      doctor.name,
      doctor.specialty,
      doctor.qualifications,
      ...chambers.flatMap((chamber) => [
        chamber.name,
        chamber.area,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!specialty || doctor.specialty === specialty) &&
      text.includes(search.trim().toLocaleLowerCase())
    );
  });

  const hasFilters = Boolean(search || specialty);

  function clearFilters() {
    setSearch("");
    setSpecialty("");
  }

  return (
    <main className="min-h-screen bg-white text-[#203c30]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="flex items-center justify-between border-b border-[#edf1ee] py-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16735d] text-2xl text-white"
            >
              +
            </span>

            <span className="text-2xl font-bold tracking-tight">
              Docly
            </span>
          </Link>

          <nav
            aria-label="ডেস্কটপ নেভিগেশন"
            className="hidden items-center gap-5 text-sm md:flex"
          >
            <Link href="/saved" className="hover:underline">
              সেভ করা
            </Link>
            <Link href="/profile" className="hover:underline">
              প্রোফাইল
            </Link>
          </nav>

          <p className="text-sm text-[#66766e] md:hidden">
            ডাক্তার খুঁজুন
          </p>
        </header>

        <section aria-label="ডাক্তার খুঁজুন" className="py-5">
          <h1 className="text-xl font-bold">কোথায় ডাক্তার খুঁজছেন?</h1>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="min-w-0">
              <span className="text-sm font-medium">জেলা</span>

              <select
                value={district}
                onChange={(event) => {
                  setDistrict(event.target.value);
                  clearFilters();
                }}
                className={inputClass}
              >
                {Object.entries(districtGroups).map(([division, districts]) => (
                  <optgroup key={division} label={`${division} বিভাগ`}>
                    {districts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="text-sm font-medium">বিশেষজ্ঞতা</span>

              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className={inputClass}
              >
                <option value="">সব বিশেষজ্ঞ</option>

                {specialties.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">
              ডাক্তারের নাম, চেম্বার বা এলাকা দিয়ে খুঁজুন
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ডাক্তারের নাম, চেম্বার বা এলাকা…"
              className={inputClass}
            />
          </label>
        </section>

        <section
          aria-label="ডাক্তারদের তালিকা"
          className="border-t border-[#edf1ee] pt-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {district} জেলার ডাক্তার
            </h2>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 px-2 text-sm text-[#16735d] underline"
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>

          {loading ? (
            <p role="status" className="py-8 text-[#66766e]">
              ডাক্তারদের তালিকা আসছে…
            </p>
          ) : error ? (
            <div className="my-5 rounded-2xl bg-[#f7f9f8] p-5">
              <p role="alert">{error}</p>

              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-4 rounded-xl bg-[#16735d] px-5 py-3 text-white"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <>
              <p role="status" className="mt-2 text-sm text-[#66766e]">
                পাওয়া গেছে {filteredDoctors.length}টি প্রোফাইল
              </p>

              {filteredDoctors.length === 0 ? (
                <div className="my-5 rounded-2xl border border-[#e4eae7] bg-[#f7f9f8] p-5">
                  <h3 className="font-semibold">
                    {doctors.length === 0
                      ? "এই জেলায় তথ্য এখনো যোগ করা হয়নি"
                      : "এই সার্চে ডাক্তার পাওয়া যায়নি"}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#66766e]">
                    {doctors.length === 0
                      ? "অন্য জেলা নির্বাচন করে দেখতে পারেন।"
                      : "নাম বা এলাকা বদলে খুঁজুন, অথবা ফিল্টার মুছুন।"}
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {filteredDoctors.map((doctor) => {
                    const chambers = (doctor.chambers || []).filter(
                      (chamber) => chamber.district === district
                    );

                    const firstChamber = chambers[0];
                    const profileUrl =
                      `/doctors/${encodeURIComponent(doctor.id)}`;

                    return (
                      <article
                        key={doctor.id}
                        className="min-w-0 rounded-2xl border border-[#e4eae7] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <DoctorPhoto
                            src={doctor.photoUrl}
                            name={doctor.name}
                            size={64}
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-lg font-semibold leading-7">
                              <Link
                                href={profileUrl}
                                className="hover:text-[#16735d] hover:underline"
                              >
                                {doctor.name}
                              </Link>
                            </h3>

                            <p className="mt-1 text-sm font-medium text-[#16735d]">
                              {doctor.specialty}
                            </p>

                            {doctor.qualifications && (
                              <p className="mt-1 break-words text-sm leading-6 text-[#66766e]">
                                {doctor.qualifications}
                              </p>
                            )}
                          </div>
                        </div>

                        {firstChamber && (
                          <div className="mt-4 border-t border-[#edf1ee] pt-3">
                            <p className="break-words text-sm font-medium">
                              {firstChamber.name}
                            </p>

                            <p className="mt-1 text-sm text-[#66766e]">
                              {[firstChamber.area, firstChamber.district]
                                .filter(Boolean)
                                .join(", ")}
                            </p>

                            {firstChamber.schedule && (
                              <p className="mt-2 break-words text-sm leading-6">
                                {firstChamber.schedule}
                              </p>
                            )}

                            {firstChamber.fee !== null &&
                              firstChamber.fee !== undefined &&
                              firstChamber.fee !== "" && (
                                <p className="mt-2 text-sm">
                                  ভিজিট: ৳ {firstChamber.fee}
                                </p>
                              )}

                            {chambers.length > 1 && (
                              <p className="mt-2 text-sm text-[#66766e]">
                                এই জেলায় আরও {chambers.length - 1}টি চেম্বার
                              </p>
                            )}
                          </div>
                        )}

                        <Link
                          href={profileUrl}
                          className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-[#edf6f1] px-4 py-3 text-sm font-semibold text-[#16735d] hover:bg-[#e0f0e7]"
                        >
                          প্রোফাইল ও সিরিয়ালের তথ্য
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}

              {doctors.length === 50 && (
                <p className="mt-4 text-sm leading-6 text-[#66766e]">
                  আপাতত প্রথম ৫০টি প্রোফাইল দেখানো হচ্ছে।
                  সার্চ এই তালিকার মধ্যে কাজ করে।
                </p>
              )}
            </>
          )}
        </section>

        <footer className="mt-8 border-t border-[#edf1ee] py-5 text-sm text-[#66766e]">
          <p className="leading-6">
            যাওয়ার আগে চেম্বারে যোগাযোগ করে সময় ও ফি নিশ্চিত করুন।
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
            <Link href="/about" className="hover:underline">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/contact" className="hover:underline">
              যোগাযোগ
            </Link>
            <Link href="/privacy" className="hover:underline">
              গোপনীয়তা
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

const inputClass =
  "mt-2 block min-h-12 w-full min-w-0 rounded-xl border border-[#d7e1db] bg-[#f7f9f8] px-3 py-3 text-base text-[#203c30] focus:outline-2 focus:outline-[#16735d]";
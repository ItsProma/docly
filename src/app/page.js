"use client";

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
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
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
        console.error("Docly: doctors query failed", err);

        if (active) {
          setError(
            process.env.NODE_ENV === "development"
              ? `${err.code || "unknown"}: ${err.message}`
              : "ডাক্তারদের তালিকা আনা যায়নি। আবার চেষ্টা করুন।"
          );
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
    const localChambers = (doctor.chambers || []).filter(
      (chamber) => chamber.district === district
    );

    const searchableText = [
      doctor.name,
      doctor.specialty,
      doctor.qualifications,
      ...localChambers.flatMap((chamber) => [
        chamber.name,
        chamber.area,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!specialty || doctor.specialty === specialty) &&
      searchableText.includes(search.trim().toLocaleLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-[#f3f7f2] text-[#234737]">
      <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16735d] text-3xl text-white"
            >
              +
            </span>

            <span className="text-3xl font-bold tracking-tight">
              Docly
            </span>
          </div>

          <p className="text-sm">
            নির্বাচিত জেলা<br />
            <strong>{district}</strong>
          </p>
        </header>

        <section className="relative overflow-hidden rounded-3xl bg-[#e2eddd] p-7 sm:p-10">
          <p className="text-sm font-semibold tracking-widest text-[#526a48]">
            CARE, CLOSER TO YOU
          </p>

          <h1 className="relative z-10 mt-4 text-3xl font-bold leading-relaxed sm:text-4xl">
            সঠিক ডাক্তার খুঁজুন,
            <br />
            আপনার কাছেই।
          </h1>

          <p className="relative z-10 mt-4 max-w-lg leading-8">
            আপনার জেলার ডাক্তার, চেম্বার ও রোগী দেখার তথ্য
            খুঁজুন এক জায়গায়।
          </p>

          <p className="mt-5 inline-block rounded-lg bg-white px-3 py-2 text-sm">
            বাংলাদেশের ৬৪টি জেলা নির্বাচন করুন
          </p>
        </section>
<div className="mt-5">
  <a
    href="/saved"
    className="inline-block rounded-xl border border-[#16735d] bg-white px-5 py-3 text-[#16735d]"
  >
    সেভ করা ডাক্তার
  </a>
</div>
        <section aria-label="ডাক্তার খোঁজার ফিল্টার" className="mt-7">
          <label className="block">
            <span className="font-medium">
              ডাক্তার, চেম্বার বা এলাকা দিয়ে খুঁজুন
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="নাম বা এলাকা লিখুন…"
              className={inputClass}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span>জেলা</span>

              <select
                value={district}
                onChange={(event) => {
                  setDistrict(event.target.value);
                  setSearch("");
                  setSpecialty("");
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

            <label>
              <span>বিশেষজ্ঞতা</span>

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
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">কোন বিশেষজ্ঞ খুঁজছেন?</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["মেডিসিন", "শিশু", "গাইনি ও প্রসূতি", "চর্ম ও যৌন"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={specialty === item}
                  onClick={() =>
                    setSpecialty(specialty === item ? "" : item)
                  }
                  className={`rounded-2xl border p-4 ${
                    specialty === item
                      ? "border-[#16735d] bg-[#16735d] text-white"
                      : "border-[#dce5d9] bg-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </section>

        <section className="mt-9" aria-label="ডাক্তারদের তালিকা">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">
              {district} জেলার ডাক্তার
            </h2>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSpecialty("");
              }}
              className="text-[#16735d] underline"
            >
              ফিল্টার মুছুন
            </button>
          </div>

          {loading ? (
            <p role="status" className="mt-5">ডাক্তারদের তথ্য আসছে…</p>
          ) : error ? (
            <div className="mt-5 rounded-2xl bg-white p-5">
              <p role="alert" className="break-words text-red-700">
                {error}
              </p>

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
              <p className="mt-3 text-sm">
                এই তালিকায় পাওয়া গেছে {filteredDoctors.length}টি প্রোফাইল।
                প্রতি জেলায় সর্বোচ্চ ৫০টি লোড হচ্ছে।
              </p>

              {filteredDoctors.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-[#dce5d9] bg-white p-6">
                  {doctors.length === 0
                    ? "এই জেলায় ডাক্তারের তথ্য এখনো যোগ করা হয়নি।"
                    : "এই ফিল্টারে কোনো ডাক্তার পাওয়া যায়নি।"}
                </p>
              ) : (
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {filteredDoctors.map((doctor) => (
                    <article
                      key={doctor.id}
                      className="rounded-2xl border border-[#dce5d9] bg-white p-6"
                    >
                      <div className="mb-4">
  <DoctorPhoto
    src={doctor.photoUrl}
    name={doctor.name}
  />
</div>
                      <h3 className="text-xl font-bold">
  <a
    href={`/doctors/${doctor.id}`}
    className="underline decoration-[#b9cbb6] underline-offset-4 hover:text-[#16735d]"
  >
    {doctor.name}
  </a>
</h3>

                      <p className="mt-2 font-medium text-[#16735d]">
                        {doctor.specialty}
                      </p>

                      {doctor.qualifications && (
                        <p className="mt-2">{doctor.qualifications}</p>
                      )}

                      {doctor.workplace && (
                        <p className="mt-2">{doctor.workplace}</p>
                      )}

                      {(doctor.chambers || [])
                        .filter((chamber) => chamber.district === district)
                        .map((chamber, index) => (
                          <div
                            key={`${doctor.id}-${index}`}
                            className="mt-5 border-t border-[#dce5d9] pt-4"
                          >
                            <h4 className="font-semibold">{chamber.name}</h4>

                            <p className="mt-2">
                              {[chamber.area, chamber.district]
                                .filter(Boolean)
                                .join(", ")}
                            </p>

                            {chamber.schedule && (
                              <p className="mt-2">{chamber.schedule}</p>
                            )}

                            <p className="mt-2">
                              ভিজিট ফি:{" "}
                              {chamber.fee === null ||
                              chamber.fee === undefined ||
                              chamber.fee === ""
                                ? "তথ্য দেওয়া হয়নি"
                                : `৳ ${chamber.fee}`}
                            </p>
                          </div>
                        ))}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="mt-10 border-t border-[#dce5d9] pt-5 text-sm leading-7">
          <p>
            চেম্বারের সময় ও ভিজিট ফি পরিবর্তন হতে পারে।
            যাওয়ার আগে চেম্বারে যোগাযোগ করে নিশ্চিত করুন।
          </p>
          <p className="mt-2">Docly · Deb Creatives</p>
          <a
  href="/privacy"
  className="mr-5 mt-3 inline-block text-[#16735d] underline"
>
  গোপনীয়তা নীতি
</a>
          <a
  href="/about"
  className="mr-5 mt-3 inline-block text-[#16735d] underline"
>
  আমাদের সম্পর্কে
</a>
          <a
  href="/contact"
  className="mt-3 inline-block text-[#16735d] underline"
>
  যোগাযোগ ও তথ্য সংশোধন
</a>
        </footer>
      </div>
    </main>
  );
}

const inputClass =
  "mt-2 block w-full rounded-xl border border-[#b9cbb6] bg-white p-3 text-base text-[#234737] focus:outline-2 focus:outline-[#16735d]";
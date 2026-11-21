"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SaveDoctorButton from "@/components/SaveDoctorButton";
import ChamberMapLink from "@/components/ChamberMapLink";
import DoctorPhoto from "@/components/DoctorPhoto";

function getPhoneLink(value) {
  const normalized = String(value || "")
    .replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit))
    .replace(/[\s()-]/g, "");

  return /^\+?\d{7,15}$/.test(normalized)
    ? `tel:${normalized}`
    : null;
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<p className="p-8">প্রোফাইল আসছে…</p>}>
      <DoctorProfileContent />
    </Suspense>
  );
}

function DoctorProfileContent() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDoctor() {
      setLoading(true);
      setDoctor(null);
      setError("");

      try {
        const snapshot = await getDocFromServer(doc(db, "doctors", id));

        if (!active) return;

        if (
          !snapshot.exists() ||
          snapshot.data().status !== "published"
        ) {
          setError("প্রোফাইলটি পাওয়া যায়নি অথবা এখন প্রকাশিত নেই।");
          return;
        }

        setDoctor(snapshot.data());
      } catch (err) {
        if (!active) return;

        if (
          err.code === "permission-denied" ||
          err.code === "not-found"
        ) {
          setError("প্রোফাইলটি পাওয়া যায়নি অথবা এখন প্রকাশিত নেই।");
        } else {
          setError("তথ্য আনা যায়নি। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctor();

    return () => {
      active = false;
    };
  }, [id, retry]);

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-8 text-[#234737]">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-[#16735d] underline">
          হোমে ফিরুন
        </a>

        {loading ? (
          <p role="status" className="mt-8">প্রোফাইল আসছে…</p>
        ) : error ? (
          <section className="mt-6 rounded-2xl bg-white p-6">
            <h1 className="text-2xl font-bold">ডাক্তারের প্রোফাইল</h1>
            <p role="alert" className="mt-4">{error}</p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-5 rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </section>
        ) : doctor ? (
          <>
            <header className="mt-6 rounded-3xl bg-[#e2eddd] p-7 sm:p-9">
              <p className="text-sm font-semibold tracking-widest">
                DOCLY
              </p>
<div className="mt-5">
  <DoctorPhoto
    src={doctor.photoUrl}
    name={doctor.name}
    size={128}
  />
</div>
              <h1 className="mt-3 text-3xl font-bold leading-relaxed">
                {doctor.name}
              </h1>

              <p className="mt-3 text-lg font-medium text-[#16735d]">
                {doctor.specialty}
              </p>

              {doctor.qualifications && (
                <p className="mt-3">{doctor.qualifications}</p>
              )}
            </header>

            <div className="mt-5">
  <SaveDoctorButton doctorId={id} />
</div>

            <section className="mt-6 rounded-2xl border border-[#dce5d9] bg-white p-6">
              <h2 className="text-xl font-bold">ডাক্তার সম্পর্কে</h2>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-sm">কর্মস্থল</dt>
                  <dd className="mt-1">
                    {doctor.workplace || "তথ্য দেওয়া হয়নি"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm">BMDC নিবন্ধন নম্বর</dt>
                  <dd className="mt-1">
                    {doctor.bmdcNumber || "তথ্য দেওয়া হয়নি"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold">চেম্বার ও সিরিয়াল</h2>

              {(doctor.chambers || []).length === 0 ? (
                <p className="mt-4 rounded-2xl bg-white p-6">
                  চেম্বারের তথ্য দেওয়া হয়নি।
                </p>
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {doctor.chambers.map((chamber, index) => {
                    const phoneLink = getPhoneLink(chamber.phone);

                    return (
                      <article
                        key={`${id}-${index}`}
                        className="rounded-2xl border border-[#dce5d9] bg-white p-6"
                      >
                        <h3 className="text-xl font-bold">{chamber.name}</h3>

                        <p className="mt-3 font-medium text-[#16735d]">
                          {[chamber.area, chamber.district]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {chamber.address && (
                          <p className="mt-3 leading-7">{chamber.address}</p>
                        )}

                        <dl className="mt-5 space-y-5">
                          <div>
                            <dt className="text-sm">রোগী দেখার দিন ও সময়</dt>
                            <dd className="mt-1 leading-7">
                              {chamber.schedule || "তথ্য দেওয়া হয়নি"}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-sm">ভিজিট ফি</dt>
                            <dd className="mt-1">
                              {chamber.fee === null ||
                              chamber.fee === undefined ||
                              chamber.fee === ""
                                ? "তথ্য দেওয়া হয়নি"
                                : `৳ ${chamber.fee}`}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-sm">সিরিয়ালের ফোন নম্বর</dt>
                            <dd className="mt-1 break-words">
                              {chamber.phone || "তথ্য দেওয়া হয়নি"}
                            </dd>
                          </div>
                        </dl>
<ChamberMapLink chamber={chamber} />
                        {phoneLink && (
                          <a
                            href={phoneLink}
                            className="mt-6 inline-block rounded-xl bg-[#16735d] px-5 py-3 text-white"
                          >
                            সিরিয়ালের জন্য কল করুন
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <p className="mt-7 rounded-2xl bg-[#e2eddd] p-5 text-sm leading-7">
              সময় ও ফি পরিবর্তন হতে পারে। যাওয়ার আগে চেম্বারে যোগাযোগ
              করে নিশ্চিত করুন। কল বাটন চাপলে ফোন করার ব্যবস্থা খুলবে;
              এতে অ্যাপয়েন্টমেন্ট নিশ্চিত হবে না।
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}
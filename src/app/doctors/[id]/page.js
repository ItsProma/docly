"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DoctorPhoto from "@/components/DoctorPhoto";
import SaveDoctorButton from "@/components/SaveDoctorButton";

function getPhoneLink(value) {
  const normalized = String(value || "")
    .replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit))
    .replace(/[\s()-]/g, "");

  return /^\+?\d{7,15}$/.test(normalized)
    ? `tel:${normalized}`
    : null;
}

function getMapLink(chamber) {
  const address = [
    chamber.name,
    chamber.address,
    chamber.area,
    chamber.district,
    "Bangladesh",
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  if (!chamber.district) return null;

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent([...new Set(address)].join(", "))
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <p className="bg-white p-6 text-[#203c30]">
          প্রোফাইল আসছে…
        </p>
      }
    >
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
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDoctor() {
      setLoading(true);
      setDoctor(null);
      setError("");
      setShareMessage("");
      setShareLink("");

      try {
        const snapshot = await getDocFromServer(
          doc(db, "doctors", id)
        );

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

        setError(
          err.code === "permission-denied" || err.code === "not-found"
            ? "প্রোফাইলটি পাওয়া যায়নি অথবা এখন প্রকাশিত নেই।"
            : "তথ্য আনা যায়নি। আবার চেষ্টা করুন।"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctor();

    return () => {
      active = false;
    };
  }, [id, retry]);

  async function handleShare() {
    if (sharing || !doctor) return;

    setSharing(true);
    setShareMessage("");
    setShareLink("");

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${doctor.name} | Docly`,
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMessage("প্রোফাইলের লিংক কপি হয়েছে।");
      } else {
        setShareLink(url);
        setShareMessage("নিচের লিংকটি কপি করে পাঠাতে পারেন।");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setShareLink(url);
        setShareMessage("নিচের লিংকটি কপি করে পাঠাতে পারেন।");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-4 text-[#203c30] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[#edf1ee] pb-4">
          <Link
            href="/"
            className="flex min-h-12 items-center px-2 text-sm font-medium text-[#16735d]"
          >
            হোমে ফিরুন
          </Link>

          {!loading && doctor && (
            <div className="flex flex-wrap items-start gap-2">
              <SaveDoctorButton doctorId={id} compact />

              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="min-h-12 rounded-xl border border-[#d7e1db] px-4 py-3 text-sm text-[#203c30] disabled:opacity-50"
              >
                {sharing ? "অপেক্ষা…" : "শেয়ার"}
              </button>
            </div>
          )}
        </header>

        {shareMessage && (
          <p role="status" className="mt-3 text-sm text-[#16735d]">
            {shareMessage}
          </p>
        )}

        {shareLink && (
          <label className="mt-3 block text-sm">
            প্রোফাইলের লিংক
            <input
              readOnly
              value={shareLink}
              onFocus={(event) => event.target.select()}
              className="mt-2 w-full rounded-xl border border-[#d7e1db] p-3 text-base"
            />
          </label>
        )}

        {loading ? (
          <p role="status" className="py-8 text-[#66766e]">
            প্রোফাইল আসছে…
          </p>
        ) : error ? (
          <section className="mt-5 rounded-2xl bg-[#f7f9f8] p-5">
            <h1 className="text-xl font-bold">ডাক্তারের প্রোফাইল</h1>
            <p role="alert" className="mt-3">{error}</p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-4 rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </section>
        ) : doctor ? (
          <>
            <section className="flex items-start gap-4 py-5">
              <DoctorPhoto
                src={doctor.photoUrl}
                name={doctor.name}
                size={80}
              />

              <div className="min-w-0 flex-1">
                <h1 className="break-words text-xl font-bold leading-7 sm:text-2xl">
                  {doctor.name}
                </h1>

                <p className="mt-2 text-sm font-semibold text-[#16735d]">
                  {doctor.specialty}
                </p>

                {doctor.qualifications && (
                  <p className="mt-2 break-words text-sm leading-6 text-[#66766e]">
                    {doctor.qualifications}
                  </p>
                )}

                {doctor.workplace && (
                  <p className="mt-2 break-words text-sm leading-6">
                    {doctor.workplace}
                  </p>
                )}
              </div>
            </section>

            <section className="border-t border-[#edf1ee] pt-5">
              <h2 className="text-lg font-bold">চেম্বার ও সিরিয়াল</h2>

              {(doctor.chambers || []).length === 0 ? (
                <p className="mt-4 text-[#66766e]">
                  চেম্বারের তথ্য দেওয়া হয়নি।
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {doctor.chambers.map((chamber, index) => {
                    const phoneLink = getPhoneLink(chamber.phone);
                    const mapLink = getMapLink(chamber);

                    return (
                      <article
                        key={`${id}-${index}`}
                        className="min-w-0 rounded-2xl border border-[#e4eae7] p-4"
                      >
                        <h3 className="break-words text-lg font-semibold">
                          {chamber.name}
                        </h3>

                        <p className="mt-2 text-sm font-medium text-[#16735d]">
                          {[chamber.area, chamber.district]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {chamber.address && (
                          <p className="mt-2 break-words text-sm leading-6 text-[#66766e]">
                            {chamber.address}
                          </p>
                        )}

                        <dl className="mt-4 space-y-3 border-t border-[#edf1ee] pt-4">
                          <div>
                            <dt className="text-sm text-[#66766e]">
                              রোগী দেখার সময়
                            </dt>
                            <dd className="mt-1 break-words leading-7">
                              {chamber.schedule || "তথ্য দেওয়া হয়নি"}
                            </dd>
                          </div>

                          <div className="flex flex-wrap justify-between gap-2">
                            <dt className="text-sm text-[#66766e]">
                              ভিজিট ফি
                            </dt>
                            <dd className="font-semibold">
                              {chamber.fee === null ||
                              chamber.fee === undefined ||
                              chamber.fee === ""
                                ? "তথ্য দেওয়া হয়নি"
                                : `৳ ${chamber.fee}`}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-sm text-[#66766e]">
                              সিরিয়ালের নম্বর
                            </dt>
                            <dd className="mt-1 break-words">
                              {chamber.phone || "তথ্য দেওয়া হয়নি"}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {phoneLink ? (
                            <a
                              href={phoneLink}
                              className="flex min-h-12 items-center justify-center rounded-xl bg-[#16735d] px-3 py-3 text-sm font-semibold text-white"
                            >
                              কল করুন
                            </a>
                          ) : (
                            <span className="flex min-h-12 items-center justify-center rounded-xl bg-[#f2f5f3] px-3 text-sm text-[#66766e]">
                              নম্বর দেওয়া নেই
                            </span>
                          )}

                          {mapLink && (
                            <a
                              href={mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-h-12 items-center justify-center rounded-xl border border-[#16735d] px-3 py-3 text-sm font-semibold text-[#16735d]"
                            >
                              ম্যাপে খুঁজুন
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <p className="mt-5 rounded-xl bg-[#f7f9f8] p-4 text-sm leading-6 text-[#66766e]">
              যাওয়ার আগে সময়, ফি ও অবস্থান চেম্বারে নিশ্চিত করুন।
              কল করলে অ্যাপয়েন্টমেন্ট নিজে থেকে নিশ্চিত হয় না।
            </p>

            <details className="mt-5 border-t border-[#edf1ee] py-4">
              <summary className="cursor-pointer font-medium">
                আরও তথ্য
              </summary>

              <p className="mt-3 text-sm leading-7">
                BMDC নম্বর: {doctor.bmdcNumber || "তথ্য দেওয়া হয়নি"}
              </p>

              <p className="mt-2 text-sm leading-7 text-[#66766e]">
                সেভ করা তালিকা এই ব্রাউজারেই থাকে।
              </p>

              <Link
                href="/contact"
                className="mt-3 inline-block text-sm text-[#16735d] underline"
              >
                ভুল তথ্য জানান
              </Link>
            </details>
          </>
        ) : null}
      </div>
    </main>
  );
}
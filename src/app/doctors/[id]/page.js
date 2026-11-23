"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DoctorPhoto from "@/components/DoctorPhoto";
import SaveDoctorButton from "@/components/SaveDoctorButton";

function Icon({ type, className = "" }) {
  const paths = {
    location: (
      <>
        <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    fee: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    phone: (
      <path d="m8 3 3 5-3 3a15 15 0 0 0 5 5l3-3 5 3v3a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2h3Z" />
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m9 10 6-4M9 14l6 4" />
      </>
    ),
    work: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M12 11v6M9 14h6" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {paths[type]}
    </svg>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex gap-3 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6f2] text-[#16735d]">
        <Icon type={icon} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-sm text-[#65766f]">{label}</dt>
        <dd className="mt-1 break-words text-base font-medium leading-7">
          {children}
        </dd>
      </div>
    </div>
  );
}

function getPhoneLink(value) {
  const normalized = String(value || "")
    .replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit))
    .replace(/[\s()-]/g, "");

  return /^\+?\d{7,15}$/.test(normalized)
    ? `tel:${normalized}`
    : null;
}

function getMapLink(chamber) {
  if (!chamber.district) return null;

  const address = [
    chamber.name,
    chamber.address,
    chamber.area,
    chamber.district,
    "Bangladesh",
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent([...new Set(address)].join(", "))
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={<p className="p-6 text-[#203c30]">প্রোফাইল আসছে…</p>}
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

  const chambers = Array.isArray(doctor?.chambers)
    ? doctor.chambers.filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-[#f6f9f7] px-4 py-4 text-[#203c30] sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <p role="status" className="py-8 text-[#65766f]">
            প্রোফাইল আসছে…
          </p>
        ) : error ? (
          <section className="rounded-2xl border border-[#e2ebe5] bg-white p-6">
            <h1 className="text-xl font-bold">ডাক্তারের প্রোফাইল</h1>
            <p role="alert" className="mt-3 leading-7">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-5 min-h-12 rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </section>
        ) : doctor ? (
          <>
            <section
              aria-label="ডাক্তারের পরিচয়"
              className="rounded-2xl border border-[#e2ebe5] bg-white p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <DoctorPhoto
                  src={doctor.photoUrl}
                  name={doctor.name}
                  size={56}
                />

                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-xl font-bold leading-snug tracking-tight text-[#203c30] sm:text-2xl">
                    {doctor.name}
                  </h1>

                  {doctor.specialty && (
                    <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#16735d]">
                      {doctor.specialty}
                    </p>
                  )}
                </div>
              </div>

              {doctor.qualifications && (
                <p className="mt-3 break-words text-sm leading-6 text-[#52685c]">
                  {doctor.qualifications}
                </p>
              )}

              {doctor.workplace && (
                <div className="mt-2 flex items-start gap-2 text-[#65766f]">
                  <Icon type="work" className="mt-0.5" />
                  <p className="min-w-0 break-words text-sm leading-6">
                    {doctor.workplace}
                  </p>
                </div>
              )}
            </section>

            <div className="mt-3 flex flex-wrap items-start gap-2">
              <SaveDoctorButton doctorId={id} compact />

              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d7e1db] bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
              >
                <Icon type="share" />
                {sharing ? "অপেক্ষা…" : "শেয়ার করুন"}
              </button>
            </div>

            {shareMessage && (
              <p
                role="status"
                className="mt-3 text-sm leading-6 text-[#16735d]"
              >
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
                  className="mt-2 w-full rounded-xl border border-[#d7e1db] bg-white p-3 text-base"
                />
              </label>
            )}

            <section className="mt-5" aria-labelledby="chambers-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="chambers-heading" className="text-xl font-bold">
                  চেম্বার ও সিরিয়াল
                </h2>

                {chambers.length > 0 && (
                  <span className="rounded-full border border-[#e2ebe5] bg-white px-3 py-1 text-sm text-[#65766f]">
                    {chambers.length.toLocaleString("bn-BD")}টি চেম্বার
                  </span>
                )}
              </div>

              {chambers.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-[#e2ebe5] bg-white p-5 text-[#65766f]">
                  চেম্বারের তথ্য দেওয়া হয়নি।
                </p>
              ) : (
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  {chambers.map((chamber, index) => {
                    const phoneLink = getPhoneLink(chamber.phone);
                    const mapLink = getMapLink(chamber);
                    const location = [chamber.area, chamber.district]
                      .filter(Boolean)
                      .join(", ");
                    const hasFee =
                      chamber.fee !== null &&
                      chamber.fee !== undefined &&
                      chamber.fee !== "";

                    return (
                      <article
                        key={`${id}-${index}`}
                        className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#e2ebe5] bg-white shadow-sm"
                      >
                        <header className="border-b border-[#eaf0ec] px-5 py-5">
                          <p className="mb-2 text-xs font-semibold text-[#16735d]">
                            চেম্বার {(index + 1).toLocaleString("bn-BD")}
                          </p>

                          <h3 className="break-words text-xl font-bold leading-8">
                            {chamber.name || "চেম্বার"}
                          </h3>

                          {location && (
                            <p className="mt-1 break-words text-sm leading-6 text-[#65766f]">
                              {location}
                            </p>
                          )}
                        </header>

                        <dl className="divide-y divide-[#edf2ee] px-5">
                          <InfoRow icon="location" label="ঠিকানা">
                            {chamber.address || location || "জানা নেই"}
                          </InfoRow>

                          <InfoRow icon="clock" label="রোগী দেখার সময়">
                            {chamber.schedule || "জানা নেই"}
                          </InfoRow>

                          <InfoRow icon="fee" label="ভিজিট ফি">
                            {hasFee ? `৳ ${chamber.fee}` : "জানা নেই"}
                          </InfoRow>

                          <InfoRow icon="phone" label="সিরিয়ালের নম্বর">
                            {chamber.phone || "জানা নেই"}
                          </InfoRow>
                        </dl>

                        <div className="mt-auto grid grid-cols-2 gap-3 px-5 pb-5 pt-2">
                          {phoneLink ? (
                            <a
                              href={phoneLink}
                              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#16735d] px-3 py-3 text-sm font-semibold text-white hover:bg-[#115b49]"
                            >
                              <Icon type="phone" />
                              কল করুন
                            </a>
                          ) : (
                            <span className="flex min-h-12 items-center justify-center rounded-xl bg-[#f0f3f1] px-3 text-sm text-[#65766f]">
                              নম্বর দেওয়া নেই
                            </span>
                          )}

                          {mapLink ? (
                            <a
                              href={mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cdddd3] px-3 py-3 text-sm font-semibold text-[#16735d] hover:bg-[#edf6f2]"
                            >
                              <Icon type="location" />
                              ম্যাপে খুঁজুন
                            </a>
                          ) : (
                            <span className="flex min-h-12 items-center justify-center rounded-xl bg-[#f0f3f1] px-3 text-sm text-[#65766f]">
                              ঠিকানা দেওয়া নেই
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <p className="mt-5 px-1 text-sm leading-7 text-[#65766f]">
              যাওয়ার আগে চেম্বারে ফোন করে সময়, ফি ও সিরিয়াল নিশ্চিত করুন।
            </p>

            <details className="mt-6 rounded-2xl border border-[#e2ebe5] bg-white p-5">
              <summary className="cursor-pointer font-semibold">
                আরও তথ্য
              </summary>

              <p className="mt-4 text-sm leading-7">
                BMDC নম্বর: {doctor.bmdcNumber || "জানা নেই"}
              </p>

              <p className="mt-2 text-sm leading-7 text-[#65766f]">
                সেভ করা তালিকা এই ব্রাউজারেই থাকে।
              </p>

              <Link
                href="/contact"
                className="mt-3 inline-block py-2 text-sm font-medium text-[#16735d] underline"
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
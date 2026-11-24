"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { specialties } from "@/lib/specialties";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase-auth";
import DoctorPhotoUploader from "@/components/DoctorPhotoUploader";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";



export default function EditDoctorPage() {
  return (
    <Suspense fallback={<p className="p-8">Edit পেজ আসছে…</p>}>
      <EditDoctorContent />
    </Suspense>
  );
}

function EditDoctorContent() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAllowed(false);
      setDoctor(null);
      setError("");
      setSuccess("");

      if (user?.uid !== ADMIN_UID) {
        setError("আগে Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const snapshot = await getDocFromServer(doc(db, "doctors", id));

        if (!active || auth.currentUser?.uid !== ADMIN_UID) return;

        if (!snapshot.exists() || snapshot.data().status === "trashed") {
          setError("এই ডাক্তারের প্রোফাইল পাওয়া যায়নি।");
          return;
        }

        setDoctor(snapshot.data());
        setAllowed(true);
      } catch (err) {
        if (active) {
          setError(`তথ্য আনা যায়নি। Error: ${err.code || "unknown"}`);
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  async function handleSave(event) {
    event.preventDefault();

    if (saving.current) return;

    setError("");
    setSuccess("");

    if (!allowed || auth.currentUser?.uid !== ADMIN_UID) {
      setError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
      return;
    }

    const data = new FormData(event.currentTarget);
    const text = (key) => String(data.get(key) || "").trim();

    const name = text("name");
    const specialty = text("specialty");

    if (!name || !specialties.includes(specialty)) {
      setError("নাম ও বিশেষজ্ঞতা ঠিকভাবে পূরণ করো।");
      return;
    }

    saving.current = true;
    setBusy(true);

    try {
      await updateDoc(doc(db, "doctors", id), {
        name,
        specialty,
        qualifications: text("qualifications"),
        bmdcNumber: text("bmdcNumber"),
        workplace: text("workplace"),

        // পরিবর্তিত তথ্য আবার যাচাই করে প্রকাশ করতে হবে।
        status: "draft",
        registrationVerified: false,
        updatedAt: serverTimestamp(),
      });

      setSuccess("পরিবর্তন সেভ হয়েছে। প্রোফাইলটি ড্রাফট আছে।");
    } catch (err) {
      setError(`সেভ হয়নি। Error: ${err.code || "unknown"}`);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8">
        <a href="/admin/doctors" className="text-[#16735d] underline">
          ডাক্তারদের তালিকায় ফিরুন
        </a>

        <h1 className="mt-6 text-3xl font-bold">ডাক্তারের তথ্য Edit</h1>

        {loading ? (
          <p role="status" className="mt-6">তথ্য আসছে…</p>
        ) : allowed && doctor ? (
          <form onSubmit={handleSave} className="mt-6">
            <fieldset disabled={busy} className="space-y-5">
              <DoctorPhotoUploader
  doctorId={id}
  initialPhotoUrl={doctor.photoUrl || ""}
  onBusyChange={setBusy}
/>
              <Field
                label="ডাক্তারের নাম *"
                name="name"
                defaultValue={doctor.name || ""}
                required
              />

              <label className="block">
                <span>বিশেষজ্ঞতা *</span>

                <select
                  name="specialty"
                  defaultValue={doctor.specialty || ""}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>নির্বাচন করো</option>

                  {specialties.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <Field
                label="যোগ্যতা"
                name="qualifications"
                defaultValue={doctor.qualifications || ""}
              />

              <Field
                label="BMDC নম্বর"
                name="bmdcNumber"
                defaultValue={doctor.bmdcNumber || ""}
              />

              <Field
                label="কর্মস্থল"
                name="workplace"
                defaultValue={doctor.workplace || ""}
              />

              <p className="rounded-xl bg-[#f3f7f2] p-4 text-sm leading-7">
                পরিবর্তন সেভ করলে প্রোফাইল Draft হবে এবং নিবন্ধনের
                যাচাইয়ের চিহ্ন সরবে। চেম্বারের তথ্য এই ফর্মে বদলাবে না।
              </p>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#16735d] px-5 py-3 text-white disabled:opacity-60"
              >
                {busy ? "সেভ হচ্ছে…" : "পরিবর্তন সেভ করুন"}
              </button>
            </fieldset>
          </form>
        ) : null}

        {error && (
          <p role="alert" className="mt-5 text-red-700">{error}</p>
        )}

        {success && (
          <p role="status" className="mt-5 text-[#16735d]">{success}</p>
        )}
      </section>
    </main>
  );
}

const inputClass =
  "mt-2 block w-full rounded-xl border border-[#b9cbb6] bg-white p-3 text-base text-[#234737] focus:outline-2 focus:outline-[#16735d]";

function Field({ label, name, ...props }) {
  return (
    <label className="block">
      <span>{label}</span>
      <input name={name} maxLength={250} {...props} className={inputClass} />
    </label>
  );
}
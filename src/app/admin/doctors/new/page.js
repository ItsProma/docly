"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { specialties } from "@/lib/specialties";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";

const districtGroups = {
  ঢাকা: [
    "ঢাকা", "ফরিদপুর", "গাজীপুর", "গোপালগঞ্জ", "কিশোরগঞ্জ",
    "মাদারীপুর", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "নারায়ণগঞ্জ",
    "নরসিংদী", "রাজবাড়ী", "শরীয়তপুর", "টাঙ্গাইল",
  ],
  চট্টগ্রাম: [
    "বান্দরবান", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "চট্টগ্রাম",
    "কুমিল্লা", "কক্সবাজার", "ফেনী", "খাগড়াছড়ি",
    "লক্ষ্মীপুর", "নোয়াখালী", "রাঙ্গামাটি",
  ],
  রাজশাহী: [
    "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর",
    "চাঁপাইনবাবগঞ্জ", "পাবনা", "রাজশাহী", "সিরাজগঞ্জ",
  ],
  খুলনা: [
    "বাগেরহাট", "চুয়াডাঙ্গা", "যশোর", "ঝিনাইদহ", "খুলনা",
    "কুষ্টিয়া", "মাগুরা", "মেহেরপুর", "নড়াইল", "সাতক্ষীরা",
  ],
  বরিশাল: [
    "বরগুনা", "বরিশাল", "ভোলা", "ঝালকাঠি", "পটুয়াখালী", "পিরোজপুর",
  ],
  সিলেট: ["হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ", "সিলেট"],
  রংপুর: [
    "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট",
    "নীলফামারী", "পঞ্চগড়", "রংপুর", "ঠাকুরগাঁও",
  ],
  ময়মনসিংহ: ["জামালপুর", "ময়মনসিংহ", "নেত্রকোণা", "শেরপুর"],
};



export default function NewDoctorPage() {
  const [access, setAccess] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAccess(user?.uid === ADMIN_UID ? "allowed" : "denied");
    });
  }, []);

  async function handleSave(event) {
    event.preventDefault();

    if (saving.current) return;

    if (auth.currentUser?.uid !== ADMIN_UID) {
      setError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (key) => String(data.get(key) || "").trim();

    const name = text("name");
    const specialty = text("specialty");
    const district = text("district");
    const chamberName = text("chamberName");
    const area = text("area");
    const feeText = text("fee");

    const division = Object.keys(districtGroups).find((key) =>
      districtGroups[key].includes(district)
    );

    if (
      !name ||
      !chamberName ||
      !area ||
      !division ||
      !specialties.includes(specialty)
    ) {
      setError("নাম, বিশেষজ্ঞতা, জেলা, এলাকা ও চেম্বার পূরণ করো।");
      return;
    }

    const fee = feeText === "" ? null : Number(feeText);

    if (
      fee !== null &&
      (!Number.isFinite(fee) || !Number.isInteger(fee) || fee < 0)
    ) {
      setError("ভিজিট ফি পূর্ণসংখ্যায় দাও অথবা ফাঁকা রাখো।");
      return;
    }

    saving.current = true;
    setBusy(true);
    setError("");

    try {
      const doctor = await addDoc(collection(db, "doctors"), {
        name,
        specialty,
        qualifications: text("qualifications"),
        bmdcNumber: text("bmdcNumber"),
        workplace: text("workplace"),
        divisions: [division],
        districts: [district],
        chambers: [
          {
            name: chamberName,
            division,
            district,
            area,
            address: text("address"),
            schedule: text("schedule"),
            phone: text("phone"),
            fee,
          },
        ],
        status: "draft",
        registrationVerified: false,
        chamberVerified: false,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSavedId(doctor.id);
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
        <a href="/admin" className="text-[#16735d] underline">
          Admin পেজে ফিরুন
        </a>

        <h1 className="mt-6 text-3xl font-bold">ডাক্তার যোগ করুন</h1>

        {access === "checking" ? (
          <p className="mt-6">লগইন পরীক্ষা হচ্ছে…</p>
        ) : access === "denied" ? (
          <p className="mt-6">আগে Admin অ্যাকাউন্ট দিয়ে লগইন করো।</p>
        ) : savedId ? (
          <div className="mt-6" role="status">
            <h2 className="text-xl font-bold">ড্রাফট সেভ হয়েছে।</h2>

            <p className="mt-3">
              তথ্য Firestore-এ যোগ হয়েছে। এটি এখনো প্রকাশিত নয়।
            </p>

            <p className="mt-3 break-all text-sm">
              Document ID: {savedId}
            </p>

            <button
              type="button"
              onClick={() => setSavedId("")}
              className="mt-6 rounded-xl bg-[#16735d] px-5 py-3 text-white"
            >
              আরেকজন ডাক্তার যোগ করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-6">
            <fieldset disabled={busy} className="space-y-5">
              <h2 className="text-xl font-semibold">ডাক্তারের তথ্য</h2>

              <Field label="ডাক্তারের নাম *" name="name" required />

              <label className="block">
                <span>বিশেষজ্ঞতা *</span>
                <select
                  name="specialty"
                  required
                  defaultValue=""
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
                placeholder="যেমন: MBBS, FCPS"
              />

              <Field label="BMDC নম্বর — জানা থাকলে" name="bmdcNumber" />
              <Field label="কর্মস্থল — জানা থাকলে" name="workplace" />

              <h2 className="border-t border-[#dce5d9] pt-6 text-xl font-semibold">
                প্রথম চেম্বার
              </h2>

              <Field label="চেম্বারের নাম *" name="chamberName" required />

              <label className="block">
                <span>চেম্বারের জেলা *</span>
                <select
                  name="district"
                  required
                  defaultValue="সিলেট"
                  className={inputClass}
                >
                  {Object.entries(districtGroups).map(([division, districts]) => (
                    <optgroup key={division} label={`${division} বিভাগ`}>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <Field
                label="উপজেলা / এলাকা *"
                name="area"
                placeholder="যেমন: জিন্দাবাজার"
                required
              />

              <Field label="পূর্ণ ঠিকানা" name="address" />

              <Field
                label="রোগী দেখার দিন ও সময়"
                name="schedule"
                placeholder="যেমন: শনি–বৃহস্পতি, বিকেল ৫টা–রাত ৯টা"
              />

              <Field
                label="চেম্বারের সিরিয়াল নম্বর"
                name="phone"
                type="tel"
              />

              <Field
                label="ভিজিট ফি — জানা না থাকলে ফাঁকা রাখো"
                name="fee"
                type="number"
                min="0"
                step="1"
              />

              <p className="rounded-xl bg-[#f3f7f2] p-4 text-sm leading-7">
                BMDC নম্বর লিখলেই যাচাই করা হয়েছে বলে দেখাবে না।
                প্রোফাইল প্রথমে Draft থাকবে।
              </p>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#16735d] px-5 py-3 text-white disabled:opacity-60"
              >
                {busy ? "সেভ হচ্ছে…" : "ড্রাফট হিসেবে সেভ করুন"}
              </button>
            </fieldset>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-5 text-red-700">
            {error}
          </p>
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
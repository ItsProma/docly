"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

function newChamber() {
  return {
    localKey: crypto.randomUUID(),
    name: "",
    district: "সিলেট",
    area: "",
    address: "",
    schedule: "",
    phone: "",
    fee: "",
  };
}

export default function ChambersPage() {
  return (
    <Suspense fallback={<p className="p-8">চেম্বারের পেজ আসছে…</p>}>
      <ChambersContent />
    </Suspense>
  );
}

function ChambersContent() {
  const { id } = useParams();

  const [name, setName] = useState("");
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAllowed(false);
      setChambers([]);
      setError("");
      setMessage("");

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
          setError("প্রোফাইল পাওয়া যায়নি।");
          return;
        }

        const data = snapshot.data();
        const existing = data.chambers || [];

        setName(data.name || "");
        setChambers(
          existing.length
            ? existing.map((chamber) => ({
                ...chamber,
                localKey: crypto.randomUUID(),
                fee: chamber.fee ?? "",
              }))
            : [newChamber()]
        );
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

  function changeField(key, field, value) {
    setMessage("");
    setChambers((current) =>
      current.map((chamber) =>
        chamber.localKey === key
          ? { ...chamber, [field]: value }
          : chamber
      )
    );
  }

  function removeChamber(key) {
    if (chambers.length <= 1) return;

    if (!window.confirm("এই চেম্বারটি তালিকা থেকে সরাবে? সেভ করার পরে পরিবর্তন কার্যকর হবে।")) {
      return;
    }

    setMessage("");
    setChambers((current) =>
      current.filter((chamber) => chamber.localKey !== key)
    );
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving.current) return;

    setError("");
    setMessage("");

    if (!allowed || auth.currentUser?.uid !== ADMIN_UID) {
      setError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
      return;
    }

    const cleaned = [];

    for (const chamber of chambers) {
      const division = Object.keys(districtGroups).find((group) =>
        districtGroups[group].includes(chamber.district)
      );

      const feeText = String(chamber.fee ?? "").trim();
      const fee = feeText === "" ? null : Number(feeText);

      if (!chamber.name?.trim() || !chamber.area?.trim() || !division) {
        setError("প্রতিটি চেম্বারের নাম, জেলা ও এলাকা পূরণ করো।");
        return;
      }

      if (
        fee !== null &&
        (!Number.isFinite(fee) || !Number.isInteger(fee) || fee < 0)
      ) {
        setError("ভিজিট ফি পূর্ণসংখ্যায় দাও অথবা ফাঁকা রাখো।");
        return;
      }

      const { localKey, ...existingFields } = chamber;

      cleaned.push({
        ...existingFields,
        name: chamber.name.trim(),
        division,
        district: chamber.district,
        area: chamber.area.trim(),
        address: String(chamber.address || "").trim(),
        schedule: String(chamber.schedule || "").trim(),
        phone: String(chamber.phone || "").trim(),
        fee,
      });
    }

    if (!cleaned.length) {
      setError("অন্তত একটি চেম্বার রাখো।");
      return;
    }

    saving.current = true;
    setBusy(true);

    try {
      await updateDoc(doc(db, "doctors", id), {
        chambers: cleaned,
        districts: [...new Set(cleaned.map((chamber) => chamber.district))],
        divisions: [...new Set(cleaned.map((chamber) => chamber.division))],
        status: "draft",
        chamberVerified: false,
        updatedAt: serverTimestamp(),
      });

      setMessage("চেম্বারের তথ্য সেভ হয়েছে। প্রোফাইল ড্রাফট আছে।");
    } catch (err) {
      setError(`সেভ হয়নি। Error: ${err.code || "unknown"}`);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <section className="mx-auto max-w-2xl">
        <a href="/admin/doctors" className="text-[#16735d] underline">
          ডাক্তারদের তালিকায় ফিরুন
        </a>

        <h1 className="mt-6 text-3xl font-bold">চেম্বার পরিচালনা</h1>
        {allowed && <p className="mt-3">{name}</p>}

        {loading ? (
          <p role="status" className="mt-6">তথ্য আসছে…</p>
        ) : allowed ? (
          <form onSubmit={handleSave} className="mt-6">
            <fieldset disabled={busy} className="space-y-5">
              {chambers.map((chamber, index) => (
                <section
                  key={chamber.localKey}
                  className="space-y-5 rounded-2xl border border-[#dce5d9] bg-white p-6"
                >
                  <h2 className="text-xl font-semibold">
                    চেম্বার {index + 1}
                  </h2>

                  {[
                    ["name", "চেম্বারের নাম *"],
                    ["area", "উপজেলা / এলাকা *"],
                    ["address", "পূর্ণ ঠিকানা"],
                    ["schedule", "রোগী দেখার দিন ও সময়"],
                    ["phone", "সিরিয়ালের ফোন নম্বর"],
                    ["fee", "ভিজিট ফি — জানা না থাকলে ফাঁকা"],
                  ].map(([field, label]) => (
                    <label key={field} className="block">
                      <span>{label}</span>
                      <input
                        type={
                          field === "fee"
                            ? "number"
                            : field === "phone"
                            ? "tel"
                            : "text"
                        }
                        min={field === "fee" ? 0 : undefined}
                        step={field === "fee" ? 1 : undefined}
                        required={field === "name" || field === "area"}
                        maxLength={250}
                        value={chamber[field] ?? ""}
                        onChange={(event) =>
                          changeField(chamber.localKey, field, event.target.value)
                        }
                        className={inputClass}
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span>জেলা *</span>

                    <select
                      required
                      value={chamber.district}
                      onChange={(event) =>
                        changeField(chamber.localKey, "district", event.target.value)
                      }
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

                  {chambers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChamber(chamber.localKey)}
                      className="text-red-700 underline"
                    >
                      এই চেম্বার সরান
                    </button>
                  )}
                </section>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setChambers((current) => [...current, newChamber()]);
                }}
                className="rounded-xl border border-[#16735d] bg-white px-5 py-3"
              >
                আরেকটি চেম্বার যোগ করুন
              </button>

              <p className="text-sm leading-7">
                সেভ করলে প্রোফাইল Draft হবে এবং চেম্বারের যাচাইয়ের
                চিহ্ন সরবে। যাচাইয়ের পর আবার Publish করতে হবে।
              </p>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#16735d] px-5 py-3 text-white disabled:opacity-60"
              >
                {busy ? "সেভ হচ্ছে…" : "চেম্বারের পরিবর্তন সেভ করুন"}
              </button>
            </fieldset>
          </form>
        ) : null}

        {error && (
          <p role="alert" className="mt-5 text-red-700">{error}</p>
        )}

        {message && (
          <p role="status" className="mt-5 text-[#16735d]">{message}</p>
        )}
      </section>
    </main>
  );
}

const inputClass =
  "mt-2 block w-full rounded-xl border border-[#b9cbb6] bg-white p-3 text-base text-[#234737] focus:outline-2 focus:outline-[#16735d]";
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "docly-saved-doctors";
const CHANGE_EVENT = "docly-saved-change";

function readSavedIds() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) return [];

  const value = JSON.parse(raw);

  if (
    !Array.isArray(value) ||
    !value.every((id) => typeof id === "string")
  ) {
    throw new Error("Invalid saved list");
  }

  return [...new Set(value)];
}

export default function SaveDoctorButton({ doctorId, compact = false }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function refreshSavedState() {
      try {
        setSaved(readSavedIds().includes(doctorId));
        setReady(true);
        setError("");
      } catch {
        setReady(false);
        setError("এই ব্রাউজারে সেভ করা তালিকা পড়া যাচ্ছে না।");
      }
    }

    function handleStorage(event) {
      if (event.key === STORAGE_KEY || event.key === null) {
        refreshSavedState();
      }
    }

    refreshSavedState();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHANGE_EVENT, refreshSavedState);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CHANGE_EVENT, refreshSavedState);
    };
  }, [doctorId]);

  function toggleSaved() {
    try {
      const ids = readSavedIds();

      const nextIds = ids.includes(doctorId)
        ? ids.filter((id) => id !== doctorId)
        : [...ids, doctorId];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));

      setSaved(nextIds.includes(doctorId));
      setError("");

      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      setError("পরিবর্তন সেভ হয়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।");
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={!ready}
        aria-pressed={saved}
        onClick={toggleSaved}
        className={`rounded-xl border px-5 py-3 disabled:opacity-60 ${
          saved
            ? "border-[#16735d] bg-[#16735d] text-white"
            : "border-[#16735d] bg-white text-[#16735d]"
        }`}
      >
        {!ready
  ? "অপেক্ষা…"
  : saved
  ? compact ? "সেভ করা আছে" : "সেভ করা আছে — সরান"
  : compact ? "সেভ করুন" : "ডাক্তার সেভ করুন"}
      </button>

      {!compact && (
  <p className="mt-2 text-sm">
    এই ব্রাউজারে সেভ থাকবে। ব্রাউজারের তথ্য মুছলে তালিকাও মুছে যাবে।
  </p>
)}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  doc,
  getDocFromServer,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { auth } from "@/lib/firebase-auth";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";
const MAX_BYTES = 2 * 1024 * 1024;

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function DoctorPhotoUploader({
  doctorId,
  initialPhotoUrl = "",
  onBusyChange,
}) {
  const [file, setFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);
  const locked = useRef(false);

  function chooseFile(event) {
    const selected = event.target.files?.[0];

    setFile(null);
    setError("");
    setMessage("");

    if (!selected) return;

    if (!imageTypes[selected.type]) {
      setError("শুধু JPEG, PNG বা WebP ছবি নির্বাচন করো।");
      event.target.value = "";
      return;
    }

    if (selected.size === 0 || selected.size > MAX_BYTES) {
      setError("ছবির আকার ০-এর বেশি এবং সর্বোচ্চ ২ MB হতে হবে।");
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  async function handleUpload() {
    if (!file || locked.current) return;

    setError("");
    setMessage("");

    if (auth.currentUser?.uid !== ADMIN_UID) {
      setError("Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
      return;
    }

    locked.current = true;
    setUploading(true);
    onBusyChange?.(true);

    let uploadedRef = null;
    let committed = false;

    try {
      const doctorRef = doc(db, "doctors", doctorId);
      const existing = await getDocFromServer(doctorRef);

      if (
        !existing.exists() ||
        existing.data().status === "trashed"
      ) {
        throw new Error("এই প্রোফাইলে এখন ছবি যোগ করা যাবে না।");
      }

      const extension = imageTypes[file.type];
      const path =
        `doctorPhotos/${doctorId}/${crypto.randomUUID()}.${extension}`;

      uploadedRef = ref(storage, path);

      await uploadBytes(uploadedRef, file, {
        contentType: file.type,
      });

      const downloadUrl = await getDownloadURL(uploadedRef);

      const previousPath = await runTransaction(db, async (transaction) => {
        const current = await transaction.get(doctorRef);

        if (
          !current.exists() ||
          current.data().status === "trashed"
        ) {
          throw new Error("প্রোফাইল পাওয়া যায়নি অথবা ট্র্যাশে আছে।");
        }

        const oldPath = current.data().photoPath || "";

        transaction.update(doctorRef, {
          photoUrl: downloadUrl,
          photoPath: path,
          status: "draft",
          updatedAt: serverTimestamp(),
        });

        return oldPath;
      });

      committed = true;
      setPhotoUrl(downloadUrl);
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setMessage("ছবি সেভ হয়েছে। প্রোফাইল এখন Draft আছে।");

      if (
        typeof previousPath === "string" &&
        previousPath.startsWith(`doctorPhotos/${doctorId}/`) &&
        previousPath !== path
      ) {
        try {
          await deleteObject(ref(storage, previousPath));
        } catch (cleanupError) {
          console.warn("Old photo cleanup failed", cleanupError);
        }
      }
    } catch (err) {
      if (uploadedRef && !committed) {
        try {
          await deleteObject(uploadedRef);
        } catch (cleanupError) {
          console.warn("Upload cleanup failed", cleanupError);
        }
      }

      setError(
        err.code
          ? `ছবি সেভ হয়নি। Error: ${err.code}`
          : err.message || "ছবি সেভ হয়নি। আবার চেষ্টা করো।"
      );
    } finally {
      locked.current = false;
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#dce5d9] bg-[#f3f7f2] p-5">
      <h2 className="text-xl font-semibold">ডাক্তারের ছবি</h2>

      {photoUrl && (
        <Image
          src={photoUrl}
          alt="ডাক্তারের বর্তমান ছবি"
          width={128}
          height={128}
          unoptimized
          className="mt-4 h-32 w-32 rounded-2xl object-cover"
        />
      )}

      <label className="mt-4 block">
        <span>JPEG, PNG বা WebP — সর্বোচ্চ ২ MB</span>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={chooseFile}
          disabled={uploading}
          className="mt-3 block w-full text-sm"
        />
      </label>

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-4 rounded-xl bg-[#16735d] px-5 py-3 text-white disabled:opacity-50"
      >
        {uploading ? "ছবি আপলোড হচ্ছে…" : "ছবি আপলোড ও সেভ করুন"}
      </button>

      <p className="mt-3 text-sm leading-7">
        শুধু প্রকাশযোগ্য ছবি আপলোড করুন। ছবি পরিবর্তনের পরে
        প্রোফাইল আবার Publish করতে হবে।
      </p>

      {error && (
        <p role="alert" className="mt-3 text-red-700">{error}</p>
      )}

      {message && (
        <p role="status" className="mt-3 text-[#16735d]">{message}</p>
      )}
    </section>
  );
}
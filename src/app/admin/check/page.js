"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocsFromServer,
  limit,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase-auth";

const ADMIN_UID = "t40iJNgKPdVcppcEqZJk4BoUbL02";

export default function CheckPage() {
  const [message, setMessage] = useState("লগইন পরীক্ষা হচ্ছে…");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user || user.uid !== ADMIN_UID) {
        setMessage("আগে Admin অ্যাকাউন্ট দিয়ে লগইন করো।");
        return;
      }

      setMessage("Firestore সংযোগ পরীক্ষা হচ্ছে…");

      try {
        const doctorsQuery = query(
          collection(db, "doctors"),
          limit(1)
        );

        await getDocsFromServer(doctorsQuery);

        if (active) {
          setMessage("Firestore সংযোগ সফল হয়েছে।");
        }
      } catch (error) {
        if (active) {
          setMessage(`সংযোগ হয়নি। Error: ${error.code || "unknown"}`);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background: "#f3f7f2",
        color: "#234737",
      }}
    >
      <section
        style={{
          maxWidth: 500,
          margin: "0 auto",
          padding: 28,
          background: "white",
          borderRadius: 20,
          border: "1px solid #dce5d9",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>
          Docly — Database Check
        </h1>

        <p role="status" style={{ marginTop: 20 }}>
          {message}
        </p>

        <a
          href="/admin"
          style={{
            display: "inline-block",
            marginTop: 24,
            color: "#16735d",
            textDecoration: "underline",
          }}
        >
          Admin পেজে ফিরুন
        </a>
      </section>
    </main>
  );
}
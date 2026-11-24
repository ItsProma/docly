import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const snapshot = await getDocFromServer(doc(db, "doctors", id));

    if (!snapshot.exists()) {
      return {
        title: "ডাক্তারের প্রোফাইল পাওয়া যায়নি",
        robots: { index: false, follow: false },
      };
    }

    const doctor = snapshot.data();

    if (doctor.status !== "published") {
      return {
        title: "ডাক্তারের প্রোফাইল পাওয়া যায়নি",
        robots: { index: false, follow: false },
      };
    }

    const chamber = Array.isArray(doctor.chambers)
      ? doctor.chambers.find((item) => item?.district)
      : null;

    const district = chamber?.district || "Bangladesh";
    const name = doctor.name || "Doctor";
    const specialty = doctor.specialty || "ডাক্তার";

    return {
      title: `${name} | ${specialty} | ${district}`,
description: `${name}. বিশেষজ্ঞতা: ${specialty}। জেলা: ${district}, বাংলাদেশ। যোগ্যতা, চেম্বারের ঠিকানা, রোগী দেখার সময় ও সিরিয়ালের তথ্য Docly-তে দেখুন।`,
    };
  } catch (error) {
    console.error("Doctor metadata could not be loaded:", error);
    return { title: "Doctor profile | Docly" };
  }
}

export default function DoctorProfileLayout({ children }) {
  return children;
}
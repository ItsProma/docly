import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const siteUrl = "https://docly.debcreatives.net";

const staticPages = ["", "/about", "/contact", "/privacy"].map((path) => ({
  url: `${siteUrl}${path}`,
}));

export default async function sitemap() {
  const doctorsQuery = query(
    collection(db, "doctors"),
    where("status", "==", "published")
  );

  const doctorsSnapshot = await getDocs(doctorsQuery);

  const doctorPages = doctorsSnapshot.docs.map((doctor) => ({
    url: `${siteUrl}/doctors/${doctor.id}`,
  }));

  return [...staticPages, ...doctorPages];
}
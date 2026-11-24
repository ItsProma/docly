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

  const publishedDoctors = doctorsSnapshot.docs.map((doctor) => ({
    id: doctor.id,
    ...doctor.data(),
  }));

  const doctorPages = publishedDoctors.map((doctor) => ({
    url: `${siteUrl}/doctors/${doctor.id}`,
  }));

  const districts = [
    ...new Set(
      publishedDoctors.flatMap((doctor) =>
        Array.isArray(doctor.chambers)
          ? doctor.chambers
              .map((chamber) => chamber?.district?.trim())
              .filter(Boolean)
          : []
      )
    ),
  ];

  const districtPages = districts.map((district) => ({
    url: `${siteUrl}/district/${encodeURIComponent(district)}`,
  }));

  return [...staticPages, ...doctorPages, ...districtPages];
}
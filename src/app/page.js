import {
  collection,
  getDocsFromServer,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import HomePageClient from "./HomePageClient";

export const instant = false;

export default async function HomePage() {
  const initialDistrict = "সিলেট";

  const doctorsQuery = query(
    collection(db, "doctors"),
    where("status", "==", "published"),
    where("districts", "array-contains", initialDistrict),
    limit(50)
  );

  const snapshot = await getDocsFromServer(doctorsQuery);

  const initialDoctors = snapshot.docs.map((document) => {
    const doctor = document.data();

    return {
      id: document.id,
      name: doctor.name ?? "",
      specialty: doctor.specialty ?? "",
      qualifications: doctor.qualifications ?? "",
      photoUrl: doctor.photoUrl ?? "",
      chambers: Array.isArray(doctor.chambers)
        ? doctor.chambers.map((chamber) => ({
            district: chamber.district ?? "",
            name: chamber.name ?? "",
            area: chamber.area ?? "",
          }))
        : [],
    };
  });

  return <HomePageClient initialDoctors={initialDoctors} />;
}
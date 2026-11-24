import Link from "next/link";
import { notFound } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
export const instant = false;

async function getDistrictDoctors(district) {
  const doctorsQuery = query(
    collection(db, "doctors"),
    where("status", "==", "published")
  );

  const snapshot = await getDocs(doctorsQuery);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .map((doctor) => ({
      ...doctor,
      districtChambers: Array.isArray(doctor.chambers)
        ? doctor.chambers.filter(
            (chamber) => chamber?.district === district
          )
        : [],
    }))
    .filter((doctor) => doctor.districtChambers.length > 0);
}

async function getDistrict(params) {
  const { slug } = await params;
  return decodeURIComponent(slug);
}

export async function generateMetadata({ params }) {
  const district = await getDistrict(params);
  const doctors = await getDistrictDoctors(district);

  return {
    title: `${district} জেলার ডাক্তার ও বিশেষজ্ঞ`,
    description: `${district} জেলার ডাক্তারদের বিশেষজ্ঞতা, চেম্বারের ঠিকানা ও রোগী দেখার সময় Docly-তে খুঁজুন।`,
    robots: doctors.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function DistrictDoctorsPage({ params }) {
  const district = await getDistrict(params);
  const doctors = await getDistrictDoctors(district);

  if (doctors.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f6f9f7] px-4 py-6 text-[#203c30]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">
          {district} জেলার ডাক্তার ও বিশেষজ্ঞ
        </h1>

        <p className="mt-2 text-[#65766f]">
          এই জেলায় {doctors.length.toLocaleString("bn-BD")} জন প্রকাশিত ডাক্তারের
          তথ্য পাওয়া গেছে।
        </p>

        <div className="mt-5 grid gap-4">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="rounded-2xl border border-[#e2ebe5] bg-white p-5"
            >
              <h2 className="text-lg font-bold">{doctor.name}</h2>

              {doctor.specialty && (
                <p className="mt-1 text-[#16735d]">{doctor.specialty}</p>
              )}

              {doctor.qualifications && (
                <p className="mt-2 text-sm text-[#65766f]">
                  {doctor.qualifications}
                </p>
              )}

              <div className="mt-3 space-y-2">
                {doctor.districtChambers.map((chamber, index) => (
                  <p key={`${doctor.id}-${index}`} className="text-sm leading-6">
                    <strong>{chamber.name || "চেম্বার"}</strong>
                    {chamber.address ? ` — ${chamber.address}` : ""}
                    {chamber.schedule ? ` | সময়: ${chamber.schedule}` : ""}
                  </p>
                ))}
              </div>

              <Link
                href={`/doctors/${doctor.id}`}
                className="mt-4 inline-block rounded-xl bg-[#16735d] px-4 py-3 text-sm font-semibold text-white"
              >
                সম্পূর্ণ প্রোফাইল দেখুন
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
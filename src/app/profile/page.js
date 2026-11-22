import Link from "next/link";

export const metadata = {
  title: "প্রোফাইল | Docly",
};

const links = [
  {
    href: "/saved",
    title: "সেভ করা ডাক্তার",
    description: "পছন্দের ডাক্তারদের তালিকা",
  },
  {
    href: "/about",
    title: "Docly সম্পর্কে",
    description: "আমাদের সেবা সম্পর্কে জানুন",
  },
  {
    href: "/contact",
    title: "যোগাযোগ ও তথ্য সংশোধন",
    description: "প্রশ্ন বা ভুল তথ্য জানান",
  },
  {
    href: "/privacy",
    title: "গোপনীয়তা নীতি",
    description: "তথ্য কীভাবে ব্যবহার হয়",
  },
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#f7f9f8] px-5 py-6 text-[#203c30]">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">প্রোফাইল</h1>

        <section className="mt-5 rounded-2xl border border-[#e4eae7] bg-white p-5">
          <h2 className="text-lg font-semibold">স্বাগতম Docly-তে</h2>

          <p className="mt-2 leading-7 text-[#66766e]">
            ডাক্তার খোঁজা ও সেভ করার জন্য লগইন প্রয়োজন নেই।
          </p>
        </section>

        <section
          aria-label="প্রোফাইল মেনু"
          className="mt-5 overflow-hidden rounded-2xl border border-[#e4eae7] bg-white"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-[#edf1ee] p-5 last:border-b-0 hover:bg-[#f2f7f4]"
            >
              <h2 className="font-semibold">{item.title}</h2>

              <p className="mt-1 text-sm text-[#66766e]">
                {item.description}
              </p>
            </Link>
          ))}
        </section>

        <p className="mt-6 text-center text-sm text-[#66766e]">
          Docly · Deb Creatives
        </p>
      </div>
    </main>
  );
}
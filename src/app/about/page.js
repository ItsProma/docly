export const metadata = {
  title: "আমাদের সম্পর্কে | Docly",
  description:
    "Docly-তে বাংলাদেশের বিভিন্ন জেলার ডাক্তার ও চেম্বারের তথ্য খুঁজুন।",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <article className="mx-auto max-w-2xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8">
        <a href="/" className="text-[#16735d] underline">
          হোমে ফিরুন
        </a>

        <h1 className="mt-6 text-3xl font-bold">Docly সম্পর্কে</h1>

        <p className="mt-5 leading-8">
          Docly হলো Deb Creatives-এর ডাক্তার খোঁজার ওয়েবসাইট।
          এখানে জেলা ও বিশেষজ্ঞতা অনুযায়ী ডাক্তার এবং তাঁদের
          চেম্বারের তথ্য খুঁজে পাওয়া যায়।
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-bold">যেসব তথ্য পাবেন</h2>

          <ul className="mt-4 list-disc space-y-3 pl-6 leading-7">
            <li>ডাক্তারের নাম, বিশেষজ্ঞতা ও যোগ্যতা</li>
            <li>চেম্বারের ঠিকানা ও রোগী দেখার সময়</li>
            <li>তথ্য দেওয়া থাকলে ভিজিট ফি ও সিরিয়ালের নম্বর</li>
            <li>একজন ডাক্তারের একাধিক চেম্বারের তথ্য</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">সব জেলার ব্যবস্থা</h2>

          <p className="mt-4 leading-8">
            বাংলাদেশের ৬৪টি জেলা নির্বাচন করা যায়।
            ডাক্তারদের তথ্য ধাপে ধাপে যোগ করা হচ্ছে।
            কোনো জেলায় তথ্য না থাকলে তার অর্থ সেখানে ডাক্তার নেই নয়।
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">তথ্যের ব্যবহার</h2>

          <p className="mt-4 leading-8">
            চেম্বারের ঠিকানা, সময় ও ফি পরিবর্তন হতে পারে।
            যাওয়ার আগে সংশ্লিষ্ট চেম্বারে যোগাযোগ করে নিশ্চিত করুন।
            প্রোফাইলে তথ্য থাকা মানেই সব তথ্য স্বাধীনভাবে যাচাই
            করা হয়েছে—এমন নয়।
          </p>

          <p className="mt-4 leading-8">
            Docly চিকিৎসা পরামর্শ দেয় না এবং অনলাইন অ্যাপয়েন্টমেন্ট
            নিশ্চিত করে না। সিরিয়ালের জন্য সংশ্লিষ্ট চেম্বারে
            যোগাযোগ করতে হবে।
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-[#f3f7f2] p-5">
          <h2 className="text-xl font-bold">ভুল তথ্য দেখেছেন?</h2>

          <p className="mt-3 leading-8">
            ডাক্তারের নাম, প্রোফাইলের লিংক এবং সংশোধনের তথ্য দিয়ে
            আমাদের জানাতে পারেন।
          </p>

          <a
            href="/contact"
            className="mt-4 inline-block text-[#16735d] underline"
          >
            যোগাযোগ ও তথ্য সংশোধন
          </a>
        </section>
      </article>
    </main>
  );
}
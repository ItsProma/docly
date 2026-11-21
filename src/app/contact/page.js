export const metadata = {
  title: "যোগাযোগ | Docly",
  description: "Docly-তে যোগাযোগ ও ডাক্তারের তথ্য সংশোধনের অনুরোধ জানান।",
};

const email = "docly830@gmail.com";

const correctionLink =
  `mailto:${email}?subject=` +
  encodeURIComponent("Docly — তথ্য সংশোধনের অনুরোধ") +
  "&body=" +
  encodeURIComponent(
    "ডাক্তারের নাম:\n\n" +
    "Docly প্রোফাইলের লিংক:\n\n" +
    "কোন তথ্যটি ভুল:\n\n" +
    "সঠিক তথ্য:\n\n" +
    "যাচাইয়ের উৎস বা চেম্বারের যোগাযোগ:\n"
  );

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f2] px-5 py-10 text-[#234737]">
      <article className="mx-auto max-w-2xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8">
        <a href="/" className="text-[#16735d] underline">
          হোমে ফিরুন
        </a>

        <h1 className="mt-6 text-3xl font-bold">যোগাযোগ করুন</h1>

        <p className="mt-5 leading-8">
          Docly সম্পর্কে প্রশ্ন, পরামর্শ অথবা ডাক্তারের তথ্য
          সংশোধনের অনুরোধ ইমেইলে জানাতে পারেন।
        </p>

        <a
          href={`mailto:${email}`}
          className="mt-5 inline-block break-all text-lg font-semibold text-[#16735d] underline"
        >
          {email}
        </a>

        <section className="mt-8 border-t border-[#dce5d9] pt-6">
          <h2 className="text-xl font-bold">ভুল তথ্য জানান</h2>

          <p className="mt-4 leading-8">
            অনুরোধে ডাক্তারের নাম, Docly প্রোফাইলের লিংক,
            ভুল তথ্য ও সঠিক তথ্য লিখুন। সম্ভব হলে যাচাইয়ের
            উৎস বা চেম্বারের যোগাযোগ দিন।
          </p>

          <a
            href={correctionLink}
            className="mt-5 inline-block rounded-xl bg-[#16735d] px-5 py-3 text-white"
          >
            সংশোধনের ইমেইল লিখুন
          </a>

          <p className="mt-3 text-sm leading-7">
            বাটন চাপলে আপনার ইমেইল অ্যাপ খুলবে।
            সেখানে লেখা যাচাই করে নিজে Send করবেন।
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-[#f3f7f2] p-5">
          <h2 className="text-lg font-semibold">কোন তথ্য পাঠাবেন</h2>

          <p className="mt-3 leading-8">
            এখানে রোগীর রিপোর্ট, প্রেসক্রিপশন, পাসওয়ার্ড বা
            ব্যক্তিগত চিকিৎসার তথ্য পাঠাবেন না। এই যোগাযোগ
            চিকিৎসা পরামর্শ, জরুরি সহায়তা বা সিরিয়াল বুকিংয়ের জন্য নয়।
          </p>
        </section>
      </article>
    </main>
  );
}
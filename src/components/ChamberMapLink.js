export default function ChamberMapLink({ chamber }) {
  const parts = [
    chamber.name,
    chamber.address,
    chamber.area,
    chamber.district,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  if (!chamber.district || parts.length < 2) return null;

  const searchText = [...new Set(parts), "Bangladesh"].join(", ");

  const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(searchText);

  return (
    <div className="mt-4">
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-xl border border-[#16735d] bg-white px-5 py-3 text-[#16735d]"
      >
        ম্যাপে খুঁজুন
      </a>

      <p className="mt-2 text-sm leading-6">
        Google Maps-এ ঠিকানা খুঁজবে। যাওয়ার আগে চেম্বারের
        সঙ্গে অবস্থান মিলিয়ে নিন।
      </p>
    </div>
  );
}
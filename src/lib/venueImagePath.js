import hallsData from "@/data/halls.json";

const PLACEHOLDER_HALL_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";

export function getPublicVenueDocId(venueObj) {
  if (!venueObj) return null;

  const name = venueObj.hall_name ? venueObj.hall_name.toLowerCase() : "";
  if (venueObj.hall_id === "1" || name.includes("zaydan banquet hall")) {
    return "zaydan-banquet-hall";
  }
  if (venueObj.hall_id === "2" || name.includes("qasar e zaydan")) {
    return "qasar-e-zaydan";
  }

  return (
    venueObj.hall_id?.toString() ||
    venueObj.hall_name?.toLowerCase().trim().replace(/\s+/g, "-")
  );
}

/** Same path logic as marketplace HallCard / user dashboard */
export function buildVenueImagePath(hall) {
  const firstImage = hall?.images?.[0] || PLACEHOLDER_HALL_IMAGE;
  if (firstImage && !firstImage.includes("placeholder") && !firstImage.startsWith("http")) {
    return firstImage.replace("/Marriage Hall/", "/Marriage_hall/");
  }
  if (firstImage && (firstImage.startsWith("http") || firstImage.startsWith("/"))) {
    return firstImage.replace("/Marriage Hall/", "/Marriage_hall/");
  }

  const normalizedName = hall?.hall_name ? hall.hall_name.toLowerCase().trim() : "";
  return normalizedName
    ? `/Marriage_hall/${normalizedName}/1.jpeg`
    : PLACEHOLDER_HALL_IMAGE;
}

function primaryImageFromFirestore(dbData) {
  const images = dbData?.images || [];
  const primary = images.find((img) => img?.isPrimary);
  const picked = primary || images[0];
  if (typeof picked === "string") return picked;
  return picked?.url || null;
}

/**
 * Resolve thumbnail URL for admin / marketplace (halls.json + Firestore).
 * @param {string} slug - venues/{slug} doc id
 * @param {object} [firestoreData]
 */
export function resolveVenueImageUrl(slug, firestoreData = {}) {
  const profile = firestoreData.profile || {};
  const hallName =
    profile.hall_name || firestoreData.hallName || firestoreData.name || slug.replace(/-/g, " ");

  const jsonHall = hallsData.find((h) => getPublicVenueDocId(h) === slug);

  const firestoreUrl = primaryImageFromFirestore(firestoreData);
  const jsonImages = jsonHall?.images || [];

  const images = firestoreUrl
    ? [firestoreUrl, ...jsonImages]
    : jsonImages.length > 0
      ? jsonImages
      : [];

  return buildVenueImagePath({
    hall_name: hallName,
    images,
    hall_id: slug,
  });
}

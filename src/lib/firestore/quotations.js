import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";

const QUOTATIONS_COLLECTION = "quotations";
const INITIAL_STATUS = "pending_vendor_approval";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates storefront quotation payload before persistence.
 * @param {object} payload
 * @throws {Error}
 */
function assertCustomerQuotationPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("submitCustomerQuotation: payload must be a non-null object.");
  }

  const requiredStringFields = [
    ["userId", payload.userId],
    ["customerName", payload.customerName],
    ["targetVenueId", payload.targetVenueId],
    ["eventDate", payload.eventDate],
  ];

  for (const [field, value] of requiredStringFields) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`submitCustomerQuotation: "${field}" is required and must be a non-empty string.`);
    }
  }

  if (!DATE_PATTERN.test(payload.eventDate.trim())) {
    throw new Error('submitCustomerQuotation: "eventDate" must be formatted as YYYY-MM-DD.');
  }

  const guestCount = Number(payload.guestCount);
  if (!Number.isFinite(guestCount) || guestCount < 1) {
    throw new Error('submitCustomerQuotation: "guestCount" must be a positive number.');
  }

  if (payload.selectedMenu === undefined || payload.selectedMenu === null) {
    throw new Error('submitCustomerQuotation: "selectedMenu" is required.');
  }
}

/**
 * Storefront Event Generator — persists a customer quotation request.
 * Writes to root collection `quotations` with an auto-generated document ID.
 *
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.customerName
 * @param {string} payload.targetVenueId - Venue slug (e.g. "zaydan-banquet-hall")
 * @param {string} payload.eventDate - YYYY-MM-DD
 * @param {number|string} payload.guestCount
 * @param {*} payload.selectedMenu
 * @returns {Promise<{ quotationId: string }>}
 */
export async function submitCustomerQuotation(payload) {
  try {
    assertCustomerQuotationPayload(payload);

    const quotationsRef = collection(db, QUOTATIONS_COLLECTION);
    const docRef = doc(quotationsRef);

    const quotationRecord = {
      quotationId: docRef.id,
      userId: payload.userId.trim(),
      customerName: payload.customerName.trim(),
      targetVenueId: payload.targetVenueId.trim(),
      eventDate: payload.eventDate.trim(),
      guestCount: Number(payload.guestCount),
      selectedMenu: payload.selectedMenu,
      status: INITIAL_STATUS,
      timestamp: serverTimestamp(),
    };

    await setDoc(docRef, quotationRecord);

    return { quotationId: docRef.id };
  } catch (error) {
    console.error("[submitCustomerQuotation] Failed to persist quotation:", error);
    throw error;
  }
}

/**
 * ERP Dashboard real-time listener — streams pending quotations for a vendor venue slug.
 *
 * Compound query:
 *   where("targetVenueId", "==", vendorSlug)
 *   AND where("status", "==", "pending_vendor_approval")
 *
 * Requires a Firestore composite index on (targetVenueId ASC, status ASC).
 *
 * @param {string} vendorSlug - Venue document ID slug (e.g. "zaydan-banquet-hall")
 * @param {(quotations: Array<{ id: string } & object>) => void} callback
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function — call on component unmount.
 */
export function listenToIncomingQuotations(vendorSlug, callback, onError) {
  if (typeof vendorSlug !== "string" || !vendorSlug.trim()) {
    const error = new Error(
      'listenToIncomingQuotations: "vendorSlug" is required and must be a non-empty string.'
    );
    console.error("[listenToIncomingQuotations]", error);
    if (typeof onError === "function") onError(error);
    return () => {};
  }

  if (typeof callback !== "function") {
    throw new Error('listenToIncomingQuotations: "callback" must be a function.');
  }

  try {
    const quotationsRef = collection(db, QUOTATIONS_COLLECTION);
    const incomingQuery = query(
      quotationsRef,
      where("targetVenueId", "==", vendorSlug.trim()),
      where("status", "==", INITIAL_STATUS)
    );

    const unsubscribe = onSnapshot(
      incomingQuery,
      (querySnapshot) => {
        const quotations = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        callback(quotations);
      },
      (error) => {
        console.error("[listenToIncomingQuotations] Snapshot listener error:", error);
        if (typeof onError === "function") {
          onError(error);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("[listenToIncomingQuotations] Failed to attach listener:", error);
    if (typeof onError === "function") {
      onError(error);
    }
    return () => {};
  }
}

/**
 * Normalizes a Firestore quotation document into the bookings table row shape.
 * @param {{ id: string } & object} quotation
 * @returns {object}
 */
export function mapQuotationToBookingRow(quotation) {
  const menu = quotation.selectedMenu;
  const packageName =
    typeof menu === "object"
      ? menu?.packageName || menu?.name || "Quotation Request"
      : String(menu ?? "Quotation Request");
  const perPlatePrice =
    typeof menu === "object" ? Number(menu?.perPlatePrice) || 0 : 0;
  const guestCount = Number(quotation.guestCount) || 0;
  const estimatedAmount = perPlatePrice > 0 ? perPlatePrice * guestCount : 0;

  return {
    docId: quotation.id,
    id: quotation.quotationId || quotation.id,
    customer: {
      name: quotation.customerName || "Customer",
      email: "Storefront Quotation",
      avatar: null,
    },
    service: packageName,
    bookedDate: "Today",
    eventDate: quotation.eventDate || "",
    timing: "",
    status: "Quote Request",
    source: "Online Portal",
    amount: estimatedAmount,
    isQuotation: true,
    raw: {
      quotationId: quotation.quotationId || quotation.id,
      userId: quotation.userId,
      targetVenueId: quotation.targetVenueId,
      firestoreStatus: quotation.status,
      eventDetails: { guests: guestCount, date: quotation.eventDate },
      catering: {
        packageName,
        packageId: typeof menu === "object" ? menu?.packageId : undefined,
        perPlatePrice,
        dishes: typeof menu === "object" ? menu?.dishes || [] : [],
      },
      selectedMenu: menu,
    },
  };
}

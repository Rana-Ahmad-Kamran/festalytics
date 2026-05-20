import { NextResponse } from "next/server";
import {
  getSheetsAccessToken,
  getZaydanSpreadsheetId,
  resolveSheetTabName,
} from "@/lib/google/sheetsAuth";

function tabRange(tabName, a1) {
  return `'${tabName.replace(/'/g, "''")}'!${a1}`;
}

// GET: Fetch all bookings from Google Sheets and return them in the structure the UI expects
export async function GET() {
  try {
    const sheetId = getZaydanSpreadsheetId();
    const accessToken = await getSheetsAccessToken();
    const tabName = await resolveSheetTabName(sheetId, accessToken, "Sheet1");

    const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabRange(tabName, "A1:Z500"))}`;
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${JSON.stringify(data)}`);
    }

    const rows = data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ success: true, bookings: [] });
    }

    const headers = rows[0];
    const bookings = rows.slice(1).map((row) => {
      const getVal = (name) => {
        const idx = headers.indexOf(name);
        return idx !== -1 ? row[idx] : "";
      };

      return {
        id: getVal("Booking ID"),
        customer: {
          name: getVal("Client Name"),
          contact: getVal("Contact"),
          otherName: "",
          address: "",
        },
        eventDetails: {
          date: getVal("Event Date"),
          timing: getVal("Event Timing") || getVal("Timing"),
          guests: parseInt(getVal("Guests"), 10) || 0,
          source: getVal("Booking Origin"),
        },
        catering: {
          packageName: getVal("Package"),
        },
        financials: {
          grandTotal: parseFloat(getVal("Total Price")) || 0,
        },
        bookingSource: getVal("Booking Origin"),
        status: getVal("Status"),
      };
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Fetch sync-bookings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add new bookings (either single or bulk migration) directly to Google Sheets
export async function POST(req) {
  try {
    const sheetId = getZaydanSpreadsheetId();
    const accessToken = await getSheetsAccessToken();
    const tabName = await resolveSheetTabName(sheetId, accessToken, "Sheet1");

    const { bookings, isMigration } = await req.json();
    if (!bookings || !Array.isArray(bookings)) {
      return NextResponse.json(
        { success: false, error: "Invalid bookings array" },
        { status: 400 }
      );
    }

    const rows = bookings.map((booking) => {
      return [
        booking.id || "N/A",
        booking.customer?.name || "Client",
        booking.customer?.contact || "N/A",
        booking.eventDetails?.date || "N/A",
        booking.eventDetails?.timing || "N/A",
        String(booking.eventDetails?.guests || "0"),
        booking.catering?.packageName || booking.catering?.packageName || "N/A",
        String(booking.financials?.grandTotal || "0"),
        booking.bookingSource || booking.eventDetails?.source || "online",
        booking.status || "Pending",
      ];
    });

    const range = tabRange(tabName, "A1");

    if (isMigration) {
      const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabRange(tabName, "A1:Z500"))}:clear`;
      await fetch(clearUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const headerRow = [
        "Booking ID",
        "Client Name",
        "Contact",
        "Event Date",
        "Timing",
        "Guests",
        "Package",
        "Total Price",
        "Booking Origin",
        "Status",
      ];
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
      await fetch(appendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [headerRow, ...rows],
        }),
      });
    } else {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
      await fetch(appendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: rows,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${rows.length} bookings to Google Sheet`,
    });
  } catch (error) {
    console.error("Save sync-bookings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

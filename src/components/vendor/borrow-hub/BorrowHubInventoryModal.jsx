"use client";

import React from "react";
import {
  INVENTORY_CATEGORIES,
  LISTING_TYPES,
  generateInventoryItemId,
} from "@/lib/firestore/borrowHub";

export default function BorrowHubInventoryModal({
  open,
  onClose,
  hubEnabled,
  setHubEnabled,
  hubPhone,
  setHubPhone,
  hubTerms,
  setHubTerms,
  inventory,
  itemForm,
  setItemForm,
  onSaveSettings,
  onSaveItem,
  onDeleteItem,
  isProcessing,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">My lendable inventory</h3>
            <p className="text-xs text-slate-500">List surplus assets for other halls</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-slate-700">Participate in B2B network</span>
              <input
                type="checkbox"
                checked={hubEnabled}
                onChange={(e) => setHubEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
            <input
              type="tel"
              value={hubPhone}
              onChange={(e) => setHubPhone(e.target.value)}
              placeholder="B2B contact phone"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={hubTerms}
              onChange={(e) => setHubTerms(e.target.value)}
              placeholder="Default terms (return window, transport…)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={isProcessing}
              onClick={onSaveSettings}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Save settings & publish listings
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setItemForm({
                itemId: generateInventoryItemId(),
                title: "",
                category: "power",
                quantityTotal: 1,
                quantityAvailable: 1,
                unit: "units",
                listingType: "rent",
                pricePerUnit: 0,
                notes: "",
              })
            }
            className="w-full py-2.5 rounded-lg border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold hover:bg-indigo-50"
          >
            + Add borrowable item
          </button>

          {itemForm && (
            <div className="rounded-xl border border-indigo-200 p-4 space-y-3 bg-indigo-50/30">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                placeholder="Title e.g. 500KVA Heavy Generator Set"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                >
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={itemForm.listingType}
                  onChange={(e) => setItemForm({ ...itemForm, listingType: e.target.value })}
                >
                  {LISTING_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Total qty"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={itemForm.quantityTotal}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      quantityTotal: e.target.value,
                      quantityAvailable: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Available"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={itemForm.quantityAvailable}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, quantityAvailable: e.target.value })
                  }
                />
              </div>
              {itemForm.listingType !== "lend" && (
                <input
                  type="number"
                  min="0"
                  placeholder="Price per unit (PKR)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={itemForm.pricePerUnit}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, pricePerUnit: e.target.value })
                  }
                />
              )}
              <textarea
                rows={2}
                placeholder="Notes for borrowers"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                value={itemForm.notes}
                onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
              />
              {!itemForm.title?.trim() && (
                <p className="text-xs text-amber-700 font-medium">
                  Enter a title above to save this item to the network.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onSaveItem}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isProcessing ? "Saving…" : "Save item"}
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your listings ({inventory.length})
            </p>
            {inventory.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No items yet.</p>
            ) : (
              inventory.map((item) => (
                <div
                  key={item.itemId}
                  className="flex justify-between items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.quantityAvailable}/{item.quantityTotal} {item.unit} · {item.listingType}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setItemForm({ ...item })}
                      className="text-xs font-semibold text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.itemId)}
                      className="text-xs font-semibold text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

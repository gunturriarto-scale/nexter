"use client";

import { useState, type ReactNode } from "react";

export type GridValue = string | number | string[];
export type GridRow = Record<string, GridValue>;

export interface GridField {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "tags";
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** Tailwind width class for the column, e.g. "w-[180px]". */
  width?: string;
}

export interface EditableGridProps {
  fields: GridField[];
  rows: GridRow[];
  onChange: (rows: GridRow[]) => void;
  makeBlankRow: () => GridRow;
  addLabel?: string;
  emptyLabel?: string;
}

export function TagsInput({
  value,
  onChange,
  placeholder = "ketik lalu Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const token = draft.trim();
    if (token && !value.includes(token)) onChange([...value, token]);
    setDraft("");
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {value.map((tag) => (
        <span key={tag} className="gfx-chip inline-flex items-center gap-1 bg-[#F1F5F9] text-[#536984]">
          {tag}
          <button type="button" className="text-[#91A0B5] hover:text-rose-500" onClick={() => onChange(value.filter((t) => t !== tag))}>
            ×
          </button>
        </span>
      ))}
      <input
        className="gfx-input !min-h-0 !w-[120px] !py-1 !text-[11px]"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

export function EditableGrid({
  fields,
  rows,
  onChange,
  makeBlankRow,
  addLabel = "+ Tambah baris",
  emptyLabel = "Belum ada data.",
}: EditableGridProps) {
  function updateCell(index: number, key: string, next: GridValue) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: next } : row)));
  }
  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="gfx-table-wrap gfx-table-scroll overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.key} className={`gfx-th px-3 py-2 ${field.width ?? ""}`}>
                  {field.label}
                </th>
              ))}
              <th className="gfx-th px-3 py-2 w-[44px]" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-3 py-8 text-center text-[#7A8AA3]">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={index} className="gfx-row-border align-top">
                {fields.map((field) => (
                  <td key={field.key} className={`px-3 py-2 ${field.width ?? ""}`}>
                    <Cell field={field} value={row[field.key]} onChange={(next) => updateCell(index, field.key, next)} />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-none border border-[#CDD9E6] px-2 py-1 text-[11px] font-semibold text-[#536984] hover:border-rose-400 hover:text-rose-500"
                    onClick={() => removeRow(index)}
                    aria-label="Hapus baris"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="mt-2 rounded-none border border-[#CDD9E6] px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] hover:border-[#2563EB]"
        onClick={() => onChange([...rows, makeBlankRow()])}
      >
        {addLabel}
      </button>
    </div>
  );
}

function Cell({
  field,
  value,
  onChange,
}: {
  field: GridField;
  value: GridValue;
  onChange: (next: GridValue) => void;
}): ReactNode {
  if (field.type === "tags") {
    return <TagsInput value={Array.isArray(value) ? value : []} onChange={onChange} placeholder={field.placeholder} />;
  }
  if (field.type === "select") {
    return (
      <select className="gfx-select !min-h-0 !py-1 !text-[11px]" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
        <option value="">—</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "number") {
    return (
      <input
        type="number"
        className="gfx-input !min-h-0 !w-[110px] !py-1 !text-[11px]"
        value={value === "" || value === undefined ? "" : String(value)}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
      />
    );
  }
  return (
    <input
      className="gfx-input !min-h-0 !py-1 !text-[11px]"
      value={String(value ?? "")}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

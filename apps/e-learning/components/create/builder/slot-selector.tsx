"use client";

import { Select } from "@tasco/ui";

interface Option {
  value: string;
  label: string;
}

interface SlotSelectorProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SlotSelector({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: SlotSelectorProps) {
  return (
    <Select
      options={options}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`inline-flex h-auto min-w-[160px] border-b-2 border-primary/30 bg-transparent px-2 py-1 text-base font-medium hover:border-primary focus:border-primary rounded-none ${className}`}
    />
  );
}

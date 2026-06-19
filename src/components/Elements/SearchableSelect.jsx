import React, { useMemo } from "react";
import Select from "react-select";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Search and select...",
  isDisabled = false,
  isLoading = false,
  isClearable = false,
  className = "",
  noOptionsMessage = "No option found",
}) {
  const normalizedOptions = useMemo(
    () =>
      (Array.isArray(options) ? options : []).map((option) =>
        typeof option === "object"
          ? {
              value: String(option.value ?? option.id ?? ""),
              label: String(option.label ?? option.name ?? option.value ?? ""),
            }
          : { value: String(option), label: String(option) },
      ),
    [options],
  );

  const selected =
    normalizedOptions.find((option) => option.value === String(value ?? "")) ||
    null;

  return (
    <Select
      className={`solar-search-select ${className}`.trim()}
      classNamePrefix="solar-search-select"
      options={normalizedOptions}
      value={selected}
      onChange={(selectedOption) => onChange(selectedOption?.value || "")}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable={isClearable}
      isSearchable
      menuPlacement="auto"
      maxMenuHeight={220}
      noOptionsMessage={() => noOptionsMessage}
    />
  );
}

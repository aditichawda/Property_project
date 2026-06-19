import React from "react";

export default function SimplePagination({
  page,
  perPage = 20,
  total = 0,
  lastPage = 1,
  onPageChange,
  loading = false,
}) {
  const safePage = Number(page || 1);
  const safeLastPage = Math.max(1, Number(lastPage || 1));
  const safeTotal = Number(total || 0);
  const start = safeTotal ? (safePage - 1) * perPage + 1 : 0;
  const end = safeTotal ? Math.min(safePage * perPage, safeTotal) : 0;
  const pages = Array.from({ length: safeLastPage }, (_, index) => index + 1);

  if (!safeTotal || safeLastPage <= 1) {
    return null;
  }

  return (
    <div
      className="d-flex justify-content-between align-items-center flex-wrap"
      style={{ gap: 14, padding: "18px 0" }}
    >
      <span className="text-muted">
        {safeTotal
          ? `Showing ${start} to ${end} of ${safeTotal} results`
          : "Showing 0 results"}
      </span>
      <div
        className="d-flex align-items-center"
        style={{
          border: "1px solid #dde5ee",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <button
          type="button"
          className="btn btn-link"
          disabled={loading || safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          style={{ minWidth: 54, textDecoration: "none" }}
        >
          ‹
        </button>
        {pages.map((item) => (
          <button
            type="button"
            key={item}
            disabled={loading}
            onClick={() => onPageChange(item)}
            className="btn"
            style={{
              minWidth: 58,
              borderLeft: "1px solid #dde5ee",
              borderRight: "1px solid #dde5ee",
              borderRadius: 0,
              background: item === safePage ? "#f59e0b" : "#fff",
              color: item === safePage ? "#fff" : "#f59e0b",
            }}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-link"
          disabled={loading || safePage >= safeLastPage}
          onClick={() => onPageChange(Math.min(safeLastPage, safePage + 1))}
          style={{ minWidth: 54, textDecoration: "none" }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

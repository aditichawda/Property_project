import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SolutionsGrid } from './WhatWeDo1';
import {
  fetchSolarServicesCatalog,
  parseSolarServicesCatalogResponse,
  mapApiServiceToSolutionItem,
} from '../../api/solarServicesCatalog';

const PER_PAGE = 9;

var bgimg1 = require('./../../images/background/bg-5.png');
var bgimg3 = require('./../../images/background/cross-line2.png');

/**
 * Public services from API + client-side pagination (catalog GET returns full list).
 */
export default function SolarServicesCatalog({ stateId, cityId, intro, hideSectionTitle }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await fetchSolarServicesCatalog({
        stateId: stateId || undefined,
        cityId: cityId || undefined,
      });
      const { items, ok } = parseSolarServicesCatalogResponse(raw);
      if (!ok && items.length === 0) {
        setError(typeof raw?.message === 'string' ? raw.message : 'Could not load services.');
        setAllItems([]);
        return;
      }
      const mapped = items
        .map((row, i) => mapApiServiceToSolutionItem(row, i))
        .filter(Boolean);
      setAllItems(mapped);
    } catch (e) {
      setError(e?.message || 'Could not load services.');
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [stateId, cityId]);

  useEffect(() => {
    setPage(1);
  }, [stateId, cityId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(allItems.length / PER_PAGE)), [allItems.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return allItems.slice(start, start + PER_PAGE);
  }, [allItems, page]);

  const getItemHref = useCallback((sol) => sol?.href || '', []);

  return (
    <div
      id="solutions"
      className="section-full mobile-page-padding bg-white p-t20 p-b30 bg-repeat overflow-hide scroll-spy-section"
      style={{ backgroundImage: 'url(' + bgimg1 + ')' }}
    >
      <div className="container right-half-bg-image-outer">
        <div className="right-half-bg-image bg-parallax bg-fixed bg-top-right" data-stellar-background-ratio={0} style={{ backgroundImage: 'url(' + bgimg1 + ')' }} />
        {!hideSectionTitle && (
          <div className="section-head">
            <div className="sx-separator-outer separator-left">
              <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg3 + ')' }}>
                <h3 className="sep-line-one">Services</h3>
              </div>
            </div>
          </div>
        )}
        {intro && <p className="m-b30 max-w900 solar-section-intro">{intro}</p>}
        <div className="section-content">
          {loading && (
            <p className="text-center p-a30 bg-white radius-md m-b20" aria-live="polite">
              Loading services…
            </p>
          )}
          {!loading && error ? (
            <div className="alert alert-warning m-b20" role="alert">
              {error}
            </div>
          ) : null}
          {!loading && !error && allItems.length === 0 ? (
            <p className="text-center p-a30 bg-white radius-md">No services match these filters.</p>
          ) : null}
          {!loading && pageItems.length > 0 ? (
            <>
              <p className="m-b20 text-muted small" aria-live="polite">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, allItems.length)} of {allItems.length}
                {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
              </p>
              <SolutionsGrid items={pageItems} showReadMore={false} detailMode getItemHref={getItemHref} />
              {totalPages > 1 ? (
                <nav className="solar-services-pagination m-t40 m-b20" aria-label="Services pagination">
                  <ul className="pagination justify-content-center flex-wrap m-b0">
                    <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {totalPages <= 12
                      ? Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                          <li key={num} className={`page-item ${num === page ? 'active' : ''}`}>
                            <button type="button" className="page-link" onClick={() => setPage(num)}>
                              {num}
                            </button>
                          </li>
                        ))
                      : (
                          <li className="page-item disabled px-2">
                            <span className="page-link border-0 bg-transparent text-dark">
                              Page {page} / {totalPages}
                            </span>
                          </li>
                        )}
                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

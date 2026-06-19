import React, { useEffect, useMemo, useState } from 'react';
import { getSubOptionsForCategory, SERVICE_CATEGORIES } from '../../data/sellerServiceCatalog';

function emptyForm() {
  return {
    title: '',
    category: 'Solar Installation',
    subOption: '',
    price: '',
    capacityKw: '',
    installationTime: '',
    warrantyYears: '',
    description: '',
    thumbnail: '',
    images: [],
  };
}

function readFilesAsDataUrls(fileList) {
  return Promise.all(
    Array.from(fileList || []).map(
      (file) =>
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        })
    )
  );
}

export default function SellerServiceModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title || '',
          category: initial.category || 'Solar Installation',
          subOption: initial.subOption || '',
          price: initial.price != null ? String(initial.price) : '',
          capacityKw: initial.capacityKw != null ? String(initial.capacityKw) : '',
          installationTime: initial.installationTime || '',
          warrantyYears: initial.warrantyYears != null ? String(initial.warrantyYears) : '',
          description: initial.description || '',
          thumbnail: initial.thumbnail || '',
          images: Array.isArray(initial.images) ? initial.images : [],
        });
      } else {
        setForm(emptyForm());
      }
    }
  }, [open, initial]);

  const subOptions = useMemo(() => getSubOptionsForCategory(form.category), [form.category]);
  const showSub = subOptions.length > 0;

  const fieldErrors = useMemo(() => {
    const e = {};
    if (!String(form.title || '').trim()) e.title = 'Service title is required.';
    if (!form.category) e.category = 'Category is required.';
    if (showSub && !String(form.subOption || '').trim()) e.subOption = 'Please select an option.';
    return e;
  }, [form.title, form.category, form.subOption, showSub]);

  const isValid = Object.keys(fieldErrors).length === 0;

  const handleThumbnail = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const [url] = await readFilesAsDataUrls([f]);
    setForm((prev) => ({ ...prev, thumbnail: url }));
  };

  const handleGallery = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const urls = await readFilesAsDataUrls(files);
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls].slice(0, 12) }));
  };

  const removeGalleryAt = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!isValid) return;
    onSave({
      title: form.title.trim(),
      category: form.category,
      subOption: showSub ? form.subOption : '',
      price: form.price.trim(),
      capacityKw: form.capacityKw.trim(),
      installationTime: form.installationTime.trim(),
      warrantyYears: form.warrantyYears.trim(),
      description: form.description.trim(),
      thumbnail: form.thumbnail,
      images: form.images || [],
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="svc-modal-title">
      <div className="seller-crm-modal-card seller-crm-modal-card--xl">
        <div className="seller-crm-modal-head">
          <h3 id="svc-modal-title">{initial ? 'Edit service' : 'Add service'}</h3>
          <button type="button" className="seller-crm-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="seller-crm-modal-split">
            <div className="seller-crm-modal-body">
              <h4 className="seller-crm-modal-section-title">Basic info</h4>
              <div className="seller-crm-form-grid seller-crm-form-grid--2">
                <div className="seller-crm-form-field seller-crm-form-field--full">
                  <label>Service title *</label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  {fieldErrors.title && <span className="seller-crm-field-error">{fieldErrors.title}</span>}
                </div>
                <div className="seller-crm-form-field">
                  <label>Category *</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const subs = getSubOptionsForCategory(cat);
                      setForm((f) => ({
                        ...f,
                        category: cat,
                        subOption: subs.length ? subs[0] : '',
                      }));
                    }}
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {showSub && (
                  <div className="seller-crm-form-field">
                    <label>Sub option *</label>
                    <select
                      className="form-control"
                      value={form.subOption}
                      onChange={(e) => setForm((f) => ({ ...f, subOption: e.target.value }))}
                    >
                      {subOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.subOption && <span className="seller-crm-field-error">{fieldErrors.subOption}</span>}
                  </div>
                )}
              </div>

              <h4 className="seller-crm-modal-section-title m-t20">Solar details</h4>
              <div className="seller-crm-form-grid seller-crm-form-grid--2">
                <div className="seller-crm-form-field">
                  <label>Price (optional)</label>
                  <input
                    className="form-control"
                    placeholder="₹"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="seller-crm-form-field">
                  <label>Capacity (KW)</label>
                  <input
                    className="form-control"
                    value={form.capacityKw}
                    onChange={(e) => setForm((f) => ({ ...f, capacityKw: e.target.value }))}
                  />
                </div>
                <div className="seller-crm-form-field">
                  <label>Installation time</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 2–3 days"
                    value={form.installationTime}
                    onChange={(e) => setForm((f) => ({ ...f, installationTime: e.target.value }))}
                  />
                </div>
                <div className="seller-crm-form-field">
                  <label>Warranty (years)</label>
                  <input
                    className="form-control"
                    value={form.warrantyYears}
                    onChange={(e) => setForm((f) => ({ ...f, warrantyYears: e.target.value }))}
                  />
                </div>
                <div className="seller-crm-form-field seller-crm-form-field--full">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <h4 className="seller-crm-modal-section-title m-t20">Media</h4>
              <div className="seller-crm-form-grid seller-crm-form-grid--2">
                <div className="seller-crm-form-field">
                  <label>Thumbnail</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleThumbnail} />
                </div>
                <div className="seller-crm-form-field">
                  <label>Service images (multiple)</label>
                  <input type="file" accept="image/*" multiple className="form-control" onChange={handleGallery} />
                </div>
              </div>
              <div className="seller-crm-modal-actions m-t20">
                <button type="button" className="site-button-secondry" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="site-button" disabled={!isValid}>
                  <span>{initial ? 'Save service' : 'Add service'}</span>
                </button>
              </div>
            </div>

            <aside className="seller-crm-modal-preview">
              <h4 className="seller-crm-modal-section-title">Preview</h4>
              <div className="seller-svc-card seller-svc-card--preview">
                <div className="seller-svc-card__img">
                  {form.thumbnail ? (
                    <img src={form.thumbnail} alt="" />
                  ) : (
                    <div className="seller-svc-card__placeholder">
                      <i className="fa fa-image" />
                    </div>
                  )}
                </div>
                <div className="seller-svc-card__body">
                  <div className="seller-svc-card__cat">{form.category || 'Category'}</div>
                  <h5 className="seller-svc-card__title">{form.title || 'Service title'}</h5>
                  {showSub && form.subOption && <span className="seller-svc-card__sub">{form.subOption}</span>}
                  <p className="seller-svc-card__desc">{form.description || 'Description will appear here.'}</p>
                  <ul className="seller-svc-card__meta">
                    {form.capacityKw && <li>{form.capacityKw} KW</li>}
                    {form.installationTime && <li>{form.installationTime}</li>}
                    {form.warrantyYears && <li>{form.warrantyYears} yr warranty</li>}
                    {form.price && <li>{form.price}</li>}
                  </ul>
                </div>
              </div>
              <div className="seller-crm-modal-preview-thumbs">
                {(form.images || []).slice(0, 6).map((src, i) => (
                  <div key={i} className="seller-crm-thumb">
                    <img src={src} alt="" />
                    <button type="button" className="seller-crm-thumb-remove" onClick={() => removeGalleryAt(i)} aria-label="Remove">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

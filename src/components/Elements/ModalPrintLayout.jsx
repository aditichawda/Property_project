import React from "react";

const logoImg = require("../../images/Infrio_Properties.png");
const SITE_NAME = "Infrio Properties";

/**
 * Wraps modal content so that when print is triggered, only this content is printed
 * and each page shows the website logo and name at the top right.
 *
 * Usage in your modal:
 * 1. Wrap the modal body (not the overlay) with <ModalPrintLayout id="my-modal-print">...</ModalPrintLayout>
 * 2. On Print button click call: triggerModalPrint('my-modal-print')
 */
export function ModalPrintLayout({
  id = "modal-print",
  children,
  logo = logoImg,
  siteName = SITE_NAME,
  className = "",
}) {
  return (
    <div
      id={id}
      className={`print-modal-root ${className}`}
      style={{ position: "relative" }}
    >
      <div className="print-header-modal" aria-hidden="true">
        <img src={logo} alt="" />
        <span className="print-site-name">{siteName}</span>
      </div>
      <div className="print-modal-content">{children}</div>
    </div>
  );
}

/**
 * Call this when the user clicks Print in the modal.
 * Prints only the content inside the modal and shows logo + site name on top right of each page.
 * @param {string} rootId - The id passed to ModalPrintLayout (e.g. 'my-modal-print')
 */
export function triggerModalPrint(rootId = "modal-print") {
  const root = document.getElementById(rootId);
  if (!root) {
    const first = document.querySelector(".print-modal-root");
    if (first) first.id = rootId;
  }

  const cleanup = () => {
    document.body.classList.remove("printing-modal");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  document.body.classList.add("printing-modal");
  window.print();
}

export default ModalPrintLayout;

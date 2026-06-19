import React, { useState, useEffect, useCallback } from 'react';

const MAX_LOADER_MS = 2000;

/**
 * Full-screen preloader. Hides as soon as the browser paints the app (double rAF),
 * not when window "load" fires (which waits on all images/fonts/scripts).
 * Safety timeout prevents an infinite spinner if something goes wrong.
 */
const Loader = () => {
  const [visible, setVisible] = useState(true);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let raf2 = 0;
    const finish = () => {
      if (!cancelled) hide();
    };

    // After React commits, wait two frames so the route content can paint underneath
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(finish);
    });

    const safetyTimer = window.setTimeout(finish, MAX_LOADER_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      window.clearTimeout(safetyTimer);
    };
  }, [hide]);

  if (!visible) return null;

  return (
    <div className="loading-area app-react-loader" aria-busy="true" aria-label="Loading">
      <div className="loading-box" />
      <div className="loading-pic">
        <div className="cssload-spinner">
          <div className="cssload-cube cssload-cube0" />
          <div className="cssload-cube cssload-cube1" />
          <div className="cssload-cube cssload-cube2" />
          <div className="cssload-cube cssload-cube3" />
          <div className="cssload-cube cssload-cube4" />
          <div className="cssload-cube cssload-cube5" />
          <div className="cssload-cube cssload-cube6" />
          <div className="cssload-cube cssload-cube7" />
          <div className="cssload-cube cssload-cube8" />
          <div className="cssload-cube cssload-cube9" />
          <div className="cssload-cube cssload-cube10" />
          <div className="cssload-cube cssload-cube11" />
          <div className="cssload-cube cssload-cube12" />
          <div className="cssload-cube cssload-cube13" />
          <div className="cssload-cube cssload-cube14" />
          <div className="cssload-cube cssload-cube15" />
        </div>
      </div>
    </div>
  );
};

export default Loader;

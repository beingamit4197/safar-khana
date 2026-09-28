import { createContext, useContext, useEffect, useState } from 'react';
import { loadArchive } from '../lib/contentApi';

const ArchiveContext = createContext(null);

export function ArchiveProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    archive: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    loadArchive()
      .then((archive) => {
        if (!cancelled) setState({ status: 'ready', archive, error: null });
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setState({ status: 'error', archive: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="page-placeholder">
        <p>Loading the Safar Khana archive…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page-placeholder">
        <h1>Archive unavailable</h1>
        <p>{state.error?.message || 'Could not load content.'}</p>
      </div>
    );
  }

  return (
    <ArchiveContext.Provider value={state.archive}>{children}</ArchiveContext.Provider>
  );
}

export function useArchive() {
  const archive = useContext(ArchiveContext);
  if (!archive) throw new Error('useArchive must be used inside ArchiveProvider');
  return archive;
}

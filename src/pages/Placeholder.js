import { Link } from 'react-router-dom';

export default function Placeholder({ title, note }) {
  return (
    <div className="page-placeholder">
      <h1>{title}</h1>
      <p>{note || 'Coming next — wired to YouTube archive data.'}</p>
      <Link to="/" className="btn btn-primary">
        ← Back to Home
      </Link>
    </div>
  );
}

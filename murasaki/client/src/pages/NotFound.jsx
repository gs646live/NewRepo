import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center animate-fade-up">
      <p className="font-jp text-6xl text-murasaki-800">迷子</p>
      <p className="mt-2 text-xs text-murasaki-500">maigo — lost</p>
      <h1 className="mt-5 text-xl font-bold text-murasaki-900">This page doesn’t exist</h1>
      <p className="mt-2 text-sm text-murasaki-700">Let’s get you back to practising.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Murasaki
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-slate-800 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-slate-300 transition-colors">
          SQL Interview Trainer
        </Link>
        <nav>
          <Link
            to="/"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Questions
          </Link>
        </nav>
      </div>
    </header>
  );
}

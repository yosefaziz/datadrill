import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-bg-secondary text-text-primary px-6 py-4 shadow-lg border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
          DataDrill
        </Link>
        <nav>
          <Link
            to="/"
            className="text-text-secondary hover:text-primary transition-colors"
          >
            Questions
          </Link>
        </nav>
      </div>
    </header>
  );
}

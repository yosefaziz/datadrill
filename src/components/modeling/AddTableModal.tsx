import { useState, useEffect } from 'react';
import { TableType } from '@/types';

interface AddTableModalProps {
  onAdd: (type: TableType, name: string) => void;
  onClose: () => void;
}

export function AddTableModal({ onAdd, onClose }: AddTableModalProps) {
  const [type, setType] = useState<TableType>('dimension');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(type, name.trim());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-table-modal-title"
    >
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10">
          <h2 id="add-table-modal-title" className="text-lg font-semibold text-text-primary">Add New Table</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Table Type Selection */}
          <fieldset className="mb-4 border-none p-0">
            <legend className="block text-sm font-medium text-text-primary mb-2">
              Table Type
            </legend>
            <div className="flex gap-3" role="radiogroup" aria-label="Table type">
              <button
                type="button"
                onClick={() => setType('fact')}
                role="radio"
                aria-checked={type === 'fact'}
                className={`flex-1 p-3 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  type === 'fact'
                    ? 'ring-2 ring-warning bg-warning/10'
                    : 'ring-1 ring-white/10 hover:ring-white/20'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold ${
                      type === 'fact' ? 'text-warning' : 'text-text-primary'
                    }`}
                  >
                    Fact Table
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Billions of rows, stores metrics
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('dimension')}
                role="radio"
                aria-checked={type === 'dimension'}
                className={`flex-1 p-3 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  type === 'dimension'
                    ? 'ring-2 ring-info bg-info/10'
                    : 'ring-1 ring-white/10 hover:ring-white/20'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold ${
                      type === 'dimension' ? 'text-info' : 'text-text-primary'
                    }`}
                  >
                    Dimension Table
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Small lookup table, descriptive
                  </div>
                </div>
              </button>
            </div>
          </fieldset>

          {/* Table Name */}
          <div className="mb-6">
            <label htmlFor="table-name" className="block text-sm font-medium text-text-primary mb-2">
              Table Name
            </label>
            <input
              id="table-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'fact' ? 'e.g., Fact_Orders' : 'e.g., Dim_Users'}
              className="w-full px-3 py-2 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                name.trim()
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

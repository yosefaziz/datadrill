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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Add New Table</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Table Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Table Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('fact')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  type === 'fact'
                    ? 'border-warning bg-warning/10'
                    : 'border-border hover:border-text-muted'
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
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  type === 'dimension'
                    ? 'border-info bg-info/10'
                    : 'border-border hover:border-text-muted'
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
          </div>

          {/* Table Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'fact' ? 'e.g., Fact_Orders' : 'e.g., Dim_Users'}
              className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

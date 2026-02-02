import { useState } from 'react';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Add New Table</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Table Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Table Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('fact')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  type === 'fact'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold ${
                      type === 'fact' ? 'text-orange-700' : 'text-slate-700'
                    }`}
                  >
                    Fact Table
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Billions of rows, stores metrics
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('dimension')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  type === 'dimension'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold ${
                      type === 'dimension' ? 'text-sky-700' : 'text-slate-700'
                    }`}
                  >
                    Dimension Table
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Small lookup table, descriptive
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Table Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'fact' ? 'e.g., Fact_Orders' : 'e.g., Dim_Users'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                name.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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

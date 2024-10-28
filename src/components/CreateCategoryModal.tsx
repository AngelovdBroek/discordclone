import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useServers } from '../store/servers';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  serverId
}: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const { addCategory } = useServers();

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!categoryName.trim()) return;

    addCategory(serverId, categoryName.trim());
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryName.trim()) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Create Category</h2>
            <button
              onClick={onClose}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              placeholder="New Category"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!categoryName.trim()}
              className="px-4 py-2 bg-[#5865f2] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4752c4]"
            >
              Create Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
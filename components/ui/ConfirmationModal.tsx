

import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-gray-600 mb-6">{children}</div>
      <div className="flex justify-end space-x-4 rtl:space-x-reverse">
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

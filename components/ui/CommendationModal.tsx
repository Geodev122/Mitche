import React, { FC, useState } from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { CommendationType } from '../../types';
import { Check } from 'lucide-react';

interface CommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (commendations: CommendationType[]) => void;
  userName: string;
}

const CommendationModal: FC<CommendationModalProps> = ({ isOpen, onClose, onSubmit, userName }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<CommendationType[]>([]);

  const commendationOptions = Object.values(CommendationType);

  const toggleSelection = (option: CommendationType) => {
    setSelected(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    onSubmit(selected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('commendations.leaveTitle')}>
      <div className="space-y-4">
        <p className="text-gray-600 text-center">{t('commendations.leaveSubtitle', { name: userName })}</p>
        <div className="space-y-2">
          {commendationOptions.map(option => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleSelection(option)}
                className={`w-full flex items-center justify-between text-left p-3 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-50 border-[#D4AF37] text-gray-800 ring-2 ring-[#D4AF37]'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span>{t(`commendations.types.${option}`)}</span>
                {isSelected && <Check className="w-5 h-5 text-[#D4AF37]" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
        >
          {t('commendations.submit')}
        </button>
      </div>
    </Modal>
  );
};

export default CommendationModal;
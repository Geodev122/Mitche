import * as React from 'react';
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

const CommendationModal: React.FC<CommendationModalProps> = ({ isOpen, onClose, onSubmit, userName }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<CommendationType[]>([]);

  const commendationOptions = Object.values(CommendationType);

  const toggleSelection = (option: CommendationType) => {
    setSelected(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    onSubmit(selected);
    setSelected([]); // Reset for next time
    onClose();
  };
  
  const handleClose = () => {
      setSelected([]);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('commendations.leaveTitle')}>
      <div className="text-center">
        <p className="text-gray-600 mb-6">{t('commendations.leaveSubtitle', { name: userName })}</p>
        <div className="space-y-3">
          {commendationOptions.map(option => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleSelection(option)}
                className={`w-full flex items-center justify-between text-left p-3 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-50 border-amber-400 text-gray-800 ring-2 ring-amber-400'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span>{t(`commendations.types.${option}`)}</span>
                {isSelected && <Check className="w-5 h-5 text-amber-600" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="w-full mt-6 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {t('commendations.submit')}
        </button>
      </div>
    </Modal>
  );
};

export default CommendationModal;

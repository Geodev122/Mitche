import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUser } = useAuth();
  const { t } = useTranslation();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setLocation(user.location || '');
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.id}`;
    updateUser({ bio, location, qrCodeUrl });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('constellation.editProfile.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t('constellation.editProfile.location')}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            placeholder={t('constellation.editProfile.locationPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t('constellation.editProfile.bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            placeholder={t('constellation.editProfile.bioPlaceholder')}
          />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">
          {t('constellation.editProfile.save')}
        </button>
      </form>
    </Modal>
  );
};

export default EditProfileModal;

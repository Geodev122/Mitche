import React from 'react';
import Modal from '../components/ui/Modal';
import { RatingSystem } from '../components/rating/RatingSystem';
import { useAuth } from './AuthContext';

type RatingTarget = { id: string; type: 'user' | 'request' | 'offering' | 'event' | 'resource'; name?: string };

interface RatingModalContextType {
  openRatingModal: (target: RatingTarget) => void;
}

const RatingModalContext = React.createContext<RatingModalContextType | undefined>(undefined);

export const RatingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [target, setTarget] = React.useState<RatingTarget | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const { enhancedFirebase } = useAuth();

  const openRatingModal = (t: RatingTarget) => {
    // record a click impression for analytics
    enhancedFirebase?.recordAnalytics?.('star_clicked', { targetType: t.type, targetId: t.id });
    setTarget(t);
    setIsOpen(true);
  };

  return (
    <RatingModalContext.Provider value={{ openRatingModal }}>
      {children}
      {isOpen && target && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Rate ${target.name || target.id}`}>
          <RatingSystem
            targetId={target.id}
            targetType={target.type as any}
            targetName={target.name}
            onRatingSubmitted={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </RatingModalContext.Provider>
  );
};

export const useRatingModal = (): RatingModalContextType => {
  const ctx = React.useContext(RatingModalContext);
  if (!ctx) throw new Error('useRatingModal must be used within RatingModalProvider');
  return ctx;
};

export type { RatingTarget };

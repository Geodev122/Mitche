import * as React from 'react';
import AchievementsPanel from '../components/ui/AchievementsPanel';

import PageContainer from '../components/layout/PageContainer';

const AchievementsPage: React.FC = () => {
  return (
    <PageContainer title="Achievements">
      <AchievementsPanel />
    </PageContainer>
  );
};

export default AchievementsPage;

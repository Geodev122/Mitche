import { TFunction } from 'i18next';

export const timeSince = (date: Date, t: TFunction): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
      return t('echoes.time.just_now');
  }

  let interval = seconds / 31536000;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t('echoes.time.years_ago', { count });
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t('echoes.time.months_ago', { count });
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t('echoes.time.days_ago', { count });
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t('echoes.time.hours_ago', { count });
  }
  interval = seconds / 60;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t('echoes.time.minutes_ago', { count });
  }
  const count = Math.floor(seconds);
  return t('echoes.time.seconds_ago', { count });
};

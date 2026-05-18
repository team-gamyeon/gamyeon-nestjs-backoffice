export const NOTICE_CATEGORY_VALUES = [
  'NOTICE',
  'UPDATE',
  'GUIDE',
  'EVENT',
  'MAINTENANCE',
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORY_VALUES)[number];

export const DEFAULT_NOTICE_CATEGORY: NoticeCategory = 'NOTICE';

export const NOTICE_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const;

export type NoticeStatus = (typeof NOTICE_STATUS_VALUES)[number];

export const DEFAULT_NOTICE_STATUS: NoticeStatus = 'ACTIVE';

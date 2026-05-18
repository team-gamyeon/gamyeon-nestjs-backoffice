import type { NoticeCategory, NoticeStatus } from './notices.constants.js';

export type NoticeType = 'SERVICE' | 'MAINTENANCE' | 'UPDATE' | 'ETC';

export interface NoticeImage {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  type: NoticeType;
  images: NoticeImage[];
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListNoticesQuery {
  status?: NoticeStatus;
  type?: NoticeType;
  category?: NoticeCategory;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  category?: NoticeCategory;
  type?: NoticeType;
  images?: CreateNoticeImageDto[];
  status?: NoticeStatus;
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  category?: NoticeCategory;
  type?: NoticeType;
  images?: CreateNoticeImageDto[];
  status?: NoticeStatus;
}

export interface CreateNoticeImageDto {
  url: string;
  caption?: string;
  sortOrder?: number;
}

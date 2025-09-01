/**
 * Core type definitions for the Baby Book application
 * Provides type safety and documentation for all data structures
 */

export interface ResponsiveSrcSet {
  webp: string;
  original: string;
}

export interface ResponsiveImage {
  src: string;
  srcSet: ResponsiveSrcSet;
  alt: string;
  width: number;
  height: number;
  lqip: string;
  aspectRatio: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  // Enhanced image support for responsive images
  responsive?: ResponsiveImage;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    fileSize?: number;
    format?: string;
  };
  uploadedAt: Date;
}

export interface Page {
  id: string;
  bookId: string;
  title: string;
  content: string;
  media: MediaItem[];
  dateCreated: Date;
  dateModified: Date;
  pageNumber: number;
  layout: 'single-photo' | 'multi-photo' | 'text-heavy' | 'timeline' | 'milestone';
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  tags: string[];
  metadata?: {
    location?: string;
    weather?: string;
    mood?: string;
    peoplePresent?: string[];
  };
}

export interface Book {
  id: string;
  title: string;
  description: string;
  coverImage?: MediaItem;
  pages: Page[];
  dateCreated: Date;
  dateModified: Date;
  isPublic: boolean;
  shareCode?: string;
  totalPages: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    pageStyle: 'classic' | 'modern' | 'playful' | 'elegant';
  };
  metadata: {
    babyName?: string;
    birthDate?: Date;
    parents?: string[];
    tags: string[];
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  autoSaveInterval: number;
  defaultPageLayout: Page['layout'];
  showTutorial: boolean;
  enableSounds: boolean;
  enableAnimations: boolean;
  preferredLanguage: string;
  privacySettings: {
    allowAnalytics: boolean;
    allowCrashReporting: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: AppSettings;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AppState {
  currentBook: Book | null;
  currentPage: Page | null;
  books: Book[];
  user: User | null;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  unsavedChanges: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  mediaType?: MediaItem['type'];
  layout?: Page['layout'];
}

export interface BookFilters extends SearchFilters {
  isPublic?: boolean;
  hasShareCode?: boolean;
}

export interface PageFilters extends SearchFilters {
  bookId?: string;
  pageNumbers?: number[];
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ServiceResponse<T = unknown> {
  data?: T;
  error?: Error;
  loading: boolean;
}

export interface CacheConfig {
  ttl: number;
  staleTime: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
}

export interface LocalStorageKey {
  BOOKS: 'baby-book-books';
  SETTINGS: 'baby-book-settings';
  USER: 'baby-book-user';
  LAST_BOOK: 'baby-book-last-book';
  TUTORIAL_COMPLETED: 'baby-book-tutorial-completed';
}

export const LOCAL_STORAGE_KEYS: LocalStorageKey = {
  BOOKS: 'baby-book-books',
  SETTINGS: 'baby-book-settings',
  USER: 'baby-book-user',
  LAST_BOOK: 'baby-book-last-book',
  TUTORIAL_COMPLETED: 'baby-book-tutorial-completed',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  autoSave: true,
  autoSaveInterval: 30000,
  defaultPageLayout: 'single-photo',
  showTutorial: true,
  enableSounds: true,
  enableAnimations: true,
  preferredLanguage: 'en',
  privacySettings: {
    allowAnalytics: false,
    allowCrashReporting: true,
  },
};

export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const SUPPORTED_AUDIO_FORMATS = ['audio/mp3', 'audio/wav', 'audio/ogg'] as const;

export type SupportedImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];
export type SupportedVideoFormat = typeof SUPPORTED_VIDEO_FORMATS[number];
export type SupportedAudioFormat = typeof SUPPORTED_AUDIO_FORMATS[number];
export type SupportedMediaFormat = SupportedImageFormat | SupportedVideoFormat | SupportedAudioFormat;
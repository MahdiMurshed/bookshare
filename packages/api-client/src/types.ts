/**
 * Core data models for BookShare
 * These types represent the database schema and are shared across all apps
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      books: {
        Row: Book;
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>;
      };
      borrow_requests: {
        Row: BorrowRequest;
        Insert: Omit<BorrowRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BorrowRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  description: string | null;
  cover_image_url: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  borrowable: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookWithOwner extends Book {
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export type BorrowRequestStatus = 'pending' | 'approved' | 'denied' | 'returned';

export interface BorrowRequest {
  id: string;
  book_id: string;
  borrower_id: string;
  owner_id: string;
  status: BorrowRequestStatus;
  request_message: string | null;
  response_message: string | null;
  requested_at: string;
  approved_at: string | null;
  due_date: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequestWithDetails extends BorrowRequest {
  book?: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    genre: string | null;
  };
  borrower?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  owner?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'borrow_request'
  | 'request_approved'
  | 'request_denied'
  | 'book_returned'
  | 'due_soon'
  | 'overdue';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null; // JSON data (book_id, request_id, etc.)
  read: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

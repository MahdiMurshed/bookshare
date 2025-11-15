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
  is_admin: boolean;
  suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
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
  flagged: boolean;
  flagged_at: string | null;
  flagged_reason: string | null;
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

export type BorrowRequestStatus = 'pending' | 'approved' | 'borrowed' | 'return_initiated' | 'returned' | 'denied';
export type HandoverMethod = 'ship' | 'meetup' | 'pickup';
export type ReturnMethod = 'ship' | 'meetup' | 'dropoff';

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

  // Handover fields
  handover_method: HandoverMethod | null;
  handover_address: string | null;
  handover_datetime: string | null;
  handover_instructions: string | null;
  handover_tracking: string | null;
  handover_completed_at: string | null;

  // Return fields
  return_method: ReturnMethod | null;
  return_address: string | null;
  return_datetime: string | null;
  return_instructions: string | null;
  return_tracking: string | null;
  return_initiated_at: string | null;

  // Last message info (for chat list)
  last_message_at: string | null;
  last_message_content: string | null;

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
  | 'overdue'
  | 'new_message';

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

export interface Message {
  id: string;
  borrow_request_id: string;
  sender_id: string;
  content: string;
  read_by_owner: boolean;
  read_by_borrower: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageWithSender extends Message {
  sender?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface ChatSummary {
  request: BorrowRequestWithDetails;
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  } | null;
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

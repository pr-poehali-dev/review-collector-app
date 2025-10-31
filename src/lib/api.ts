const API_BASE = 'https://functions.poehali.dev';

const AUTH_URL = 'https://functions.poehali.dev/c46a0d76-d904-4090-9ca4-ec86d362e6de';
const REVIEWS_URL = 'https://functions.poehali.dev/f31efc44-087d-4d5f-9dd4-1bd1ab8c0a3d';

export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_blocked?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface Review {
  id: number;
  user_id: number;
  marketplace_id: number;
  marketplace_name: string;
  marketplace_icon: string;
  user_username: string;
  article: string;
  product_link?: string;
  seller_name?: string;
  rating: number;
  review_text: string;
  moderation_screenshots: string[];
  public_photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

export const api = {
  auth: {
    register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, username, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      return response.json();
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    },
  },

  reviews: {
    getAll: async (params?: {
      status?: string;
      marketplace_id?: number;
      article?: string;
      seller?: string;
      user_id?: number;
      limit?: number;
    }): Promise<ReviewsResponse> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const url = `${REVIEWS_URL}?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },

    create: async (reviewData: {
      marketplace_id: number;
      article: string;
      product_link?: string;
      seller_name?: string;
      rating: number;
      review_text: string;
      moderation_screenshots?: string[];
      public_photos?: string[];
    }, userId: string): Promise<{ success: boolean; review_id: number }> => {
      const response = await fetch(REVIEWS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }
      return response.json();
    },

    moderate: async (
      reviewId: number,
      status: 'approved' | 'rejected',
      adminComment: string,
      userId: string
    ): Promise<{ success: boolean }> => {
      const response = await fetch(REVIEWS_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          review_id: reviewId,
          status,
          admin_comment: adminComment,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate review');
      }
      return response.json();
    },
  },
};

export const storage = {
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
};

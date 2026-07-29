/**
 * Common types for the frontend application
 */

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: {
    _id: string;
    name: string;
    slug: string;
  };
  propertyType: {
    _id: string;
    name: string;
    slug: string;
  };
  purpose: {
    _id: string;
    name: string;
    slug: string;
  };
  images: string[];
  features: Array<{
    _id: string;
    name: string;
    icon?: string;
  }>;
  labels: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  status: 'active' | 'inactive' | 'sold' | 'rented';
  verified: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
  };
}

export interface Location {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  propertyCount?: number;
}

export interface PropertyType {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Purpose {
  _id: string;
  name: string;
  slug: string;
}

export interface Feature {
  _id: string;
  name: string;
  icon?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: 'user' | 'admin';
  verified: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SearchFilters {
  search?: string;
  location?: string;
  propertyType?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  verified?: boolean;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

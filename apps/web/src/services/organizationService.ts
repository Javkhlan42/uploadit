import { Organization } from '../types/organization';

// Use internal service URL for server-side, public URL for client-side
const API_BASE_URL = typeof window === 'undefined' 
  ? (process.env.API_URL || 'http://backend-service:4000/api')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

export const organizationService = {
  // Get all organizations with optional filters
  async getOrganizations(category?: string, search?: string): Promise<Organization[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'Бүх ангилал') {
        params.append('category', category);
      }
      if (search) {
        params.append('search', search);
      }

      const url = `${API_BASE_URL}/organizations${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Get organization by ID
  async getOrganizationById(id: number): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get featured organizations
  async getFeaturedOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured organizations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured organizations:', error);
      throw error;
    }
  }
};

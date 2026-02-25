// Admin data management using localStorage

export interface Team {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Collection {
  id: string;
  image: string;
  title: string;
  description: string;
  category_id: string;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  collection_id: string;
  material_used: string[];
  perfect_for: string[];
  features: string[];
}

export interface Service {
  id: string;
  name: string;
  image: string;
  description: string;
  price: string;
}

export interface Author {
  id: string;
  name: string;
  image: string;
  bio: string;
}

export interface Blog {
  id: string;
  tag: string;
  author_id: string;
  title: string;
  content: string;
  image: string;
  tags: string[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_type: string;
  project_budget: string;
  project_timeline: string;
  project_detail: string;
  reference_file: string;
  created_at: string;
}

export interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  budget_range: string;
  preferred_style: string;
  wall_dimension: string;
  project_deadline: string;
  project_description: string;
  reference_image: string;
  created_at: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  project: string;
  rating: number;
  text: string;
  image: string;
}

class AdminDataManager {
  private getStorageKey(entity: string): string {
    return `admin_${entity}`;
  }

  private getData<T>(entity: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(entity));
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Generic CRUD operations
  getAll<T>(entity: string): T[] {
    return this.getData<T>(entity);
  }

  getById<T extends { id: string }>(entity: string, id: string): T | undefined {
    const data = this.getData<T>(entity);
    return data.find(item => item.id === id);
  }

  create<T extends { id?: string }>(entity: string, item: Omit<T, 'id'>): T {
    const data = this.getData<T>(entity);
    const newItem = { ...item, id: this.generateId() } as T;
    data.push(newItem);
    this.setData(entity, data);
    return newItem;
  }

  update<T extends { id: string }>(entity: string, id: string, updates: Partial<T>): T | null {
    const data = this.getData<T>(entity);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates };
    this.setData(entity, data);
    return data[index];
  }

  delete<T extends { id: string }>(entity: string, id: string): boolean {
    const data = this.getData<T>(entity);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    data.splice(index, 1);
    this.setData(entity, data);
    return true;
  }

  // Initialize with sample data
  initializeSampleData(): void {
    // Initialize categories
    const categories = this.getAll<Category>('categories');
    if (categories.length === 0) {
      this.create<Category>('categories', {
        name: 'Minimalist',
        description: 'Clean and simple designs'
      });
      this.create<Category>('categories', {
        name: 'Abstract',
        description: 'Creative abstract artwork'
      });
    }

    // Initialize authors
    const authors = this.getAll<Author>('authors');
    if (authors.length === 0) {
      this.create<Author>('authors', {
        name: 'John Doe',
        image: '/placeholder.svg',
        bio: 'Creative director and design expert'
      });
    }
  }
}

export const adminData = new AdminDataManager();

import { supabase, handleSupabaseError } from '../../config/supabase';

// Centralized Supabase client with enhanced error handling
export class SupabaseClient {
  constructor() {
    this.client = supabase;
  }

  // Generic query method with error handling
  async query(table, operation = 'select', options = {}) {
    try {
      let query = this.client.from(table);
      
      switch (operation) {
        case 'select':
          if (options.columns) query = query.select(options.columns);
          if (options.filters) {
            options.filters.forEach(filter => {
              query = query.filter(filter.column, filter.operator, filter.value);
            });
          }
          if (options.orderBy) {
            query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
          }
          if (options.limit) query = query.limit(options.limit);
          if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
          break;
          
        case 'insert':
          query = query.insert(options.data);
          break;
          
        case 'update':
          query = query.update(options.data);
          if (options.filters) {
            options.filters.forEach(filter => {
              query = query.filter(filter.column, filter.operator, filter.value);
            });
          }
          break;
          
        case 'delete':
          if (options.filters) {
            options.filters.forEach(filter => {
              query = query.filter(filter.column, filter.operator, filter.value);
            });
          }
          query = query.delete();
          break;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Database query error for ${table}:`, error);
      return { 
        data: null, 
        error: handleSupabaseError(error, `${operation} operation on ${table}`) 
      };
    }
  }

  // Real-time subscription helper
  subscribe(table, callback, filter = null) {
    try {
      const subscription = this.client
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: table,
            ...(filter && { filter })
          }, 
          callback
        )
        .subscribe();
      
      return subscription;
    } catch (error) {
      console.error(`Real-time subscription error for ${table}:`, error);
      return null;
    }
  }

  // Batch operations
  async batch(operations) {
    const results = [];
    const errors = [];
    
    for (const operation of operations) {
      try {
        const result = await operation();
        results.push(result);
      } catch (error) {
        errors.push(error);
      }
    }
    
    return { results, errors, success: errors.length === 0 };
  }

  // Check connection health
  async healthCheck() {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { connected: true, error: null };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

// Export singleton instance
export const db = new SupabaseClient();
export default db;

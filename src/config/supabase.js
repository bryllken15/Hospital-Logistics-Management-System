import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database connection utilities
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { connected: false, error: error.message };
  }
};

// Error handling utilities
export const handleSupabaseError = (error, operation = 'database operation') => {
  console.error(`Supabase error during ${operation}:`, error);
  
  if (error.code === 'PGRST301') {
    return 'No data found';
  } else if (error.code === 'PGRST116') {
    return 'Invalid request parameters';
  } else if (error.code === '42501') {
    return 'Access denied - insufficient permissions';
  } else if (error.code === '23505') {
    return 'Duplicate entry - record already exists';
  } else if (error.code === '23503') {
    return 'Referenced record not found';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

// Real-time subscription utilities
export const createRealtimeSubscription = (table, callback, filter = null) => {
  let subscription;
  
  try {
    let query = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...(filter && { filter })
        }, 
        callback
      );
    
    subscription = query.subscribe();
    return subscription;
  } catch (error) {
    console.error(`Failed to create realtime subscription for ${table}:`, error);
    return null;
  }
};

// Cleanup subscription
export const cleanupSubscription = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// Batch operations utility
export const batchOperation = async (operations) => {
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
};

// Browser console debugging utilities (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Manual connection test
  window.testDBConnection = async () => {
    console.log('🔍 Testing database connection...');
    const startTime = Date.now();
    try {
      const { connected, error } = await checkConnection();
      const responseTime = Date.now() - startTime;
      
      if (connected) {
        console.log(`✅ Database connected successfully (${responseTime}ms)`);
        return { connected: true, responseTime };
      } else {
        console.error(`❌ Database connection failed: ${error}`);
        return { connected: false, error, responseTime };
      }
    } catch (error) {
      console.error(`❌ Connection test error: ${error.message}`);
      return { connected: false, error: error.message, responseTime: Date.now() - startTime };
    }
  };

  // Health check with detailed output
  window.checkDBHealth = async () => {
    console.log('🏥 Running comprehensive database health check...');
    const results = {
      connection: null,
      tables: [],
      realtime: null,
      performance: null
    };

    try {
      // Test basic connection
      console.log('📡 Testing basic connection...');
      results.connection = await window.testDBConnection();

      // Test table access
      console.log('📊 Testing table access...');
      const tables = ['users', 'projects', 'procurement_requests', 'system_activities'];
      for (const table of tables) {
        try {
          const startTime = Date.now();
          const { data, error } = await supabase.from(table).select('count').limit(1);
          const responseTime = Date.now() - startTime;
          
          results.tables.push({
            name: table,
            status: error ? 'error' : 'success',
            responseTime,
            error: error?.message
          });
          
          console.log(`${error ? '❌' : '✅'} ${table}: ${error ? error.message : 'OK'} (${responseTime}ms)`);
        } catch (error) {
          results.tables.push({
            name: table,
            status: 'error',
            responseTime: 0,
            error: error.message
          });
          console.log(`❌ ${table}: ${error.message}`);
        }
      }

      // Test real-time connection
      console.log('⚡ Testing real-time connection...');
      try {
        const channel = supabase.channel('health_check');
        const subscription = channel.subscribe();
        
        const realtimeResult = await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ connected: false, error: 'Timeout' });
          }, 5000);
          
          subscription.subscribe((status) => {
            clearTimeout(timeout);
            resolve({ connected: status === 'SUBSCRIBED', status });
          });
        });
        
        results.realtime = realtimeResult;
        console.log(`${realtimeResult.connected ? '✅' : '❌'} Real-time: ${realtimeResult.connected ? 'Connected' : realtimeResult.error}`);
      } catch (error) {
        results.realtime = { connected: false, error: error.message };
        console.log(`❌ Real-time: ${error.message}`);
      }

      // Performance test
      console.log('⚡ Testing performance...');
      try {
        const startTime = Date.now();
        const { data, error } = await supabase.from('users').select('id').limit(10);
        const responseTime = Date.now() - startTime;
        
        results.performance = {
          responseTime,
          status: error ? 'error' : 'success',
          error: error?.message
        };
        
        console.log(`${error ? '❌' : '✅'} Performance test: ${error ? error.message : `${responseTime}ms`}`);
      } catch (error) {
        results.performance = { responseTime: 0, status: 'error', error: error.message };
        console.log(`❌ Performance test: ${error.message}`);
      }

      console.log('📋 Health check summary:', results);
      return results;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { error: error.message };
    }
  };

  // Get database statistics
  window.getDBStats = async () => {
    console.log('📊 Gathering database statistics...');
    const stats = {
      tables: {},
      totalRows: 0,
      connectionInfo: {
        url: process.env.REACT_APP_SUPABASE_URL,
        hasCredentials: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
        environment: process.env.NODE_ENV
      }
    };

    const tables = ['users', 'projects', 'procurement_requests', 'purchase_orders', 'inventory_items', 'system_activities'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          stats.tables[table] = { error: error.message };
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          stats.tables[table] = { count: count || 0 };
          stats.totalRows += count || 0;
          console.log(`✅ ${table}: ${count || 0} rows`);
        }
      } catch (error) {
        stats.tables[table] = { error: error.message };
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    console.log('📊 Database statistics:', stats);
    return stats;
  };

  // Test real-time connection specifically
  window.testRealtimeConnection = async () => {
    console.log('⚡ Testing real-time connection...');
    try {
      const channel = supabase.channel('realtime_test');
      const subscription = channel.subscribe();
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log('❌ Real-time connection timeout');
          resolve({ connected: false, error: 'Timeout' });
        }, 5000);
        
        subscription.subscribe((status) => {
          clearTimeout(timeout);
          const connected = status === 'SUBSCRIBED';
          console.log(`${connected ? '✅' : '❌'} Real-time status: ${status}`);
          resolve({ connected, status });
        });
      });
    } catch (error) {
      console.log(`❌ Real-time test error: ${error.message}`);
      return { connected: false, error: error.message };
    }
  };

  // Log connection info on startup
  console.log('🔧 Database debugging utilities loaded:');
  console.log('  - window.testDBConnection() - Test basic connection');
  console.log('  - window.checkDBHealth() - Comprehensive health check');
  console.log('  - window.getDBStats() - Get database statistics');
  console.log('  - window.testRealtimeConnection() - Test real-time connection');
  
  // Auto-run basic connection test if debug mode is enabled
  if (process.env.REACT_APP_DEBUG_MODE === 'true') {
    console.log('🐛 Debug mode enabled - running automatic connection test...');
    setTimeout(() => {
      window.testDBConnection();
    }, 1000);
  }
}

export default supabase;

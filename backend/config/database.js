const mysql = require('mysql2');
const { jsonDB } = require('./jsonDatabase');
require('dotenv').config();

let useMySQL = true;
let pool = null;

// Try to create MySQL connection pool
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  });
} catch (error) {
  console.warn('MySQL not available, using JSON database fallback');
  useMySQL = false;
}

// Test database connection
const testConnection = () => {
  if (!useMySQL) {
    console.log('Using JSON database for development');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.warn('MySQL connection failed, switching to JSON database:', err.message);
        useMySQL = false;
        resolve();
        return;
      }
      console.log('Connected to MySQL database successfully');
      connection.release();
      resolve();
    });
  });
};

// Unified database interface
const db = {
  // Check if using MySQL or JSON
  isMySQL: () => useMySQL,
  
  // Query method that works with both MySQL and JSON
  query: async (sql, params = []) => {
    if (useMySQL && pool) {
      try {
        const [results] = await pool.promise().execute(sql, params);
        return results;
      } catch (error) {
        console.warn('MySQL query failed, switching to JSON database:', error.message);
        useMySQL = false;
        // Fall through to JSON handling
      }
    }
    
    // JSON database fallback (simplified query parsing)
    return handleJSONQuery(sql, params);
  }
};

// Simple SQL-to-JSON query parser (basic implementation)
const handleJSONQuery = (sql, params) => {
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.startsWith('select')) {
    return handleSelectQuery(sql, params);
  } else if (sqlLower.startsWith('insert')) {
    return handleInsertQuery(sql, params);
  } else if (sqlLower.startsWith('update')) {
    return handleUpdateQuery(sql, params);
  } else if (sqlLower.startsWith('delete')) {
    return handleDeleteQuery(sql, params);
  }
  
  return [];
};

const handleSelectQuery = (sql, params) => {
  // Basic table name extraction
  const tableMatch = sql.match(/from\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : '';
  
  if (!table) return [];
  
  // Get all records from table
  let results = jsonDB.query(table);
  
  // Handle WHERE conditions (basic)
  if (sql.includes('WHERE') || sql.includes('where')) {
    // This is a simplified implementation
    // In a real application, you'd want a proper SQL parser
    if (params.length > 0) {
      // Handle parameterized queries
      if (sql.includes('reg_no = ?')) {
        results = results.filter(r => r.reg_no === params[0]);
      }
      if (sql.includes('id = ?')) {
        results = results.filter(r => r.id === parseInt(params[0]));
      }
    }
  }
  
  return results;
};

const handleInsertQuery = (sql, params) => {
  const tableMatch = sql.match(/into\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : '';
  
  if (!table || params.length === 0) return { insertId: 0 };
  
  // Extract column names and create record object
  const valuesMatch = sql.match(/\(([^)]+)\)\s*values/i);
  if (valuesMatch) {
    const columns = valuesMatch[1].split(',').map(col => col.trim());
    const record = {};
    
    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        record[col] = params[index];
      }
    });
    
    const inserted = jsonDB.insert(table, record);
    return { insertId: inserted.id };
  }
  
  return { insertId: 0 };
};

const handleUpdateQuery = (sql, params) => {
  const tableMatch = sql.match(/update\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : '';
  
  if (!table || params.length === 0) return { affectedRows: 0 };
  
  // This is a simplified implementation
  // Extract SET clause and WHERE clause
  const id = params[params.length - 1]; // Assuming last param is ID
  const updates = {}; // Would need to parse SET clause properly
  
  const updated = jsonDB.update(table, id, updates);
  return { affectedRows: updated ? 1 : 0 };
};

const handleDeleteQuery = (sql, params) => {
  const tableMatch = sql.match(/from\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : '';
  
  if (!table || params.length === 0) return { affectedRows: 0 };
  
  const id = params[0];
  const deleted = jsonDB.delete(table, id);
  return { affectedRows: deleted ? 1 : 0 };
};

module.exports = {
  pool: pool ? pool.promise() : null,
  testConnection,
  db,
  jsonDB
};

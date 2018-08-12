

// default environment variables if no configuration is applied
// PGHOST='localhost'
// PGUSER=process.env.USER
// PGDATABASE=process.env.USER
// PGPASSWORD=null
// PGPORT=5432

const { Pool } = require('pg')

const pool = new Pool();

// pool.query finds the first client, runs the query and releases it, all internaly
// may cause issues if transactions are required
module.exports = {
  query: (text, params) => pool.query(text, params)
}


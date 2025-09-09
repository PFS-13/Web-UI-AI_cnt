const { Pool } = require("pg");

// gunakan connection string langsung dari Neon
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_e0ZODtVxIpP8@ep-ancient-glade-adflm0v6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // Neon pakai SSL
  },
});

module.exports = pool;

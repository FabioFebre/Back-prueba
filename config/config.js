require('dotenv').config();

module.exports = {
  development: {
    username: 'sg_db_2ful_user',
    password: '1c1FnOlFXfKJzSVjafpldW5vAFymDTI4',
    database: 'sg_db_2ful',
    host: 'dpg-d5peuhhr0fns73evtke0-a.oregon-postgres.render.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

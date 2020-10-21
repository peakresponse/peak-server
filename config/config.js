require('dotenv').config();

if (!process.env.DATABASE_TEST_URL) {
  process.env.DATABASE_TEST_URL = `${process.env.DATABASE_URL}_test`;
}

module.exports = {
  development: {
    // logging: false,
    use_env_variable: 'DATABASE_URL',
  },
  test: {
    logging: false,
    use_env_variable: 'DATABASE_TEST_URL',
    pool: {
      max: 1,
    },
  },
  production: {
    logging: false,
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: !process.env.DATABASE_SELFSIGNED_SSL,
      },
    },
  },
};

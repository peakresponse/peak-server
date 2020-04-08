require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL'
  },
  test: {
    logging: false,
    use_env_variable: 'DATABASE_TEST_URL'
  },
  production: {
    logging: false,
    use_env_variable: 'DATABASE_URL'
  }
};

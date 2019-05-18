// This config file will assist in dynamically setting development environment key-value pairs.
// This gives us the flexibility to easily test the application without modifying key function calls.

// If NODE_ENV is not set, we will default to "development".
const env = process.env.NODE_ENV || 'development';

// If the environment is defined as "development", read in dev variables from our configuration file.
if (env === 'development') {
    // Load dev key-value pairs from our config file into our process environment.

    const config = require('./config.json');
    const envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}

// Production environment variables will be set in the production environment.
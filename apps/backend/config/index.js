// backend/config/index.js
console.log('Environment Variables Loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);

module.exports = {
	environment: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 8000,
	dbFile: process.env.DB_FILE,
	jwtConfig: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
};

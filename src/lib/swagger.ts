import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: '하 API',
			version: 'v1',
			description: 'SvelteKit API documentation'
		}
	},
	apis: ['./src/routes/api/v1/**/*.ts']
});

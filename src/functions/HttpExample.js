const { app } = require('@azure/functions');

app.http('HttpExample', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'all testers';

        return { body: `Hello, ${name}! This is a test!` };
    }
});

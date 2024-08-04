const { app } = require('@azure/functions');

app.http('HttpExample', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const clientPrincipal = request.headers["x-ms-client-principal"];
        if (!clientPrincipal) {
            // unauthorized
            return {
                status: 401,
                body: 'Unauthorized'
            };
        }

        const name = request.query.get('name') || await request.text() || 'all testers';

        return { body: `Hello, ${name}! This is a test!` };
    }
});

const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Users");

/**
 * Get all users.
 * @returns {object} The response object.
 */
app.http('GetUsers', {
    methods: ['GET'],
    route: 'users',
    authLevel: 'function',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get all users.');

        const { resources: users } = await container.items
            .query("SELECT * FROM c")
            .fetchAll();

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(users),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

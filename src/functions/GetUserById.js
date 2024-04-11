const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Users");

/**
 * Get the user by their ID.
 * @returns {object} The response object.
 */
app.http('GetUserById', {
    methods: ['GET'],
    route: 'users/{userId}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get user by ID.');

        const userId = request.params.userId;

        const { resources: user } = await container.items
            .query(`SELECT * FROM c WHERE c.userId = "${userId}"`)
            .fetchAll();

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(user[0]),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

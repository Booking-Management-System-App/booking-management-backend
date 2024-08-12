const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Users");

/**
 * Deletes a user with the given id.
 * @returns {object} The response object.
 */
app.http('DeleteUser', {
    methods: ['DELETE'],
    route: 'users/{userId}',
    authLevel: 'function',
    handler: async (request, context) => {
        const userId = request.params.userId;

        // Get the user with the given id
        const { resources: [user] } = await container.items
            .query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            })
            .fetchAll();

        // Check if the user exists
        if (!user) {
            context.res = {
                status: 404,
                body: JSON.stringify({ message: "User not found." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        await container.item(user.id, user.userId).delete();

        context.res = {
            status: 204,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

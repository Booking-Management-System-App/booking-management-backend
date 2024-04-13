const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Users");

/**
 * Updates the user with the given id.
 * @returns {object} The response object.
 */
app.http('UpdateUser', {
    methods: ['PUT'],
    route: 'users/{userId}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Grab the json object from the request body
        const requestBody = await request.json();
        const userId = request.params.userId;
        const name = requestBody.name;
        const email = requestBody.email;
        const phone = requestBody.phone;

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

        const updatedUser = {
            userId: userId,
            name: name,
            email: email,
            phone: phone
        };

        await container.items.upsert(updatedUser);

        context.res = {
            status: 200,
            body: JSON.stringify(updatedUser),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Bookings");

/**
 * Get all bookings for the given user.
 * @returns {object} The response object.
 */
app.http('GetUserBookings', {
    methods: ['GET'],
    route: 'bookings/user/{userId}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get user bookings.');

        const userId = request.params.userId;

        const { resources: bookings } = await container.items
            .query(`SELECT * FROM c WHERE c.userId = "${userId}"`)
            .fetchAll();

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(bookings),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

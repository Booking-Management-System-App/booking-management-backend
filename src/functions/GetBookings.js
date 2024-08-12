const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Bookings");

/**
 * Get all bookings.
 * @returns {object} The response object.
 */
app.http('GetBookings', {
    methods: ['GET'],
    route: 'bookings',
    authLevel: 'function',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get all bookings.');

        const { resources: bookings } = await container.items
            .query("SELECT * FROM c")
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

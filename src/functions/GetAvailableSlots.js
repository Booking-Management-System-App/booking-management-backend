const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("AvailableSlots");

/**
 * Get all available slots.
 * @returns {object} The response object.
 */
app.http('GetAvailableSlots', {
    methods: ['GET'],
    route: 'available-slots',
    authLevel: 'function',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get all available slots.');

        const { resources: availableSlots } = await container.items
            .query("SELECT * FROM c")
            .fetchAll();

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(availableSlots),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

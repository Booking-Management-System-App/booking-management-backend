const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env["CosmosDbEndpoint"];
const key = process.env["CosmosDbKey"];
const client = new CosmosClient({ endpoint, key });
const database = client.database("booking-management-system");
const container = database.container("AvailableSlots");

/**
 * Get all available slots.
 * @returns {object} The response object.
 */
app.http('available-slots', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
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

const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("AvailableSlots");

/**
 * Get the available slot with the given id.
 * @returns {object} The response object.
 */
app.http('GetAvailableSlotById', {
    methods: ['GET'],
    route: 'available-slots/{slotId}',
    authLevel: 'function',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get available slot by ID.');

        const slotId = request.params.slotId;

        const { resources: availableSlot } = await container.items
            .query(`SELECT * FROM c WHERE c.slotId = "${slotId}"`)
            .fetchAll();
        
        if (!availableSlot || availableSlot.length === 0) {
            context.res = {
                status: 404,
                body: JSON.stringify({ message: "Slot not found." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(availableSlot[0]),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});
const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const slotsContainer = database.container("AvailableSlots");

/**
 * Deletes an existing slot
 * @returns {object} The response object.
 */
app.http('DeleteSlot', {
    methods: ['DELETE'],
    route: 'slots/{slotId}',
    authLevel: 'function',
    handler: async (request, context) => {
        // Get the slot id from the route parameters
        const slotId = request.params.slotId;

        // Get the slot with the given id
        const { resources: [slot] } = await slotsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.slotId = @slotId",
                parameters: [{ name: "@slotId", value: slotId }]
            })
            .fetchAll();

        // Check if the slot exists
        if (!slot) {
            context.res = {
                status: 404,
                body: JSON.stringify({ message: "Slot not found." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        // Check if the slot is already booked
        if (slot.booked) {
            context.res = {
                status: 400,
                body: JSON.stringify({ message: "Slot cannot be deleted if it is booked" }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        // Delete the slot
        await slotsContainer.item(slot.id, slot.date).delete();

        context.res = {
            status: 200,
            body: JSON.stringify({ message: "Slot deleted successfully." }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return context.res;
    }
});

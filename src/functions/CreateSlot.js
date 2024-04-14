const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const slotsContainer = database.container("AvailableSlots");

/**
 * Creates a new slot
 * @returns {object} The response object.
 */
app.http('CreateSlot', {
    methods: ['POST'],
    route: 'slots',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Grab the json object from the request body
        const requestBody = await request.json();
        const date = requestBody.date;
        const startTime = requestBody.startTime;
        const endTime = requestBody.endTime;

        // Check if the slot already exists
        const { resources: [existingSlot] } = await slotsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.date = @date AND c.startTime = @startTime AND c.endTime = @endTime",
                parameters: [
                    { name: "@date", value: date },
                    { name: "@startTime", value: startTime },
                    { name: "@endTime", value: endTime }
                ]
            })
            .fetchAll();

        if (existingSlot) {
            context.res = {
                status: 400,
                body: JSON.stringify({ message: "Slot already exists." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        const slotId = Math.floor(Math.random() * 100000).toString();
        const booked = false;

        // Create the slot
        const slot = {
            slotId: slotId,
            date: date,
            startTime: startTime,
            endTime: endTime,
            booked: booked
        };

        await slotsContainer.items.create(slot);

        context.res = {
            status: 201,
            body: JSON.stringify({ message: "Slot created successfully." }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

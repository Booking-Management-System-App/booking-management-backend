const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const slotsContainer = database.container("AvailableSlots");
const bookingsContainer = database.container("Bookings");

/**
 * Book the available slot with the given id.
 * @returns {object} The response object.
 */
app.http('BookSlot', {
    methods: ['POST'],
    route: 'book-slot',
    authLevel: 'function',
    handler: async (request, context) => {
        // Grab the json object from the request body
        const requestBody = await request.json();
        const slotId = requestBody.slotId;
        const userId = requestBody.userId;
        const date = requestBody.date;

        // Get the slot with the given id
        const { resources: [slot] } = await slotsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.slotId = @slotId AND c.date = @date",
                parameters: [{ name: "@slotId", value: slotId }, { name: "@date", value: date }]
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
                body: JSON.stringify({ message: "Slot is already booked." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        const booking = {
            bookingId: Math.floor(Math.random() * 100000).toString(),
            userId: userId,
            slotId: slotId,
            bookingDate: new Date().toISOString()
        };

        // Create a new booking in the database, then update the slot to be booked
        await bookingsContainer.items.create(booking);
        
        // Update the slot to be booked
        slot.booked = true;
        await slotsContainer.items.upsert(slot);

        context.res = {
            status: 200,
            body: JSON.stringify(booking),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

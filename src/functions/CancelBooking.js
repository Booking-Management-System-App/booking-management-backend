const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const slotsContainer = database.container("AvailableSlots");
const bookingsContainer = database.container("Bookings");

/**
 * Cancel the booking with the given id.
 * @returns {object} The response object.
 */
app.http('CancelBooking', {
    methods: ['DELETE'],
    route: 'bookings/{bookingId}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const bookingId = request.params.bookingId;

        // Get the booking with the given id
        const { resources: [booking] } = await bookingsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.bookingId = @bookingId",
                parameters: [{ name: "@bookingId", value: bookingId }]
            })
            .fetchAll();

        // Check if the booking exists
        if (!booking) {
            context.res = {
                status: 404,
                body: JSON.stringify({ message: "Booking not found." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        await bookingsContainer.item(booking.id, booking.bookingDate).delete();

        // Update the slot to be available
        const { resources: [slot] } = await slotsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.slotId = @slotId",
                parameters: [{ name: "@slotId", value: booking.slotId }]
            })
            .fetchAll();

        slot.booked = false;
        await slotsContainer.item(slot.id, slot.date).replace(slot);

        context.res = {
            status: 204,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Bookings");

/**
 * Get the details of a booking.
 * @returns {object} The response object.
 */
app.http('GetBookingDetails', {
    methods: ['GET'],
    route: 'bookings/{bookingId}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function to get booking details.');

        const bookingId = request.params.bookingId;

        const { resources: booking } = await container.items
            .query(`SELECT * FROM c WHERE c.bookingId = "${bookingId}"`)
            .fetchAll();

        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(booking[0]),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

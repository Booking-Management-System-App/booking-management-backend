const { app } = require('@azure/functions');

const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env["CosmosDbConnectionString"];
const client = new CosmosClient(connectionString);
const database = client.database("booking-management-system");
const container = database.container("Users");

/**
 * Creates a new user.
 * @returns {object} The response object.
 */
app.http('CreateUser', {
    methods: ['POST'],
    route: 'users',
    authLevel: 'function',
    handler: async (request, context) => {
        // Grab the json object from the request body
        const requestBody = await request.json();
        const userId = requestBody.userId;
        const name = requestBody.name;
        const email = requestBody.email;
        const phone = requestBody.phone;

        // Check if the user already exists
        const { resources: [user] } = await container.items
            .query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            })
            .fetchAll();

        // Return an error if the user already exists 
        if (user) {
            context.res = {
                status: 400,
                body: JSON.stringify({ message: "User already exists." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return context.res;
        }

        const newUser = {
            userId: userId,
            name: name,
            email: email,
            phone: phone
        };

        await container.items.create(newUser);

        context.res = {
            status: 201,
            body: JSON.stringify(newUser),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.res;
    }
});

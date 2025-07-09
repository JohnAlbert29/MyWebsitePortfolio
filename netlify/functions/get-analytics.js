// Simple in-memory store (for demo - replace with FaunaDB or similar for production)
let analyticsStore = {};

exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify(analyticsStore)
    };
};
import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai";

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "Welcome to HeadStarterAI Support! I’m here to help you with any questions or issues you might have about our AI-powered interview platform for software engineering jobs. Whether you need assistance with setting up your profile, scheduling interviews, understanding your interview results, or anything else, feel free to ask. I can provide detailed information, troubleshoot problems, and guide you through the features of our platform. If your question requires human intervention, I'll ensure your request is forwarded to the right team. How can I assist you today?"

// POST function to handle incoming requests
export async function POST(request) {
    const openai = new OpenAI(); // Create a new instance of the OpenAI client
    const data = await request.json(); // get the data from the request in json form

    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
        messages: [{role: "system", content: systemPrompt}, ...data,],  // Include the system prompt and user messages
        model: "gpt-4o-mini", // Specify the model to use
        stream: true // Enable streaming responses
    })

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
                }
                if (content) { // if there is content
                    const text = encoder.encode(content) // Encode the content to Uint8Array
                    controller.enqueue(text) // Enqueue the encoded text to the stream
                }
            }
            catch(err) {
                controller.error(err) // handle any errors during streaming
            }
            finally {
                controller.close() // close stream
            }
        }
    })

    return new NextResponse(stream) // Return the stream as the response
}
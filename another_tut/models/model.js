const tf = require('@tensorflow/tfjs');
const tfNode = require('@tensorflow/tfjs-node');
const path = require('path');
const { fileURLToPath } = require('url');

// Model configuration
const MODEL_NAME = "llama-2-7b.Q5_K_M.gguf";
const __filename = fileURLToPath(require.meta.url);
const __dirname = path.dirname(__filename);
const modelsDirectory = path.join(__dirname, "../models");
const modelsPath = path.join(modelsDirectory, MODEL_NAME);

let model;

// Load the model
async function loadModel() {
    model = await tfNode.loadGraphModel(`file://${modelsPath}`);
    console.log('Model loaded successfully');
}

// Define the function to use the model
async function getModelResponse(prompt) {
    if (!model) {
        throw new Error('Model not loaded');
    }
    const inputTensor = tf.tensor([prompt]);
    const result = model.predict(inputTensor);
    const response = result.dataSync(); // Convert tensor to readable response
    return response;
}

// Export the functions
module.exports = {
    loadModel,
    getModelResponse
};

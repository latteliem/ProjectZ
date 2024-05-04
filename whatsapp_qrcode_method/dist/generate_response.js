const tf = require('@tensorflow/tfjs-node');
const { GPT2 } = require('tfjs-gpt-2');

async function generateResponse(message) {
    const model = await GPT2.load();
    const tokenizer = await GPT2.getTokenizer();

    const inputIds = tokenizer.encode(message);
    const inputTensor = tf.tensor2d([inputIds], [1, inputIds.length], 'int32');

    const outputTensor = model.predict(inputTensor);
    const generatedIds = outputTensor.argMax(-1).arraySync()[0];
    
    const generatedText = tokenizer.decode(generatedIds);
    return generatedText;
}

// Example usage:
const message = "Hello from JavaScript!";
generateResponse(message)
    .then(response => {
        console.log("Generated response:", response);
        // Use the generated response for further processing
    })
    .catch(error => {
        console.error("Error generating response:", error);
    });

module.exports = {
    generateResponse
};


// # from transformers import GPT2LMHeadModel, GPT2Tokenizer
// # import sys

// # def generate_response(message):
// #     model = GPT2LMHeadModel.from_pretrained("gpt2")
// #     tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    
// #     input_ids = tokenizer.encode(message, return_tensors="pt")
// #     output = model.generate(input_ids, max_length=200,
// #                             num_beams=5, no_repeat_ngram_size=2,
// #                             top_k=50, top_p=0.95,
// #                             temperature=0.7)
// #     generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
// #     return generated_text

// # if __name__ == "__main__":
// #     message = sys.argv[1]
// #     response = generate_response(message)
// #     print(response)


from transformers import GPT2LMHeadModel, GPT2Tokenizer

def generate_response(message):
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    
    input_ids = tokenizer.encode(message, return_tensors="pt")
    output = model.generate(input_ids, max_length=200,
                            num_beams=5, no_repeat_ngram_size=2,
                            top_k=50, top_p=0.95,
                            temperature=0.7)
    generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
    return generated_text

if __name__ == "__main__":
    import sys
    message = sys.argv[1]  # Get the message from command-line arguments
    response = generate_response(message)
    print(response)  # Output the response to stdout for the WhatsApp bot to capture

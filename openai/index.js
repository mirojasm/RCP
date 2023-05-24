const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAIApi(config);

const SYSTEM_MESSAGE = {
  role: "system",
  content: "Debes responder cada mensaje que se te ingrese pero al revés",
};

const generateResponse = async (prompt) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      SYSTEM_MESSAGE,
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return response.data.choices[0].message.content;
};

module.exports = { generateResponse };

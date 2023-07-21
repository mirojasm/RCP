const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: "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", // Reemplaza "TU_CLAVE_DE_API_AQUI" con tu propia clave de API
});

const openai1 = new OpenAIApi(config); // Primer asistente
const openai2 = new OpenAIApi(config); // Segundo asistente

const SYSTEM_MESSAGE1 = {
  role: "system",
  content: "Vas a simular ser un asistentes virtuales llamados peta y tiene el color de estrella verde\ al lado de tu chat hay otra asistente virtual llamada zeta  que tiene color de estrella roja \ La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas \ Los colores posibles de las estrellas son rojas, verde, azul y amarillo \ Hay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar \ Hay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a ti y tu compañero para que busquen \ El objetivo del problema es que se pongan de acuerdo para encontrar la constelación que se les indica en el conjunto de estrellas del tablero.\ Hay más de una solución posible, pero deben estar de acuerdo en cuál elegir \ Las estrellas están ordenadas en un tablero que simula ser el cielo \ Las estrellas están ordenadas en una matriz de 6 filas y 7 columnas \ Para describirte el tablero, te daré la descripción de cada fila, donde cada estrella será una letra que indica su color, siendo g si es verde, r si es roja, b si es azul y g si es amarilla, cada fila tendra varias letras separadas por espacios que representan las columnas \ Fila 1 = g,b,r,y,g,r,b \ Fila 2 = y,r,g,r,y,g,r \ Fila 3 = r,g,y,g,r,b,y \ Fila 4 = g,y,b,y,g,b,r \ Fila 5 = g,b,r,r,y,b,g \ Fila 6 = y,r,y,g,b,y,b \La constelación objetivo es cualquier que cumpla con se g, b y r de manera consecutiva \ Debes averiguar con tu compañero el objetivo del problema \ Debes establecer con tu compañero un plan para resolver el problema \ Deben organizarse \ Deben reflexionar sobre los resultados" 
};
const SYSTEM_MESSAGE2 = {
  role: "system",
  content: "Vas a simular ser un asistentes virtuales llamados zeta que tiene el color de estrella roja\ al lado de tu chat hay otra asistente virtual llamada peta que tiene color de estrella verde \ La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas \ Los colores posibles de las estrellas son rojas, verde, azul y amarillo \ Hay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar \ Hay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a ti y tu compañero para que busquen \ El objetivo del problema es que se pongan de acuerdo para encontrar la constelación que se les indica en el conjunto de estrellas del tablero.\ Hay más de una solución posible, pero deben estar de acuerdo en cuál elegir \ Las estrellas están ordenadas en un tablero que simula ser el cielo \ Las estrellas están ordenadas en una matriz de 6 filas y 7 columnas \ Para describirte el tablero, te daré la descripción de cada fila, donde cada estrella será una letra que indica su color, siendo g si es verde, r si es roja, b si es azul y g si es amarilla, cada fila tendra varias letras separadas por espacios que representan las columnas \ Fila 1 = g,b,r,y,g,r,b \ Fila 2 = y,r,g,r,y,g,r \ Fila 3 = r,g,y,g,r,b,y \ Fila 4 = g,y,b,y,g,b,r \ Fila 5 = g,b,r,r,y,b,g \ Fila 6 = y,r,y,g,b,y,b \ tu color de la estrella que debe buscar es rojo y\La constelación objetivo es cualquier que cumpla con se g, b y r de manera consecutiva \ Debes averiguar con tu compañero el objetivo del problema \ Debes establecer con tu compañero un plan para resolver el problema \ Deben organizarse \ Deben reflexionar sobre los resultados"
};
const chat = [];
const generateResponse1 = async (prompt) => {
  const response = await openai1.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      SYSTEM_MESSAGE1,
      {
        role: "user",
        content: prompt,
        temperature: 0,
      },
    ],
  });
 
  return response.data.choices[0].message.content;
};

const generateResponse2 = async (prompt) => {
  const response = await openai2.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      SYSTEM_MESSAGE2,
      {
        role: "user",
        content: prompt,
        temperature: 0,
      },
    ],
  });
 
  return response.data.choices[0].message.content;
};


const generateResponseFromMessages1 = async (messages) => {
  const response = await openai1.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [SYSTEM_MESSAGE1].concat(messages),
    temperature: 0,
  });
  /*console.log({
    Peta: response.data.choices[0].message.content,
    id: response.data.id,
    model: response.data.model,
  });*/
  const user={
    User: messages[0].content
  }
  const peta={
    Peta: response.data.choices[0].message.content
  }
  chat.push(user);
  chat.push(peta);
  console.log(chat);
  return response.data.choices[0].message.content;
};

const generateResponseFromMessages2 = async (messages) => {
  const response = await openai2.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [SYSTEM_MESSAGE2].concat(messages),
    temperature: 0,
  });
  /*console.log({
    Zeta: response.data.choices[0].message.content,
    id: response.data.id,
    model: response.data.model,
  });*/
  const user={
    User: messages[0].content
  }
  const zeta={
    Zeta: response.data.choices[0].message.content
  }
  chat.push(user);
  chat.push(zeta);
  console.log(chat);
  return response.data.choices[0].message.content;
}; 

module.exports = { generateResponse1, generateResponse2 };
module.exports = { generateResponseFromMessages1, generateResponseFromMessages2 };
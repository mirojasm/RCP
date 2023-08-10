const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey:  // Reemplaza "TU_CLAVE_DE_API_AQUI" con tu propia clave de API
});
const openai1 = new OpenAIApi(config); // Primer asistente
const openai2 = new OpenAIApi(config); // Segundo asistente
let acuerdo1=1;
let acuerdo2=0;

const SYSTEM_MESSAGE1 = {
  role: "system",
  content: "Vas a simular ser un asistente virtual llamado Peta" +
  "Hay otra asistente virtual llamada Zeta "+
  "Las respuestas que no sean muy largas"+
  "La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+
  "Los colores posibles de las estrellas son rojas, verde, azul y amarillo"+
  "Hay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+
  "Hay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a ti, al usuario y Zeta"+
  "A Peta se le asigno el color verde, al usuario el color azul y a Zeta el color rojo"+
  "Considera la siguiente matriz de estrellas:\n[[g,b,r,f,g,r,b], [f,r,g,r,f,g,r], [r,g,f,g,r,b,f],[g,f,b,f,g,b,r],[g,b,r,r,f,b,g],[f,r,f,g,b,f,b]]\n donde cada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla\n"+
 "El obejtivo es que Peta, Zeta y el usuario eligan una constelacion que tenga sus color de estrella de forma consecutiva en la matriz"+
"si el usuario y Peta ya tienen claro que estrella elegir, entonces agreement: true" + 
  // Incluir la instrucción para devolver la variable agreement en la salida
  "\noutput {\"agreement\": ${agreement}}"
};
const SYSTEM_MESSAGE2 = {
  role: "system",
  content: "Vas a simular ser un asistente virtual llamado Zeta" +
  "Hay otra asistente virtual llamada Peta "+
  "Las respuestas que no sean muy largas"+
  "La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+
  "Los colores posibles de las estrellas son rojas, verde, azul y amarillo"+
  "Hay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+
  "Hay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a ti, al usuario y Zeta"+
  "A Peta se le asigno el color verde, al usuario el color azul y a Zeta el color rojo"+
  "Considera la siguiente matriz de estrellas:\n[[g,b,r,f,g,r,b], [f,r,g,r,f,g,r], [r,g,f,g,r,b,f],[g,f,b,f,g,b,r],[g,b,r,r,f,b,g],[f,r,f,g,b,f,b]]\n donde cada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla\n"+
  "Asignar un numero correlativo a cada estrella en la matriz"+
 "El obejtivo es que Peta, Zeta y el usuario eligan una constelacion que tenga sus color de estrella de forma consecutiva en la matriz"+
"si el usuario y Zeta ya tienen claro que estrella elegir, entonces agreement: true" + 
  // Incluir la instrucción para devolver la variable agreement en la salida
  "\noutput {\"agreement\": ${agreement}}"
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
  //console.log(chat);
  //console.log(JSON.parse(response.data.choices[0].message.content));
  if(acuerdo1===acuerdo2){
    console.log("Acuerdo Total")
    return "Acuerdo";
  } 

  if(response.data.choices[0].message.content==="{\"agreement\": true}"){
    console.log(response.data.choices[0].message.content);
    acuerdo1="acuerdo";
    return "ok llegamos acuerdo";
  }

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
  //console.log(chat);
  if(acuerdo1===acuerdo2){
    console.log("Acuerdo Total")
    return "Acuerdo";
  } 
  if(response.data.choices[0].message.content==="{\"agreement\": true}"){
    console.log(response.data.choices[0].message.content);
    acuerdo2="acuerdo";
    return "ok llegamos acuerdo";
  }
 
  return response.data.choices[0].message.content;
};



module.exports = { generateResponse1, generateResponse2 };
module.exports = { generateResponseFromMessages1, generateResponseFromMessages2 };
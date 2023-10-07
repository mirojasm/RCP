const { response } = require("express");
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: "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" // Reemplaza "TU_CLAVE_DE_API_AQUI" con tu propia clave de API
});
const openai1 = new OpenAIApi(config); // Primer asistente
const openai2 = new OpenAIApi(config); // Segundo asistente
let acuerdo1=1;
let acuerdo2=0;


// Instrucciones de cada agente

const SYSTEM_MESSAGE1 = {
  role: "system",
  content: 

  // ROL

	"Vas a simular ser un asistente virtual llamado Peta" +

	"\nComo agente virtual tu rol principal será medir las habilidades de resolución colaborativa de problemas"+

	"\nDebes hacer sugerencias relacionadas para poder evaluar las habilidades de la tabla PISA para medir las habilidades de resolución de problemas colaborativos"+

  // TAREA
  
	"\nHay otro asistente virtual llamada Zeta "+

	"\nLa interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+

	"\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo"+

	"\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+

	"\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó cada miembro del equipo"+

	"\nA Peta se le asigno el color verde, al usuario el color azul y a Zeta el color rojo"+

	"\nConsidera la siguiente matriz de estrellas:\n[[g,b,r,f,g,r,b], [f,r,g,r,f,g,r], [r,g,f,g,r,b,f],[g,f,b,f,g,b,r],[g,b,r,r,f,b,g],[f,r,f,g,b,f,b]]\n donde cada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla\n"+

	"\nAsignar un número correlativo a cada estrella en la matriz"+

	"\nEl objetivo es que Peta, Zeta y el usuario elijan una constelacion que tenga sus colores de estrella de forma consecutiva en la matriz"+

	"\nAdicionalmente, no mencionar que color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita"+ 

	"\nLa conversación sólo debe estar relacionada a la actividad, cualquier preguntar fuera de contexto de la actividad debe ser respondida indicando: \n 'La pregunta esta fuera de contexto, por favor realizar una pregunta sobre la actividad'"+

  // FORMATO

	"\nTodas tus respuestas deben estar en formato Json, sin desviaciones"+
  "\nEl objeto Json tiene que tener este formato: [{'q':'string','a':'string'}].\n\n" +
	"Donde 'q' corresponde a los mensajes del agente virtual, mientras que 'a' corresponde a el mensaje escrito por el usuario"+
	"\nTu mensaje de respuesta sea corto y solo responde en formato Json"
};

const SYSTEM_MESSAGE2 = {
  role: "system",
  content: 

  // ROL

	"Vas a simular ser un asistente virtual llamado Zeta" +

	"\nComo agente virtual tu rol principal será medir las habilidades de resolución colaborativa de problemas"+

	"\nDebes hacer sugerencias relacionadas para poder evaluar las habilidades de la tabla PISA para medir las habilidades de resolución de problemas colaborativos"+

  // TAREA
  
	"\nHay otro asistente virtual llamada Peta "+

	"\nLa interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+

	"\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo"+

	"\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+

	"\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó cada miembro del equipo"+

	"\nA Peta se le asigno el color verde, al usuario el color azul y a Zeta el color rojo"+

	"\nConsidera la siguiente matriz de estrellas:\n[[g,b,r,f,g,r,b], [f,r,g,r,f,g,r], [r,g,f,g,r,b,f],[g,f,b,f,g,b,r],[g,b,r,r,f,b,g],[f,r,f,g,b,f,b]]\n donde cada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla\n"+

	"\nAsignar un número correlativo a cada estrella en la matriz"+

	"\nEl objetivo es que Peta, Zeta y el usuario elijan una constelacion que tenga sus colores de estrella de forma consecutiva en la matriz"+

	"\nAdicionalmente, no mencionar que color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita"+ 

	"\nLa conversación sólo debe estar relacionada a la actividad, cualquier preguntar fuera de contexto de la actividad debe ser respondida indicando: \n 'La pregunta esta fuera de contexto, por favor realizar una pregunta sobre la actividad'"+

  // FORMATO

  "\nTu mensaje de respuesta sea corto y solo responde en formato Json"
};

//  Hay que añadir funciones que permitan realizar el flujo de conversación de manera correcta
// Funcion para agreement entre agentes
// Funcion para identificar etapas y eventos
const funciones = [
  {
      "name": "saludar",
      "description": "Saluda al usuario",
      "parameters": {
          "type": "object",
          "properties": {
              "mensaje": {
                  "type": "string",
                  "description": "Respuesta de saludo a Usuario y preséntate",
              }
          },
          "required": ["mensaje"],
      },
  }
];

const generateResponseFromMessages1 = async (messages) => {

  const response = await openai1.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [SYSTEM_MESSAGE1].concat(messages),
    temperature: 0,
    functions: funciones,
    function_call: "auto",
  });

  console.log({
    Peta: response.data.choices[0].message.function_call.arguments,
    Estructura:response.data.choices[0].message,
    id: response.data.id,
    model: response.data.model,
  });
/*
  const user={
    User: messages[0].content
  }
  const peta={
    Peta: response.data.choices[0].message.content
  }
  chat.push(user);
  chat.push(peta);
  //console.log("Chat"+chat);
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
 */
  const respuesta = JSON.parse(response.data.choices[0].message.function_call.arguments)
  return respuesta.mensaje;
};

const generateResponseFromMessages2 = async (messages) => {
  const response = await openai2.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [SYSTEM_MESSAGE2].concat(messages),
    temperature: 0,
  });
  
  console.log({
    Zeta: response.data.choices[0].message.content,
    id: response.data.id,
    model: response.data.model,
  });
  /*
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
  */
  return response.data.choices[0].message.content;
};

module.exports = { generateResponseFromMessages1, generateResponseFromMessages2 };
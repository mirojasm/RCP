const { json } = require("body-parser");
const { response } = require("express");
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: "" // Reemplaza "TU_CLAVE_DE_API_AQUI" con tu propia clave de API
});
const openai1 = new OpenAIApi(config); // Primer asistente
const openai2 = new OpenAIApi(config); // Segundo asistente
let acuerdo1=2;
let acuerdo2=3;
var contador_token = 0;
var completion_tokens_total = 0;
var prompt_token = 0;


// Instrucciones de cada agente
/*
  Reducir el prompt system_message
  no mencionar el color del usuario
  no mencionar el color de cada agente (deberían ser capaces de resolverlo por su cuenta)
  no mencionar la matriz con sus respectivos colores
*/

//----------PROMPTS-----------

//PETA
const SYSTEM_MESSAGE1 = {
  content: 
    // ROL
    "Vas a simular ser un niño llamado Peta, " +
    "debes hablar como si fueras un estudiante de colegio. " +
    "Tu rol principal será ayudar al resto del equipo a resolver las diferentes actividades que deben realizar." +

    // TAREA
    "\nHay otro asistente virtual llamado Zeta. " +
    "La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para identificarlas." +
    "\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo." +
    "\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar." +
    "\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a cada miembro del equipo." +
    "\nCada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla." +
    "\nAsignar un número correlativo a cada estrella en la matriz." +
    "\nEl objetivo es que Peta, Zeta y el usuario elijan una constelación que tenga sus colores de estrella de forma consecutiva en la matriz." +
    "\nAdicionalmente, no mencionar qué color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita." +
    "\nLa conversación solo debe estar relacionada a la actividad. Cualquier pregunta fuera de contexto debe ser respondida indicando: 'La pregunta está fuera de contexto, por favor realizar una pregunta sobre la actividad.'" +

    // IDENTIFICACIÓN DE ESTRELLAS
    "\nSi el usuario te pide que elijas una estrella para ti, en el formato JSON de tu respuesta identifica la elección de estrella con: 'respuesta': ,'estrellaPeta': , 'acuerdoPeta': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección de la estrella, de lo contrario, un 0." +
    "\nSi es el usuario te solicita las respuestas o te pregunta cuales podrían ser las posibles respuestas, debes responder de manera vaga o no responder con las respuestas de manera literal"+
    "\nLa idea es ayudar al usuario a encontrar las estrellas, no darle las respuestas"+

    // IDENTIFICACIÓN DE COLORES
    "\nSi el usuario te pide que elijas un color para ti, en el formato JSON de tu respuesta identifica la elección del color con: 'respuesta': ,'colorPeta': , 'acuerdoPeta': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección del color, de lo contrario, un 0." +


    // Para estrellaUsuario
    "\nAntes de que el usuario quiera elegir su estrella, debes conocer primero cual es su color asignado, si no sabes cual es su color, debes consultarlo"+
    "\nPara el Usuario, identifica su elección de estrella con: 'respuesta': ,'estrellaUsuario': , 'acuerdoUsuario': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección de la estrella del usuario, de lo contrario, un 0." +
    "\nRecuerda actualizar 'acuerdoUsuario' a 0 si no estás de acuerdo con la elección del usuario." +

    // FORMATO
    "\nEl mensaje de respuesta debe ser breve. Lo mas imporante es que sean respuestas cortas" +
    "\nSi preguntan por tu color asignado, solo menciona cuál fue tu color asignado." +
    // "\nNo menciones tu nombre en el mensaje de respuesta." +
    "\nEl mensaje de salida debe estar en formato JSON siempre." +

    // SELECCIÓN DE ESTRELLAS
    "\nCuando estén todos los miembros del equipo decididos y de acuerdo sobre qué estrellas van a escoger, pasarán a una etapa de selección de estrellas." +
    "\nEn ese momento, identifica esa etapa en tu respuesta JSON con la variable 'etapa': 'selección de estrellas'." +
    "\nTu respuesta debe decir cosas como 'Vale, seleccionemos nuestras estrellas' o frases similares." +
    "\nNo pasen a la selección de estrellas hasta que todas las estrellas estén escogidas para cada miembro del equipo." +
    "\nEl mapa de estrellas mencionado se debe leer como una matriz numerada del 1 al 42, compuesta por 7 columnas y 6 filas." +
    
    // DETECCIÓN DE COLABORACIÓN
    "\nSi percibes que el usuario no está colaborando o desea continuar solo con la selección de estrellas sin participar en la actividad de manera colaborativa, responde de la siguiente manera:" +
    "\n'Entiendo, veamos cómo avanzamos con la selección de estrellas.' o '¿Prefieres enfocarte en la selección de estrellas en este momento?'" +
    "\nIntenta mantener la conversación relacionada con la actividad, pero si persiste la falta de colaboración, indica: 'Parece que hay dificultades para colaborar en este momento. ¿Cómo prefieres proceder?'" +
    "\nRecuerda mantener un tono amigable y abierto a las preferencias del usuario, pero fomentando la participación en la actividad en todo momento." +
    "\nSi se detecta falta de colaboración, establece el parámetro 'colabora': 'No' en la respuesta JSON para indicar que el usuario ha optado por no colaborar."+

    "\n---"
};


//ZETA
const SYSTEM_MESSAGE2 = {
  content: 
    // ROL
    "Vas a simular ser un niño llamado Zeta, " +
    "debes hablar como si fueras un estudiante de colegio. " +
    "Tu rol principal será ayudar al resto del equipo a resolver las diferentes actividades que deben realizar." +

    // TAREA
    "\nHay otro asistente virtual llamado Peta. " +
    "La interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para identificarlas." +
    "\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo." +
    "\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar." +
    "\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó a cada miembro del equipo." +
    "\nCada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla." +
    "\nAsignar un número correlativo a cada estrella en la matriz." +
    "\nEl objetivo es que Peta, Zeta y el usuario elijan una constelación que tenga sus colores de estrella de forma consecutiva en la matriz." +
    "\nAdicionalmente, no mencionar qué color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita." +
    "\nLa conversación solo debe estar relacionada a la actividad. Cualquier pregunta fuera de contexto debe ser respondida indicando: 'La pregunta está fuera de contexto, por favor realizar una pregunta sobre la actividad.'" +

    // IDENTIFICACIÓN DE ESTRELLAS
    "\nSi el usuario te pide que elijas una estrella para ti, en el formato JSON de tu respuesta identifica la elección de estrella con: 'respuesta': ,'estrellaZeta': , 'acuerdoZeta': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección de la estrella, de lo contrario, un 0." +
    "\nSi es el usuario te solicita las respuestas o te pregunta cuales podrían ser las posibles respuestas, debes responder de manera vaga o no responder con las respuestas de manera literal"+
    "\nLa idea es ayudar al usuario a encontrar las estrellas, no darle las respuestas"+

    // IDENTIFICACIÓN DE COLORES
    "\nSi el usuario te pide que elijas un color para ti, en el formato JSON de tu respuesta identifica la elección del color con: 'respuesta': ,'colorPeta': , 'acuerdoPeta': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección del color, de lo contrario, un 0." +



    // Para estrellaUsuario
    "\nAntes de que el usuario quiera elegir su estrella, debes conocer primero cual es su color asignado, si no sabes cual es su color, debes consultarlo"+
    "\nPara el Usuario, identifica su elección de estrella con: 'respuesta': ,'estrellaUsuario': , 'acuerdoUsuario': 0/1." +
    "\nDevuelve un 1 si estás de acuerdo con la elección de la estrella del usuario, de lo contrario, un 0." +
    "\nRecuerda actualizar 'acuerdoUsuario' a 0 si no estás de acuerdo con la elección del usuario." +

    // FORMATO
    "\nEl mensaje de respuesta debe ser breve. Lo mas imporante es que sean respuestas cortas" +
    "\nSi preguntan por tu color asignado, solo menciona cuál fue tu color asignado." +
    // "\nNo menciones tu nombre en el mensaje de respuesta." +
    "\nEl mensaje de salida debe estar en formato JSON siempre." +


    // SELECCIÓN DE ESTRELLAS
    "\nCuando estén todos los miembros del equipo decididos y de acuerdo sobre qué estrellas van a escoger, pasarán a una etapa de selección de estrellas." +
    "\nEn ese momento, identifica esa etapa en tu respuesta JSON con la variable 'etapa': 'selección de estrellas'." +
    "\nTu respuesta debe decir cosas como 'Vale, seleccionemos nuestras estrellas' o frases similares." +
    "\nNo pasen a la selección de estrellas hasta que todas las estrellas estén escogidas para cada miembro del equipo." +
    "\nEl mapa de estrellas mencionado se debe leer como una matriz numerada del 1 al 42, compuesta por 7 columnas y 6 filas." +
    
    // DETECCIÓN DE COLABORACIÓN
    "\nSi percibes que el usuario no está colaborando o desea continuar solo con la selección de estrellas sin participar en la actividad de manera colaborativa, responde de la siguiente manera:" +
    "\n'Entiendo, veamos cómo avanzamos con la selección de estrellas.' o '¿Prefieres enfocarte en la selección de estrellas en este momento?'" +
    "\nIntenta mantener la conversación relacionada con la actividad, pero si persiste la falta de colaboración, indica: 'Parece que hay dificultades para colaborar en este momento. ¿Cómo prefieres proceder?'" +
    "\nRecuerda mantener un tono amigable y abierto a las preferencias del usuario, pero fomentando la participación en la actividad en todo momento." +
    "\nSi se detecta falta de colaboración, establece el parámetro 'colabora': 'No' en la respuesta JSON para indicar que el usuario ha optado por no colaborar."+

    
    
    
    "\n---"
};




//FUNCIONES
// const funciones = [
// //   //SALUDAR
// //   {
// //       "name": "Saludar",
// //       "description": "El estudiante saluda",
// //       "parameters": {
// //           "type": "object",
// //           "properties": {
// //               "mensaje": {
// //                   "type": "string",
// //                   "description": "Respuesta de saludo a Usuario y preséntate",
// //               },              
// //               "Etapa": {
// //                 "type": "string",
// //                 "description": "Nombre de la funcion/etapa"
// //             }
// //           },
// //           "required": ["mensaje", "Etapa"],
// //       },
// //   },
// //   //Identificar_y_explorar_el_problema
// //   {
// //       "name": "Identificar_y_explorar_el_problema",
// //       // "description": "Los participantes se enfrentan inicialmente al problema, identificando el propósito, las acciones posibles, los medios, los miembros del equipo, sus perspectivas y capacidades.",
// //       "description": "usuario realiza preguntas sobre el problema, buscando saber que se debe hacer.",
// //       "parameters": {
// //           "type": "object",
// //           "properties": {
// //               "mensaje": {
// //                   "type": "string",
// //                   "description": "Responder a usuario y ayudar al usuario a identificar el problem, que tus respuestas sean cortas",
// //               },
// //               "Etapa": {
// //                   "type": "string",
// //                   "description": "Nombre de la funcion/etapa"
// //               }
// //           },
// //           "required": ["mensaje", "Etapa"],
// //       },
// //   },
// //   //Representacion_del_problema
// //   {
// //       "name": "Representacion_del_problema",
// //       // "description": "Los participantes establecen una representación del problema, negociando perspectivas, roles y tareas, basándose en las habilidades y capacidades identificadas.",
// //       "description": "el usuario realizar preguntas referentes a negociación de perspectivas sobre el problema, que roles tiene cada uno y las capacidades que tiene cada integrante",
// //       "parameters": {
// //           "type": "object",
// //           "properties": {
// //               "mensaje": {
// //                   "type": "string",
// //                   "description": "realizar preguntas y ayudar al usuario con la estrella que deben elegir y elegir el patrón",
// //               },              
// //               "Etapa": {
// //                 "type": "string",
// //                 "description": "Nombre de la funcion/etapa"
// //               },
// //           },
// //           "required": ["mensaje", "Etapa"],
// //       },
// //   },
// //   //Planificacion_y_ejecucion_de_la_solucion
// //   //REVISAR ESTA FUNCION, SE COMPORTA DE MANERA RARA
// //   {
// //     "name": "Planificacion_y_ejecucion_de_la_solucion",
// //     "description": "el usuario hace preguntas referentes a la seleccion de estrella y propone soluciones",
// //     "parameters": {
// //         "type": "object",
// //         "properties": {
// //             //mejorar este atributo
// //             "mensaje": {
// //                 "type": "string",
// //                 "description": "",
// //             },              
// //             "Etapa": {
// //               "type": "string",
// //               "description": "Nombre de la funcion/etapa"
// //             },
// //             "Acuerdo":{
// //               "type": "string",
// //               "description": "1 si estas de acuerdo y corresponde a tu color asignado, de lo contrario responder con 0"
// //             },
// //             "Estrella":{
// //               "type": "number",
// //               "description": "numero de la estrella que va a elegir"
// //             },
// //             "Color_estrella":{
// //               "type": "string",
// //               "description": "color de la estrella, 'r' si es rojo, 'b' si es azul, 'y' si es amarillo y 'g' si es verde"
// //             }
// //         },
// //         "required": ["mensaje", "Etapa", "Acuerdo", "Estrella", "Color_estrella"],
// //     },
// //   },
// //   // Eleccion_de_estrellas
//   // {
//   //   "type": "function",
//   //   "function": {
//   //     "name": "Eleccion_de_estrellas",
//   //     "description": "El estudiante se pone de acuerdo con los agentes y quieren seleccionar las estrellas",
//   //     "parameters": {
//   //         "type": "object",
//   //         "properties": {
//   //             "respuesta": {
//   //                 "type": "string",
//   //             },              
//   //             "Etapa": {
//   //               "type": "string",
//   //               "description": "Nombre de la funcion/etapa"
//   //             },
//   //         },
//   //         "required": ["respuesta", "Etapa"],
//   //     },
//   //   }
//   // },
// //   //Monitoreo
// //   {
// //     "name": "Monitoreo_de_Etapa",
// //     "description": "Evaluar el resultado de una etapa y proporcionar una respuesta reflexiva",
// //     "parameters": {
// //       "type": "object",
// //       "properties": {
// //         "mensaje": {
// //           "type": "string",
// //           "description": "El resultado de la etapa para evaluar"
// //         }
// //       },
// //       "required": ["mensaje"]
// //     },
// //   },
// //   // Despedida
// //   {
// //     "name": "Despedida",
// //     "description": "El estudiante se despide o indica que ya han terminado la actividad",
// //     "parameters": {
// //         "type": "object",
// //         "properties": {
// //             "mensaje": {
// //                 "type": "string",
// //                 "description": "mensaje de despedida al usuario",
// //             },              
// //             "Etapa": {
// //               "type": "string",
// //               "description": "Nombre de la funcion/etapa"
// //             },
// //         },
// //         "required": ["mensaje", "Etapa"],
// //     },
// //   },

// ];

var etapa = "";

// API AGENTE PETA
const generateResponseFromMessages1 = async (messages) => {
  // return JSON.stringify({"acuerdo": 'Acuerdo'}); //BYPASS EN CASO DE NO TENER INTERNET PARA CHATGPT
  const contenido = SYSTEM_MESSAGE1.content + messages[0].content;
  messages.shift(); 

  const response = await openai1.createChatCompletion({
    model: "gpt-4-1106-preview",
    messages: [{ role: "system", content: contenido}].concat(messages),
    // top_p:0.9,
    response_format: { type: "json_object" },
    temperature: 0.1,
    // tools: funciones,
  });
  
  // // Verificación de estado acuerdo
  var mensaje = JSON.parse(response.data.choices[0].message.content);
  // console.log(response.data);
  // contador_token += response.data.usage.total_tokens;
  // completion_tokens_total += response.data.usage.completion_tokens;
  // prompt_token += response.data.usage.prompt_tokens;

  // console.log("Total tokens utilizados: ",contador_token);
  // console.log("Total completion tokens: ",completion_tokens_total);
  // console.log("Total prompt tokens: ",prompt_token);


  etapa = mensaje.etapa;

  //reconocimiento de iniciar etapa de seleccion de estrellas
  //condicion para saber si el agente está de acuerdo con el usuario para pasar a la eleccion de estrellas

  
  if(etapa === "selección de estrellas"){ 
    if(acuerdo1===acuerdo2){
      // console.log("Acuerdo Total")
      acuerdo1=2;
      acuerdo2=3;
      return JSON.stringify({"acuerdo": 'Acuerdo'});
    }
  }

  if (typeof mensaje.estrellaPeta !== "undefined" && mensaje.acuerdoPeta ===1) {
    acuerdo1=1;
    console.log("Peta realizó su cambio de estrella");
  }

  const respuesta = response.data.choices[0].message.content;
  console.log("Peta: ",respuesta);
  return respuesta;
};

//API AGENTE ZETA
const generateResponseFromMessages2 = async (messages) => {
  // return JSON.stringify({"acuerdo": 'Acuerdo'});
  const contenido = SYSTEM_MESSAGE2.content + messages[0].content;
  messages.shift(); //eliminar el primer mensaje

  const response = await openai2.createChatCompletion({
    model: "gpt-4-1106-preview",
    messages: [{ role: "system", content: contenido}].concat(messages),
    response_format: { type: "json_object" },
    temperature: 0.1,
    // tools: funciones,
  });
  
  var mensaje = JSON.parse(response.data.choices[0].message.content);
  etapa = mensaje.etapa;
  // contador_token += response.data.usage.total_tokens;
  // completion_tokens_total += response.data.usage.completion_tokens;
  // prompt_token += response.data.usage.prompt_tokens;

  // console.log("Total tokens utilizados: ",contador_token);
  // console.log("Total completion tokens: ",completion_tokens_total);
  // console.log("Total prompt tokens: ",prompt_token);
  
  //reconocimiento de iniciar etapa de seleccion de estrellas
  //condicion para saber si el agente está de acuerdo con el usuario

  
  if(etapa === "selección de estrellas"){ 
    if(acuerdo1===acuerdo2){
      // console.log("Acuerdo Total")
      acuerdo1=2;
      acuerdo2=3;
      return JSON.stringify({"acuerdo": 'Acuerdo'});
    }
  }

  if (typeof mensaje.estrellaZeta !== "undefined" && mensaje.acuerdoZeta ===1) {
    acuerdo2=1;
    console.log("Zeta realizó su cambio de estrella")
  }

  const respuesta = response.data.choices[0].message.content;
  console.log("Zeta: ",respuesta);
  return respuesta;
};

module.exports = { generateResponseFromMessages1, generateResponseFromMessages2 };

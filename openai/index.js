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

// Instrucciones de cada agente
/*
  Reducir el prompt system_message
  no mencionar el color del usuario
  no mencionar el color de cada agente (deberían ser capaces de resolverlo por su cuenta)
  no mencionar la matriz con sus respectivos colores
*/

//PROMPTS

//PETA
const SYSTEM_MESSAGE1 = {
  role: "system",
  content: 

  // ROL

	"Vas a simular ser un niño llamado Peta " +

  "debes hablar como si fuera un estudiante de escuela"+

	"\ntu rol principal será ayudar al resto del equipo a resolver las diferentes actividades que deben realizar"+

  // TAREA
  
	"\nHay otro asistente virtual llamada Zeta "+

  // "\nResponder al jugador con sugerencias de que se debería hacer siguiendo las etapas para resolver un problema"+

  // "\nResponder las respuestas 'si' o afirmativas haciendo una continuación del contexto de la actividad"+

  // "\nResponder las respuestas 'no' o negativas haciento una continuación del contexto de la actividad"+

	"\nLa interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+

	"\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo"+

	"\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+

	"\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó cada miembro del equipo"+

  "\ndonde cada estrella será una letra que indica su color, siendo 'g' si es verde, 'r' si es roja, 'b' si es azul y 'f' si es amarilla\n"+

	"\nAsignar un número correlativo a cada estrella en la matriz"+

	"\nEl objetivo es que Peta, Zeta y el usuario elijan una constelacion que tenga sus colores de estrella de forma consecutiva en la matriz"+

	"\nAdicionalmente, no mencionar que color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita"+ 

	"\nLa conversación sólo debe estar relacionada a la actividad, cualquier preguntar fuera de contexto de la actividad debe ser respondida indicando: \n 'La pregunta esta fuera de contexto, por favor realizar una pregunta sobre la actividad'"+

  // FORMATO
	"\nTu mensaje de respuesta sea corto"+

  "\nOnly use the functions you have been provided with."
};

//ZETA
const SYSTEM_MESSAGE2 = {
  role: "system",
  content: 

  // ROL

	"Vas a simular ser un niño años llamado Zeta " +

  "debes hablar como si fuera un estudiante de escuela"+

	"\nTu rol principal será ayudar al resto del equipo a resolver las diferentes actividades que deben realizar"+

  // TAREA
  
	"\nHay otro miembro del equipo llamado Peta "+

  // "\nResponder al jugador con sugerencias de que se debería hacer siguiendo las etapas para resolver un problema"+

  // "\nResponder las respuestas 'si' o afirmativas haciendo una continuación del contexto de la actividad"+

  // "\nResponder las respuestas 'no' o negativas haciento una continuación del contexto de la actividad"+

  "\nLa interfaz muestra un conjunto de estrellas de colores y con un número correlativo de izquierda a derecha y de arriba abajo para indentificarlas"+

	"\nLos colores posibles de las estrellas son rojas, verde, azul y amarillo"+

	"\nHay un botón con un ícono de “ojo” que al presionar muestra la constelación que deben formar"+

	"\nHay un botón con un ícono de “estrella” que indica el color de la estrella que se le asignó cada miembro del equipo"+

  "\nAsignar un número correlativo a cada estrella en la matriz"+

	"\nEl objetivo es que Peta, Zeta y el usuario elijan una constelacion que tenga sus colores de estrella de forma consecutiva en la matriz"+

	"\nAdicionalmente, no mencionar que color le corresponde a cada usuario. Solo mencionarlo si el usuario lo solicita de manera explícita"+ 

	"\nLa conversación sólo debe estar relacionada a la actividad, cualquier preguntar fuera de contexto de la actividad debe ser respondida indicando: \n 'La pregunta esta fuera de contexto, por favor realizar una pregunta sobre la actividad'"+

  // FORMATO

	"\nTu mensaje de respuesta sea corto"+

  "\nOnly use the functions you have been provided with."
};


//FUNCIONES
const funciones = [
  //SALUDAR
  {
      "name": "Saludar",
      "description": "El estudiante saluda",
      "parameters": {
          "type": "object",
          "properties": {
              "mensaje": {
                  "type": "string",
                  "description": "Respuesta de saludo a Usuario y preséntate",
              },              
              "Etapa": {
                "type": "string",
                "description": "Nombre de la funcion/etapa"
            }
          },
          "required": ["mensaje", "Etapa"],
      },
  },
  //Identificar_y_explorar_el_problema
  {
      "name": "Identificar_y_explorar_el_problema",
      // "description": "Los participantes se enfrentan inicialmente al problema, identificando el propósito, las acciones posibles, los medios, los miembros del equipo, sus perspectivas y capacidades.",
      "description": "usuario realiza preguntas sobre el problema, buscando saber que se debe hacer.",
      "parameters": {
          "type": "object",
          "properties": {
              "mensaje": {
                  "type": "string",
                  "description": "Responder a usuario y ayudar al usuario a identificar el problem, que tus respuestas sean cortas",
              },
              "Etapa": {
                  "type": "string",
                  "description": "Nombre de la funcion/etapa"
              }
          },
          "required": ["mensaje", "Etapa"],
      },
  },
  //Representacion_del_problema
  {
      "name": "Representacion_del_problema",
      // "description": "Los participantes establecen una representación del problema, negociando perspectivas, roles y tareas, basándose en las habilidades y capacidades identificadas.",
      "description": "el usuario realizar preguntas referentes a negociación de perspectivas sobre el problema, que roles tiene cada uno y las capacidades que tiene cada integrante",
      "parameters": {
          "type": "object",
          "properties": {
              "mensaje": {
                  "type": "string",
                  "description": "realizar preguntas y ayudar al usuario con la estrella que deben elegir y elegir el patrón",
              },              
              "Etapa": {
                "type": "string",
                "description": "Nombre de la funcion/etapa"
              },
          },
          "required": ["mensaje", "Etapa"],
      },
  },
  //Planificacion_y_ejecucion_de_la_solucion
  //REVISAR ESTA FUNCION, SE COMPORTA DE MANERA RARA
  {
    "name": "Planificacion_y_ejecucion_de_la_solucion",
    "description": "el usuario hace preguntas referentes a la seleccion de estrella y propone soluciones",
    "parameters": {
        "type": "object",
        "properties": {
            //mejorar este atributo
            "mensaje": {
                "type": "string",
                "description": "",
            },              
            "Etapa": {
              "type": "string",
              "description": "Nombre de la funcion/etapa"
            },
            "Acuerdo":{
              "type": "string",
              "description": "1 si estas de acuerdo y corresponde a tu color asignado, de lo contrario responder con 0"
            },
            "Estrella":{
              "type": "number",
              "description": "numero de la estrella que va a elegir"
            }
        },
        "required": ["mensaje", "Etapa", "Acuerdo", "Estrella"],
    },
  },
  // Eleccion_de_estrellas
  {
    "name": "Eleccion_de_estrellas",
    "description": "El estudiante se pone de acuerdo con los agentes y quieren seleccionar las estrellas",
    "parameters": {
        "type": "object",
        "properties": {
            "mensaje": {
                "type": "string",
            },              
            "Etapa": {
              "type": "string",
              "description": "Nombre de la funcion/etapa"
            },
        },
        "required": ["mensaje", "Etapa"],
    },
  },
  //Monitoreo
  {
    "name": "Monitoreo",
    "description": "El estudiante y el grupo reflexiona del resultado de la etapa",
    "parameters": {
        "type": "object",
        "properties": {
            "mensaje": {
                "type": "string",
            },              
            "Etapa": {
              "type": "string",
              "description": "Nombre de la funcion/etapa"
            },
        },
        "required": ["mensaje", "Etapa"],
    },
  },
  // Despedida
  {
    "name": "Despedida",
    "description": "El estudiante se despide o indica que ya han terminado la actividad",
    "parameters": {
        "type": "object",
        "properties": {
            "mensaje": {
                "type": "string",
                "description": "mensaje de despedida al usuario",
            },              
            "Etapa": {
              "type": "string",
              "description": "Nombre de la funcion/etapa"
            },
        },
        "required": ["mensaje", "Etapa"],
    },
  },
];

var etapa = "";

// API AGENTE PETA
const generateResponseFromMessages1 = async (messages) => {
  // return "Acuerdo"; //BYPASS EN CASO DE NO TENER INTERNET PARA CHATGPT
  console.log("messages: ",messages);
  const response = await openai1.createChatCompletion({
    model: "gpt-4",
    messages: [SYSTEM_MESSAGE1].concat(messages),
    temperature: 0,
    functions: funciones,
    function_call: "auto",
  });
  
  //caso cuando no utiliza una funcion para responder
  if (response.data.choices[0].message.content != null){
    const response1 = await openai1.createChatCompletion({
      model: "gpt-4",
      messages: [SYSTEM_MESSAGE1].concat(messages),
      temperature: 0,
    });
    return {"mensaje":response1.data.choices[0].message.content};
  }

  console.log({
    Peta: JSON.parse(response.data.choices[0].message.function_call.arguments).mensaje,
    Estructura:response.data.choices[0].message,
    id: response.data.id,
    model: response.data.model,
  });

  // Verificación de estado acuerdo
  var mensaje = response.data.choices[0].message.function_call;
  etapa = mensaje.name;
  console.log("etapa: ",etapa);

  //condicion para saber si el agente está de acuerdo con el usuario
  if(etapa === "Planificacion_y_ejecucion_de_la_solucion"){
    acu = JSON.parse(mensaje.arguments).Acuerdo;
    if(acu === "1"){
      acuerdo1 = 1;
      console.log("Peta esta de acuerdo");
    }
  }
  //reconocimiento de iniciar etapa de seleccion de estrellas
  if(etapa == "Eleccion_de_estrellas"){  
    if(acuerdo1===acuerdo2){
      console.log("Acuerdo Total")
      let acuerdo1=2;
      let acuerdo2=3;
      return "Acuerdo";
    }
  }
  const respuesta = JSON.parse(response.data.choices[0].message.function_call.arguments);
  return respuesta;
};

//API AGENTE ZETA
const generateResponseFromMessages2 = async (messages) => {
  // return "Acuerdo";
  console.log("messages: ",messages);
  const response = await openai2.createChatCompletion({
    model: "gpt-4-1106-preview",
    messages: [SYSTEM_MESSAGE2].concat(messages),
    temperature: 0,
    functions: funciones,
    function_call: "auto",
  });
  

  //caso cuando no utiliza una funcion para responder
  if (response.data.choices[0].message.content != null){
    const response2 = await openai2.createChatCompletion({
      model: "gpt-4-1106-preview",
      messages: [SYSTEM_MESSAGE2].concat(messages),
      temperature: 0,
    });
    // console.log("response 2:",response2.data.choices[0]);
    return {"mensaje":response2.data.choices[0].message.content};
  }

  console.log({
    Zeta: JSON.parse(response.data.choices[0].message.function_call.arguments).mensaje,
    Estructura:response.data.choices[0].message,
    id: response.data.id,
    model: response.data.model,
  });
  //Verificación de estado acuerdo
  var mensaje = response.data.choices[0].message.function_call;
  etapa = mensaje.name;
  console.log("etapa: ",etapa);

  //condicion para saber si el agente está de acuerdo con el usuario
  if(etapa === "Planificacion_y_ejecucion_de_la_solucion"){
    acu = JSON.parse(mensaje.arguments).Acuerdo;
    if(acu === "1"){
      acuerdo2 = 1;
      console.log("Zeta esta de acuerdo");
    }
  }
  //reconocimiento de iniciar etapa de seleccion de estrellas
  if(etapa == "Eleccion_de_estrellas"){  
    if(acuerdo1===acuerdo2){
      console.log("Acuerdo Total");
      let acuerdo1=2;
      let acuerdo2=3;
      return "Acuerdo";
    }
  }
  const respuesta = JSON.parse(response.data.choices[0].message.function_call.arguments);
  return respuesta;
};

module.exports = { generateResponseFromMessages1, generateResponseFromMessages2 };

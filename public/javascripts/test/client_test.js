var host = document.getElementById("client").getAttribute("host");
var port = document.getElementById("client").getAttribute("port");

var server = io.connect("localhost:3000");
var server = io.connect(serverURL);
var db;
var nivel_actual = "level1";
var etapas = new Array(0, 0, 0, 0);
var imgmapa = {
  "0000": "e3.png",
  1000: "e1.png",
  2000: "e2.png",
  1100: "e6.png",
  2100: "e15.png",
  1200: "e5.png",
  2200: "e14.png",
  1110: "e7.png",
  2110: "e21.png",
  1210: "e22.png",
  2210: "e29.png",
  1120: "e28.png",
  2120: "e30.png",
  1220: "e31.png",
  2220: "e8.png",
  1111: "e11.png",
  2111: "e38.png",
  1211: "e36.png",
  2211: "e34.png",
  1121: "e40.png",
  2121: "e42.png",
  1221: "e44.png",
  2221: "e32.png",
  1112: "e12.png",
  2112: "e39.png",
  1212: "e37.png",
  2212: "e35.png",
  1122: "e41.png",
  2122: "e43.png",
  1222: "e45.png",
  2222: "e33.png",
};
const context = [];
var varLevel = 0;
var etapa = 0;


/*
rol: system: contexto, comportamiento de agente virtual
rol: assistant: mensajes de respuesta (ejemplos)
rol: user: prompt del usuario

manejo de prompt para cada etapa (seleccion de color de cada agente)
considerar como rol = 'system'
mencionar color de cada agente por separado
mencionar la misma matriz de estrellas para cada agente (Varía con cada etapa)

Total de agentes: 2
Total de etapas: 4
Arreglo de max_estrellas_por_agente: []
Arreglo de Total_color_por_agente: []
Total de matriz distintas: 4

*/

var prompt_contexto = 
  [
    { //PETA
        role: "system", 
        content: "",
    },
    { //ZETA
        role: "system",
        content: "",
    }
  ];

//Evita el GoBack
history.pushState(null, null, document.URL);
window.addEventListener("popstate", function () {
  history.pushState(null, null, document.URL);
});

server.on("connect", function (data) {
  $(".erase_button").hide();
  $("#selectionTime").hide();
  $(".writing").hide();
  nivel_actual = "level1";
  server.emit("loadGame", {
    tipo_juego: tipo_juego(),
    nombre_jugador: get_sent_data()["nombre_s"],
  });
});

//revisar aqui
server.on("test", function (data) {
  jugador2 = "Peta";
  jugador3 = "Zeta";
  levelsData = JSON.parse(data.stars_level);
  colorData = JSON.parse(data.color);
  solutionsData = JSON.parse(data.solutions_level);
  secondColorData = JSON.parse(data.second_color);
  maxSelectData = JSON.parse(data.max_select);
  solutionsP2 = {};
  solutionsP3 = {};
  lista_elegidas = [];
  for (var key in solutionsData) {
    var lista_def1 = [];
    var lista_def2 = [];
    var timesP1 = parseInt(maxSelectData[key][0]);
    for (var line = 0; line < solutionsData[key].length; line++) {
      //alert(solutionsData[key][line]);
      var timesP2 = parseInt(maxSelectData[key][1]);
      var lista1 = [];
      for (var numero = 0; numero < timesP2; numero++) {
        lista1.push(solutionsData[key][line][timesP1 + numero]);
      }
      lista_def1.push(lista1);

      var timesP3 = parseInt(maxSelectData[key][2]);
      var lista2 = [];
      for (var numero = 0; numero < timesP3; numero++) {
        lista2.push(solutionsData[key][line][timesP1 + timesP2 + numero]);
      }
      lista_def2.push(lista2);
    }
    solutionsP2[key] = lista_def1;
    solutionsP3[key] = lista_def2;
  }
  colorP2 = {};
  colorP3 = {};
  allColors = {};
  for (var key in colorData) {
    allColors[key] = colorData[key];
    if (secondColorData[key][0] !== "0")
      allColors[key].push(secondColorData[key][0]);
    if (secondColorData[key][1] !== "0")
      allColors[key].push(secondColorData[key][1]);
    if (secondColorData[key][2] !== "0")
      allColors[key].push(secondColorData[key][2]);
  }
  for (var key in colorData) {
    colorP2[key] = [colorData[key][1]];
    colorP3[key] = [colorData[key][2]];
  }
  for (var key in secondColorData) {
    if (secondColorData[key][1] !== "0") {
      colorP2[key].push(secondColorData[key][1]);
    }
    if (secondColorData[key][2] !== "0") {
      colorP3[key].push(secondColorData[key][2]);
    }
  }
  //REVISAR ESTO
  indiceSeleccion = Math.floor(Math.random() * solutionsP2["level1"].length);
  opcionSeleccionarP2 = solutionsP2["level1"][indiceSeleccion];
  opcionSeleccionarP3 = solutionsP3["level1"][indiceSeleccion];
  console.log("opciones elegidas: ", opcionSeleccionarP2,"-",opcionSeleccionarP3);
  valores = get_sent_data();
  nino_nombre = valores["nombre_s"];
  var cargar = valores["status"];
  $("#lb_nombre").text(nino_nombre);
  $("#lb_grupo").text("Grupo 1");

  num_seleccionadas = 0;
  estrellas_seleccionadas = [];
  time_to_select = false;
  arreglo_decision = [];
  decision = false;
  if (cargar === "new") {
    var data = "A-" + nino_nombre + "-NUEVO JUEGO-" + "Hora: " + Date();
    server.emit("escribir_resultados", data);
  }
  startGame(set_stars(nivel_actual));
  showStars();
  server.emit("playGame", {
    tipo_juego: tipo_juego(),
    nombre_jugador: get_sent_data()["nombre_s"],
  });
});


function borrar_tablero() {
  layer.remove();
  layer2.remove();
}


//contexto de cada etapa
//variable etapa anterior con resultados obtenidos
function loadLevel(varLevel) {
  var P = new Promise((resolve, reject) => {
    if (varLevel === 2) {
      $("#obj_game").attr("src", "../images/level_1_4.png");
      nivel_actual = "level4";
      resolve("level4");
    } else if (varLevel === 3) {
      $("#obj_game").attr("src", "../images/level_1_6.png");
      nivel_actual = "level6";
      resolve("level6");
    } else if (varLevel === 4) {
      $("#obj_game").attr("src", "../images/level_1_8.png");
      nivel_actual = "level8";
      resolve("level8");
    }
  });

  //REVISAR LA ELECCION DE ESTRELLAS POR DEFAULT
  P.then((successMessage) => {

    indiceSeleccion = Math.floor(
      Math.random() * solutionsP2[nivel_actual].length
    );

    opcionSeleccionarP2 = solutionsP2[nivel_actual][indiceSeleccion];
    opcionSeleccionarP3 = solutionsP3[nivel_actual][indiceSeleccion];
    
    opcionColorP2 = colorP2[nivel_actual];
    opcionColorP3 = colorP3[nivel_actual];

    num_seleccionadas = 0;
    estrellas_seleccionadas = [];
    time_to_select = false;
    arreglo_decision = [];
    decision = false;
    console.log("opciones elegidas: ", opcionSeleccionarP2,"-",opcionSeleccionarP3);
    borrar_tablero();
    $(".erase_button").hide();
    startGame(set_stars(nivel_actual));
    $("#image-final-level").hide();
    $("#selectionTime").hide();
    $("#choicesTime").show();
  });
}

var currentVariableState = new Array();
currentVariableState["A1"] = -1;
currentVariableState["A2"] = -1;
currentVariableState["A3"] = -1;
currentVariableState["exp"] = -1;
currentVariableState["Puntaje_I5"] = -1;
currentVariableState["Puntaje_I6"] = -1;
currentVariableState["Puntaje_I7"] = -1;
currentVariableState["Puntaje_I8"] = -1;
currentVariableState["Puntaje_I9"] = -1;
currentVariableState["Puntaje_I10"] = -1;
currentVariableState["Puntaje_I11"] = -1;
currentVariableState["Puntaje_I12"] = -1;
currentVariableState["Puntaje_I13"] = -1;
currentVariableState["Puntaje_I14"] = -1;
currentVariableState["Puntaje_I15"] = -1;
currentVariableState["Puntaje_I16"] = -1;
currentVariableState["Puntaje_I17"] = -1;
currentVariableState["Puntaje_I18"] = -1;
currentVariableState["Puntaje_I19"] = -1;
currentVariableState["Puntaje_I20"] = -1;
currentVariableState["Puntaje_I21"] = -1;
currentVariableState["Puntaje_I22"] = -1;
currentVariableState["Puntaje_I23"] = -1;
currentVariableState["Puntaje_I24"] = -1;

var escribirPuntajes = function () {
  if (typeof nino_nombre !== "undefined") {
    var au =
      "A:" +
      nino_nombre +
      ":" +
      currentVariableState["A1"] +
      ":" +
      currentVariableState["A2"] +
      ":" +
      currentVariableState["A3"] +
      ":" +
      currentVariableState["exp"] +
      ":" +
      currentVariableState["Puntaje_I5"] +
      ":" +
      currentVariableState["Puntaje_I6"] +
      ":" +
      currentVariableState["Puntaje_I7"] +
      ":" +
      currentVariableState["Puntaje_I8"] +
      ":" +
      currentVariableState["Puntaje_I9"] +
      ":" +
      currentVariableState["Puntaje_I10"] +
      ":" +
      currentVariableState["Puntaje_I11"] +
      ":" +
      currentVariableState["Puntaje_I12"] +
      ":" +
      currentVariableState["Puntaje_I13"] +
      ":" +
      currentVariableState["Puntaje_I14"] +
      ":" +
      currentVariableState["Puntaje_I15"] +
      ":" +
      currentVariableState["Puntaje_I16"] +
      ":" +
      currentVariableState["Puntaje_I17"] +
      ":" +
      currentVariableState["Puntaje_I18"] +
      ":" +
      currentVariableState["Puntaje_I19"] +
      ":" +
      currentVariableState["Puntaje_I20"] +
      ":" +
      currentVariableState["Puntaje_I21"] +
      ":" +
      currentVariableState["Puntaje_I22"] +
      ":" +
      currentVariableState["Puntaje_I23"] +
      ":" +
      currentVariableState["Puntaje_I24"];

    server.emit("escribir_puntajes", au);
  }
};

function updateMap(etapa) {
  var imageArray = document.getElementById("client").getAttribute("imageNames");

  //console.log("data etapa: ",data);
  if ("etapa" in data && etapa != data["etapa"]) {
    etapa = data["etapa"];
    $("#col1").css(
      "background-image",
      "url(../images/" + imageArray[etapa] + ")"
    );
  }
}

function showStars() {
    layer.show();
    $('.mapa').html("<img class='img-mapa' src='../images/ETAPAS/'"+imgmapa[""+etapas[0]+etapas[1]+etapas[2]+etapas[3]]+"'>");
    $(".mapa").hide();
    $(".img-mapa").attr(
      "src",
      "../images/ETAPAS/" +
        imgmapa["" + etapas[0] + etapas[1] + etapas[2] + etapas[3]]
    );
}

//Agregado funcion de mostrar avance de actividad
$(".btn-map").click(function showMap() {
    layer.hide();
    $(".img-mapa").attr(
      "src",
      "../images/ETAPAS/" +
        imgmapa["" + etapas[0] + etapas[1] + etapas[2] + etapas[3]]
    );
    $(".mapa").show();
    setTimeout(function () {
      $(".mapa").hide();
      layer.show();
    }, 5000);
});

var sendButtonClick = function () {
  var data = "A-" + nino_nombre + "-Estado-CLICK para enviar estrellas.";
  server.emit("escribir_resultados", data);
  $(".erase_button").hide();
  var sendMessageButton = document.createElement('button');
  sendMessageButton.type = 'button'; // Importante para evitar que el botón envíe el formulario
  sendMessageButton.innerHTML = 'Enviar';
  sendMessageButton.id = 'SendMessageButton1';
  // Establece la función que quieres ejecutar cuando se haga clic en el botón
  sendMessageButton.onclick = function(e) {
      SendMessageClick(e);
  };
  $("#SendStarsButton1").replaceWith(sendMessageButton);

  //conjunto de soluciones del nivel
  b = solutionsData[nivel_actual];

  //SE CONSIDERA AQUI SI LOS AGENTES CAMBIAN SU ELECCION
  //POR LA QUE SE INDICÓ POR EL USUARIO

  //revisar esto
  if (decision) { //IF DECISION = TRUE

    //considerar añadir estrellas elegidas random por agentes (opcionSeleccionarP[1-2])
    //considerar añadir estrellas elegidar en acuerdo con usuario (opcionElegidaP[1-2])
    estrellas_finales = (estrellas_seleccionadas)
      .concat(opcionElegidaP1)
      .concat(opcionElegidaP2);
    for (var au = 0; au < estrellas_finales.length; au++) {
      selectStar(estrellas_finales[au].toString());
    }

    var data =
      "A-" +
      nino_nombre +
      "-Estado-Se va a comparar con la decisón tomada por el niño.";
    server.emit("escribir_resultados", data);
    var data =
      "A-" +
      nino_nombre +
      "-Estado-El resultado correcto es: " +
      JSON.stringify(b);
    server.emit("escribir_resultados", data);
    var data =
      "A-" +
      nino_nombre +
      "-Estado-Los jugadores han seleccionado las estrellas: " +
      JSON.stringify(estrellas_finales);
    server.emit("escribir_resultados", data);

    //comprueba si selección es igual a la solución
    for (var i = 0; i < b.length; i++) {
      var aparece = true;
      for (var j = 0; j < estrellas_finales.length; j++) {
        if (b[i].indexOf(estrellas_finales[j].toString()) == -1) {
          aparece = false;
          break;
        }
      }
      if (aparece) {
        break;
      }
    }
  }

  //Si decision es falso= se mantienen las estrellas de elegidas por los agentes de manera aleatoria 
  else { //IF DECISION = FALSE

    //considerar añadir estrellas elegidas random por agentes (opcionSeleccionarP1-2)
    //considerar añadir estrellas elegidar en acuerdo con usuario (opcionElegidaP1-2)
    estrellas_finales = (estrellas_seleccionadas)
    .concat(opcionSeleccionarP2)
    .concat(opcionSeleccionarP3);
    for (var au = 0; au < estrellas_finales.length; au++) {
      selectStar(estrellas_finales[au].toString());
    }

    var data =
      "A-" +
      nino_nombre +
      "-Estado-Se va a comparar con los valores por defecto de los autómatas.";
    server.emit("escribir_resultados", data);
    var data =
      "A-" +
      nino_nombre +
      "-Estado-El niño ha elegido las estrellas: " +
      JSON.stringify(estrellas_seleccionadas);
    server.emit("escribir_resultados", data);
    var data =
      "A-" +
      nino_nombre +
      "-Estado-Las estrellas del niño junto con los autómatas son: " +
      JSON.stringify(estrellas_finales);
    server.emit("escribir_resultados", data);
    var data =
      "A-" +
      nino_nombre +
      "-resultado-" +
      nivel_actual +
      "-El resultado correcto es: " +
      JSON.stringify(b);
    server.emit("escribir_resultados", data);

    // b: lista de lista con los resultados correctos de la etapa [["1","2","3"],[]...]
    // Hacer comparación aquí de si los resultados en estrellas_finales corresponden
    // de las posibles listas existentes en b
    // for loop recorriendo b, viendo si el contenido de estrellas_finales calza
    // con el contenido de b

    //revisar esta funcion para detectar que las estrellas pertenecen a la solución

		//comprueba si selección es igual a la solución
    for (var i = 0; i < b.length; i++) {
      var aparece = true;
      for (var j = 0; j < estrellas_finales.length; j++) {
        if (b[i].indexOf(estrellas_finales[j].toString()) == -1) {
          aparece = false;
          break;
        }
      }
      if (aparece) {
        break;
      }
    }
  }


  //Se movio dentro el cambio de nivel y etapas, dado que el cambio de nivel se debe hacer independiente 
  //pero el ajuste de imagenes para indicar el avance de la actividad requiere saber si aprobaron o no
  //si el resultado es correcto o no

  if (aparece){ //aparece TRUE

    var nextLevel;
    if (nivel_actual == "level1") {
      etapas[0] = 2;
      nextLevel = 2;
    } else if (nivel_actual == "level4") {
      etapas[1] = 2;
      nextLevel = 3;
    } else if (nivel_actual == "level6") {
      etapas[2] = 2;
      nextLevel = 4;
    } else if (nivel_actual == "level8") {
      etapas[3] = 2;
      nextLevel = 5;
    }


    resultado = "gana";
    $("#image-final-level").attr("src", "../images/level_won.png");
    var data =
      "A-" + nino_nombre + "-resultado-" + nivel_actual + "RESULTADO CORRECTO";
    server.emit("escribir_resultados", data);
    alert("aparece: TRUE");

    $("#image-final-level").show();
    setTimeout(function () {
      $("#image-final-level").hide();
      revision(nextLevel,resultado);
    }, 5000);
  } else { //aparece FALSE

    var nextLevel;
    if (nivel_actual == "level1") {
      etapas[0] = 1;
      nextLevel = 2;
    } else if (nivel_actual == "level4") {
      etapas[1] = 1;
      nextLevel = 3;
    } else if (nivel_actual == "level6") {
      etapas[2] = 1;
      nextLevel = 4;
    } else if (nivel_actual == "level8") {
      etapas[3] = 1;
      nextLevel = 5;
    }

    resultado = "pierde";
    $("#image-final-level").attr("src", "../images/level_lost.png");
    var data =
      "A-" +
      nino_nombre +
      "-resultado-" +
      nivel_actual +
      "RESULTADO INCORRECTO";
    server.emit("escribir_resultados", data);
    alert("aparece: FALSE");
    $("#image-final-level").show();
    //estado monitoreo: mostrar el resultado, pero no pasar al siguiente nivel
    setTimeout(function () {
      $("#image-final-level").hide();
      revision(nextLevel,resultado);
    }, 5000);
  }
};

/* FUNCION MONITOREO
  -Cambiar nombre y funcion del boton "deshacer seleccion":
    Pierde: "reintentar"
    Gana: "Siguiente nivel"
*/
function revision(level,resultado){
  console.log("resultado: ",resultado);
  
  //Se hace el cambio del tipo de boton para poder seguir enviando mensajes sin tener que recargar la página
  const boton = document.getElementById("SendMessageButton1");
  boton.type = 'submit';

  if (resultado === "gana") {
    context.push({ role: "system", content: "El resultado del "+level +"fue bueno, felicitaciones, ahora deben realizar una breve discusion con el usuario"});
  }
  else if (resultado === "pierde") {
    context.push({ role: "system", content: "El resultado del "+level +"fue malo, deben revisar sus respuestas elegidas, discutir sus elecciones y volver a intentarlo"});
  }
  $(".erase_button").text("Siguiente nivel");
  $(document).ready(function() {
    $(".erase_button").click(function () {
      loadLevel(level);
    });
  });
}

server.on("updateGame", function (data) {
  var d = $(".game");
  $d.replaceWith(data);
});

var parseText = function (_text) {
  var classes = "";
  var text = _text;
  var text_clean = text;

  //Force Menu Display
  text = text.replace("[f]", "");

  // Action Choice
  if (text.indexOf("[a]") !== -1) {
    text = text.replace("[a]", "");
    classes += " actionChoice";
  }

  if (classes !== "") {
    //text = "<span class='" + classes + "'>" + text + "</span>";
  }
  return {
    text: text,
    text_clean: text_clean,
  };
};

var stage;
stage = new Kinetic.Stage({
  container: "colCanvas",
  width: 550,
  height: 700,
});

function createText(texto) {
  var text = new Kinetic.Text({
    x: 100,
    y: 30,
    text: texto,
    fontSize: 25,
    fontFamily: "Calibri",
    fill: "white",
    shadowColor: "black",
    drawBorder: true,
  });
  return text;
}

function createStar(realColor, posX, posY, i) {
  //metodo que crea una estrella
  var scale = 0.2;
  var star = new Kinetic.Star({
    x: posX * stage.getWidth(),
    y: posY * stage.getHeight(),
    numPoints: 5,
    innerRadius: 50,
    outerRadius: 100,
    fill: realColor,
    stroke: "#89b717",
    opacity: 0.9,
    strokeWidth: 10,
    draggable: false,
    scale: scale,
    rotationDeg: -35,
    shadowColor: "black",
    shadowBlur: 10,
    shadowOffset: 5,
    shadowOpacity: 0.6,
    startScale: scale,
    starColor: realColor,
    id: i,
  });
  return star;
}

function createNumber(n, posX, posY) {
  //funcion que crea el numero de la estrella asociada
  var num = new Kinetic.Text({
    x: posX * stage.getWidth() - 9,
    y: posY * stage.getHeight() - 9,
    text: n + "",
    fontSize: 18,
    fontFamily: "Calibri",
    fill: "white",
    shadowColor: "black",
  });
  if (n < 10) {
    num.setText(" " + n);
  }
  return num;
}

function startGame(data) {
  //console.log("data startgame: ", data);
  stars = new Array();
  numbers = new Array();
  layer = new Kinetic.Layer();
  layer2 = new Kinetic.Layer();
  for (var n = 0; n < data.length; n++) {
    stars[n] = createStar(data[n].realColor, data[n].posX, data[n].posY, n);
    numbers[n] = createNumber(n + 1, data[n].posX, data[n].posY);
  }
  for (var n = 0; n < stars.length; n++) {
    addStar(n);
  }
  mensajeNoAun = createText("Aún no puedes seleccionar estrellas");
  mensajeColorMalo = createText("Debes seleccionar estrellas de tu color");
  mensajeMaximoPermitidas = createText("Ya seleccionaste el numero máximo");
  mensajePantalla = false;
  layer.add(mensajeNoAun);
  layer.add(mensajeMaximoPermitidas);
  layer.add(mensajeColorMalo);
  mensajeNoAun.hide();
  mensajeMaximoPermitidas.hide();
  mensajeColorMalo.hide();
  stage.add(layer);
  stage.add(layer2);
  $(document).ready(function() {
    $('.erase_button').off('click').on('click', function () {
      return false;
    });   
    $(".erase_button").click(function () {
      unselectStar();
    });
    $(".erase_button").text("Deshacer selección");    
  });
}

function addStar(i) {
  var rtrim = /^\s+|\s+$/g;
  stars[i].on("click tap", function () {
    if (time_to_select == true) {
      if (
        num_seleccionadas < current_max_select &&
        estrellas_seleccionadas.indexOf(i) == -1
      ) {
        if (
          current_color == starsArray[i].realColor ||
          current_second_color == starsArray[i].realColor ||
          nivel_actual == "level6" ||
          nivel_actual == "level8"
        ) {
          var data =
            "A-" +
            nino_nombre +
            "-Estado-CLICK en estrella. RESULT: estrella correctamente seleccionada.";
          server.emit("escribir_resultados", data);
          var data =
            "A-" +
            nino_nombre +
            "-Estado-El usuario ha seleccionado la estrella " +
            i;
          server.emit("escribir_resultados", data);
          selectStar(i);
          num_seleccionadas += 1;
          estrellas_seleccionadas.push(i);
          var data =
            "A-" +
            nino_nombre +
            "-Estado-Estrellas seleccionadas hasta el momento: " +
            JSON.stringify(estrellas_seleccionadas);
          server.emit("escribir_resultados", data);
          $(".erase_button").show();
          $("#SendStarsButton1").prop("disabled", false);
        } else if (mensajePantalla == false) {
          var data =
            "A-" +
            nino_nombre +
            "-Estado-CLICK en estrella. RESULT: color incorrecto -> estrella no seleccionada.";
          server.emit("escribir_resultados", data);
          mensajePantalla = true;
          mensajeColorMalo.show();
          layer.draw();
          mensajeColorMalo.hide();
          setTimeout(function () {
            layer.draw();
            mensajePantalla = false;
          }, 4000);
        }
      } else if (
        num_seleccionadas >= current_max_select &&
        estrellas_seleccionadas.indexOf(i) == -1 &&
        mensajePantalla == false
      ) {
        var data =
          "A-" +
          nino_nombre +
          "-Estado-CLICK en estrella. RESULT: número máximo de estrellas elegidas -> estrella no seleccionada.";
        server.emit("escribir_resultados", data);
        mensajePantalla = true;
        mensajeMaximoPermitidas.show();
        layer.draw();
        mensajeMaximoPermitidas.hide();
        setTimeout(function () {
          mensajePantalla = false;
          layer.draw();
        }, 4000);
      }
    } else {
      var data =
        "A-" +
        nino_nombre +
        "-Estado-CLICK en estrella. RESULT: no es momento de elegir estrellas -> estrella no seleccionada.";
      server.emit("escribir_resultados", data);
      mensajePantalla = true;
      mensajeNoAun.show();
      layer.draw();
      mensajeNoAun.hide();
      setTimeout(function () {
        mensajePantalla = false;
        layer.draw();
      }, 4000);
    }
    if (parseInt(num_seleccionadas) == parseInt(current_max_select)) {
      var data =
        "A-" +
        nino_nombre +
        "-Estado-numero maximo de estrellas coincide con las seleccionadas. Se activa botón para enviar respuestas.";
      server.emit("escribir_resultados", data);
      $("#SendStarsButton1").prop("disabled", false);
    }
  });

  numbers[i].on("click tap", function () {
    if (time_to_select == true) {
      if (
        num_seleccionadas < current_max_select &&
        estrellas_seleccionadas.indexOf(i) == -1
      ) {
        if (
          current_color == starsArray[i].realColor ||
          current_second_color == starsArray[i].realColor ||
          nivel_actual == "level6" ||
          nivel_actual == "level8"
        ) {
          var data =
            "A-" +
            nino_nombre +
            "Estado-CLICK en estrella. RESULT: estrella correctamente seleccionada.";
          server.emit("escribir_resultados", data);
          var data =
            "A-" +
            nino_nombre +
            "Estado-El usuario ha seleccionado la estrella " +
            i;
          server.emit("escribir_resultados", data);
          selectStar(i);
          num_seleccionadas += 1;
          estrellas_seleccionadas.push(i);
          var data =
            "A-" +
            nino_nombre +
            "Estado-Estrellas seleccionadas hasta el momento: " +
            JSON.stringify(estrellas_seleccionadas);
          server.emit("escribir_resultados", data);
          $(".erase_button").show();
          $("#chat_button").prop("disabled", false);
        } else if (mensajePantalla == false) {
          var data =
            "A-" +
            nino_nombre +
            "Estado-CLICK en estrella. RESULT: color incorrecto -> estrella no seleccionada.";
          server.emit("escribir_resultados", data);
          mensajePantalla = true;
          mensajeColorMalo.show();
          layer.draw();
          mensajeColorMalo.hide();
          setTimeout(function () {
            layer.draw();
            mensajePantalla = false;
          }, 4000);
        }
      } else if (
        num_seleccionadas >= current_max_select &&
        estrellas_seleccionadas.indexOf(i) == -1 &&
        mensajePantalla == false
      ) {
        var data =
          "A-" +
          nino_nombre +
          "-Estado-CLICK en estrella. RESULT: número máximo de estrellas elegidas -> estrella no seleccionada.";
        server.emit("escribir_resultados", data);
        mensajePantalla = true;
        mensajeMaximoPermitidas.show();
        layer.draw();
        mensajeMaximoPermitidas.hide();
        setTimeout(function () {
          mensajePantalla = false;
          layer.draw();
        }, 4000);
      }
    } else {
      var data =
        "A-" +
        nino_nombre +
        "-Estado-CLICK en estrella. RESULT: no es momento de elegir estrellas -> estrella no seleccionada.";
      server.emit("escribir_resultados", data);
      mensajePantalla = true;
      mensajeNoAun.show();
      layer.draw();
      mensajeNoAun.hide();
      setTimeout(function () {
        mensajePantalla = false;
        layer.draw();
      }, 4000);
    }
    if (parseInt(num_seleccionadas) == parseInt(current_max_select)) {
      var data =
        "A-" +
        nino_nombre +
        "-Estado-numero maximo de estrellas coincide con las seleccionadas. Se activa botón para enviar respuestas.";
      server.emit("escribir_resultados", data);
      $("#SendStarsButton1").prop("disabled", false);
    }
  });
  layer.add(stars[i]);
  layer.add(numbers[i]);
}

function selectStar(i) {
  //genera el circulo que ensierra la estrella
  var circle = new Kinetic.Circle({
    x: stars[i].getX(),
    y: stars[i].getY(),
    radius: 21,
    stroke: "white",
    strokeWidth: 3,
  });
  $(".erase_button").show();
  $(".objective").css("margin-top","-255px");
  layer2.add(circle);
  layer2.drawScene();
}

function unselectStar() {
  // quita la seleccion de una estrella
  var data =
    "A-" +
    nino_nombre +
    "-Estado-CLICK en BOTÓN para deshacer selección. Número de estrellas elegidas = 0";
  server.emit("escribir_resultados", data);
  layer2.clear();
  layer2 = new Kinetic.Layer();
  stage.add(layer2);
  click_select = 0;
  star_select = new Array(42 + 1).join("0").split("");
  num_seleccionadas = 0;
  estrellas_seleccionadas = [];
  $("#SendStarsButton1").prop("disabled", true);
  $(".erase_button").hide();
  $(".objective").css("margin-top","-225px");
}

function set_stars(level) {
  var data = "A-" + nino_nombre + "-" + level.toUpperCase();
  server.emit("escribir_resultados", data);
  starsArray = new Array();
  console.log("level: "+level);

  //AÑADIR AQUI EL PROMPT DE CADA AGENTE SEGUN ETAPA
  //Se limpia las variables de contexto para asignarla de manera limpia a cada agente por etapa
  prompt_contexto[0].content = "";
  prompt_contexto[1].content = "";
  opcionElegidaP1 = [];
  opcionElegidaP2 = [];


  //Para mostrar los resultados posibles separados y añadirlos como prompt
  let resultado = '';

  for (let i = 0; i < Object.keys(solutionsData[nivel_actual]).length; i++) {
    resultado += '['; // Agregar corchete de apertura
    
    for (let j = 0; j < solutionsData[nivel_actual][i].length; j++) {
      resultado += solutionsData[nivel_actual][i][j];
      
      // Agregar un espacio excepto para el último elemento de cada fila
      if (j !== solutionsData[nivel_actual][i].length - 1) {
        resultado += ' '; // Separador de espacio
      }
    }
    
    resultado += ']'; // Agregar corchete de cierre
    
    // Agregar un espacio excepto para el último grupo
    if (i !== Object.keys(solutionsData[nivel_actual]).length - 1) {
      resultado += ' '; // Separador de espacio
    }
  }

  //Formating de mapa del nivel
  const mapa_level = levelsData[nivel_actual];

  const numRows = 6;
  const numCols = 7;

  let mapOutput = 'Mapa de Estrellas:\n';

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const starNumber = row * numCols + col + 1;
      const starColor = mapa_level[row * numCols + col];
      mapOutput += ` ${starNumber}: ${starColor} `;
      mapOutput += col !== numCols - 1 ? '| ' : '';
    }
    mapOutput += '\n';
  }





  // context.shift();

  if (level == "level1") { //LEVEL 1
    stars_current_level = levelsData.level1;
    $("#lb_etapa").text("Nivel 1");
    cambiar_label_color();

    current_color = colorData.level1[0];
    current_second_color = secondColorData.level1[0];
    current_solution = solutionsData.level1;
    current_max_select = maxSelectData.level1[0];

    prompt_contexto[0].content = "\n Etapa actual: Nivel 1 \n "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][1]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";
    prompt_contexto[1].content = "\n Etapa actual: Nivel 1 \n "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][2]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";


  } else if (level == "level2") {
    stars_current_level = levelsData.level2;
    $("#lb_etapa").text("Nivel 2");
    cambiar_label_color();
    current_color = colorData.level2[0];
    current_second_color = secondColorData.level2[0];
    current_solution = solutionsData.level2;
    current_max_select = maxSelectData.level2[0];
  } else if (level == "level3") {
    stars_current_level = levelsData.level3;
    $("#lb_etapa").text("Nivel 3");
    cambiar_label_color();
    current_color = colorData.level3[0];
    current_second_color = secondColorData.level3[0];
    current_solution = solutionsData.level3;
    current_max_select = maxSelectData.level3[0];
  } else if (level == "level4") { //LEVEL 4
    stars_current_level = levelsData.level4;
    $("#lb_etapa").text("Nivel 2");
    cambiar_label_color();
    current_color = colorData.level4[0];
    current_second_color = secondColorData.level4[0];
    current_solution = solutionsData.level4;
    current_max_select = maxSelectData.level4[0];

    prompt_contexto[0].content = "\n Etapa actual: Nivel 2 \n "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][1]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";
    prompt_contexto[1].content = "\n Etapa actual: Nivel 2 \n "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][2]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";

  } else if (level == "level5") {
    stars_current_level = levelsData.level5;
    $("#lb_etapa").text("Nivel 5");
    cambiar_label_color();
    current_color = colorData.level5[0];
    current_second_color = secondColorData.level5[0];
    current_solution = solutionsData.level5;
    current_max_select = maxSelectData.level5[0];
  } else if (level == "level6") { //LEVEL 6
    stars_current_level = levelsData.level6;
    $("#lb_etapa").text("Nivel 3");
    //Añadido cambio de texto que se muestra en esta etapa
    ocultar_color_data();
    $("#p_color").text("Debes descubrir tus colores");
    current_color = colorData.level6[0];
    current_second_color = secondColorData.level6[0];
    current_solution = solutionsData.level6;
    current_max_select = maxSelectData.level6[0];

    prompt_contexto[0].content = "\n Etapa actual: Nivel 3 \n Mapa de estrellas: "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][1]+"\nTu segundo color designado es el "+secondColorData[nivel_actual][1]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";
    prompt_contexto[1].content = "\n Etapa actual: Nivel 3 \n Mapa de estrellas: "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][2]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";


  } else if (level == "level7") {
    stars_current_level = levelsData.level7;
    $("#lb_etapa").text("Nivel 7");
    cambiar_label_color();
    current_color = colorData.level7[0];
    current_second_color = secondColorData.level7[0];
    current_solution = solutionsData.level7;
    current_max_select = maxSelectData.level7[0];
  } else if (level == "level8") { //LEVEL 8
    stars_current_level = levelsData.level8;
    $("#lb_etapa").text("Nivel 4");
    //Añadido cambio de texto que se muestra en esta etapa
    ocultar_color_data();
    $("#p_color").text("Debes descubrir tus colores");
    current_color = colorData.level8[0];
    current_second_color = secondColorData.level8[0];
    current_solution = solutionsData.level8;
    current_max_select = maxSelectData.level8[0];

    prompt_contexto[0].content = "\n Etapa actual: Nivel 4 \n Mapa de estrellas: "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][1]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";
    prompt_contexto[1].content = "\n Etapa actual: Nivel 4 \n Mapa de estrellas: "+mapOutput+"\n ver el mapa como una matriz de 7 columnas y 6 filas enumeradas del 1 al 42\nTu color designado es el: "+colorData[nivel_actual][2]+"\nla constelacion objetivo debe cumplir con los siguientes colores "+colorData[nivel_actual]+"\nLa constelación debe ser una de las siguientes soluciones: "+resultado+" a cada una de estas soluciones debes sumarle 1 al numero correspondiente, es decir la solucion 0,1,2 corresponden a las estrellas 1,2,3";

  }

  if (current_color == "g") {
    current_color = "green";
  } else if (current_color == "b") {
    current_color = "blue";
  } else if (current_color == "r") {
    current_color = "red";
  } else if (current_color == "y") {
    current_color = "yellow";
  }
  if (current_second_color != "0") {
    if (current_second_color == "g") {
      current_second_color = "green";
    } else if (current_second_color == "b") {
      current_second_color = "blue";
    } else if (current_second_color == "r") {
      current_second_color = "red";
    } else if (current_second_color == "y") {
      current_second_color = "yellow";
    }
  }

  for (var i = 0; i < stars_current_level.length; i++) {
    if (stars_current_level[i].includes("g")) {
      stars_current_level[i] = "green";
    } else if (stars_current_level[i].includes("b")) {
      stars_current_level[i] = "blue";
    } else if (stars_current_level[i].includes("y")) {
      stars_current_level[i] = "yellow";
    } else if (stars_current_level[i].includes("r")) {
      stars_current_level[i] = "red";
    }
  }

  starsArray[0] = {
    realColor: stars_current_level[0],
    posX: 0.2,
    posY: 0.1,
  };
  starsArray[1] = {
    realColor: stars_current_level[1],
    posX: 0.3,
    posY: 0.11,
  };
  starsArray[2] = {
    realColor: stars_current_level[2],
    posX: 0.4,
    posY: 0.12,
  };
  starsArray[3] = {
    realColor: stars_current_level[3],
    posX: 0.5,
    posY: 0.13,
  };
  starsArray[4] = {
    realColor: stars_current_level[4],
    posX: 0.6,
    posY: 0.14,
  };
  starsArray[5] = {
    realColor: stars_current_level[5],
    posX: 0.7,
    posY: 0.15,
  };
  starsArray[6] = {
    realColor: stars_current_level[6],
    posX: 0.8,
    posY: 0.16,
  };
  starsArray[7] = {
    realColor: stars_current_level[7],
    posX: 0.2,
    posY: 0.2,
  };
  starsArray[8] = {
    realColor: stars_current_level[8],
    posX: 0.3,
    posY: 0.21,
  };
  starsArray[9] = {
    realColor: stars_current_level[9],
    posX: 0.4,
    posY: 0.22,
  };
  starsArray[10] = {
    realColor: stars_current_level[10],
    posX: 0.5,
    posY: 0.23,
  };
  starsArray[11] = {
    realColor: stars_current_level[11],
    posX: 0.6,
    posY: 0.24,
  };
  starsArray[12] = {
    realColor: stars_current_level[12],
    posX: 0.7,
    posY: 0.25,
  };
  starsArray[13] = {
    realColor: stars_current_level[13],
    posX: 0.8,
    posY: 0.26,
  };
  starsArray[14] = {
    realColor: stars_current_level[14],
    posX: 0.2,
    posY: 0.3,
  };
  starsArray[15] = {
    realColor: stars_current_level[15],
    posX: 0.3,
    posY: 0.31,
  };
  starsArray[16] = {
    realColor: stars_current_level[16],
    posX: 0.4,
    posY: 0.32,
  };
  starsArray[17] = {
    realColor: stars_current_level[17],
    posX: 0.5,
    posY: 0.33,
  };
  starsArray[18] = {
    realColor: stars_current_level[18],
    posX: 0.6,
    posY: 0.34,
  };
  starsArray[19] = {
    realColor: stars_current_level[19],
    posX: 0.7,
    posY: 0.35,
  };
  starsArray[20] = {
    realColor: stars_current_level[20],
    posX: 0.8,
    posY: 0.36,
  };
  starsArray[21] = {
    realColor: stars_current_level[21],
    posX: 0.2,
    posY: 0.4,
  };
  starsArray[22] = {
    realColor: stars_current_level[22],
    posX: 0.3,
    posY: 0.41,
  };
  starsArray[23] = {
    realColor: stars_current_level[23],
    posX: 0.4,
    posY: 0.42,
  };
  starsArray[24] = {
    realColor: stars_current_level[24],
    posX: 0.5,
    posY: 0.43,
  };
  starsArray[25] = {
    realColor: stars_current_level[25],
    posX: 0.6,
    posY: 0.44,
  };
  starsArray[26] = {
    realColor: stars_current_level[26],
    posX: 0.7,
    posY: 0.45,
  };
  starsArray[27] = {
    realColor: stars_current_level[27],
    posX: 0.8,
    posY: 0.46,
  };
  starsArray[28] = {
    realColor: stars_current_level[28],
    posX: 0.2,
    posY: 0.5,
  };
  starsArray[29] = {
    realColor: stars_current_level[29],
    posX: 0.3,
    posY: 0.51,
  };
  starsArray[30] = {
    realColor: stars_current_level[30],
    posX: 0.4,
    posY: 0.52,
  };
  starsArray[31] = {
    realColor: stars_current_level[31],
    posX: 0.5,
    posY: 0.53,
  };
  starsArray[32] = {
    realColor: stars_current_level[32],
    posX: 0.6,
    posY: 0.54,
  };
  starsArray[33] = {
    realColor: stars_current_level[33],
    posX: 0.7,
    posY: 0.55,
  };
  starsArray[34] = {
    realColor: stars_current_level[34],
    posX: 0.8,
    posY: 0.56,
  };
  starsArray[35] = {
    realColor: stars_current_level[35],
    posX: 0.2,
    posY: 0.6,
  };
  starsArray[36] = {
    realColor: stars_current_level[36],
    posX: 0.3,
    posY: 0.61,
  };
  starsArray[37] = {
    realColor: stars_current_level[37],
    posX: 0.4,
    posY: 0.62,
  };
  starsArray[38] = {
    realColor: stars_current_level[38],
    posX: 0.5,
    posY: 0.63,
  };
  starsArray[39] = {
    realColor: stars_current_level[39],
    posX: 0.6,
    posY: 0.64,
  };
  starsArray[40] = {
    realColor: stars_current_level[40],
    posX: 0.7,
    posY: 0.65,
  };
  starsArray[41] = {
    realColor: stars_current_level[41],
    posX: 0.8,
    posY: 0.66,
  };
  return starsArray;
}

function ocultar_color_data() {
  $("#color-label").hide();
  $("#lb_color").hide();
  
}

function cambiar_label_color() {
  if (nivel_actual == "level1") {
    color1 = colorData.level1[0];
    color2 = secondColorData.level1[0];
  } else if (nivel_actual == "level2") {
    color1 = colorData.level2[0];
    color2 = secondColorData.level2[0];
  } else if (nivel_actual == "level3") {
    color1 = colorData.level3[0];
    color2 = secondColorData.level3[0];
  } else if (nivel_actual == "level4") {
    color1 = colorData.level4[0];
    color2 = secondColorData.level4[0];
  } else if (nivel_actual == "level5") {
    color1 = colorData.level5[0];
    color2 = secondColorData.level5[0];
  } else if (nivel_actual == "level6") {
    color1 = colorData.level6[0];
    color2 = secondColorData.level6[0];
  } else if (nivel_actual == "level7") {
    color1 = colorData.level7[0];
    color2 = secondColorData.level7[0];
  } else if (nivel_actual == "level8") {
    color1 = colorData.level8[0];
    color2 = secondColorData.level8[0];
  }
  if (color1.includes("g")) {
    color = "Verde";
  } else if (color1.includes("b")) {
    color = "Azul";
  } else if (color1.includes("y")) {
    color = "Amarillo";
  } else if (color1.includes("r")) {
    color = "Rojo";
  }
  if (color2.includes("g")) {
    color += " y Verde";
  } else if (color2.includes("b")) {
    color += " y Azul";
  } else if (color2.includes("y")) {
    color += " y Amarillo";
  } else if (color2.includes("r")) {
    color += " y Rojo";
  }

  $("#lb_color").text(color);
}

function tipo_juego() {
  var loc = document.location.href;
  //alert(loc.slice(loc.indexOf("0/") + 2,loc.indexOf("?")));
  return loc.slice(loc.indexOf("0/") + 2, loc.indexOf("?"));
}

function get_sent_data() {
  // funcion creada para obtener la informacion en get
  var loc = document.location.href;
  // si existe el interrogante
  if (loc.indexOf("?") > 0) {
    // cogemos la parte de la url que hay despues del interrogante
    var getString = loc.split("?")[1];
    // obtenemos un array con cada clave=valor
    var GET = getString.split("&");
    var get = {};
    // recorremos todo el array de valores
    for (var i = 0, l = GET.length; i < l; i++) {
      var tmp = GET[i].split("=");
      get[tmp[0]] = unescape(decodeURI(tmp[1]));
    }
    return get;
  }
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index,
    indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

function colorToSpanish(color) {
  if (color.length === 1) {
    if (color == "g") {
      return "verde";
    } else if (color == "b") {
      return "azul";
    } else if (color == "y") {
      return "amarillo";
    } else if (color == "r") {
      return "rojo";
    }
  } else {
    var resultado = "";
    for (var indice in color) {
      if (indice != 0) {
        resultado += " y ";
      }
      if (color[indice] == "g") {
        resultado += "verde";
      } else if (color[indice] == "b") {
        resultado += "azul";
      } else if (color[indice] == "y") {
        resultado += "amarillo";
      } else if (color[indice] == "r") {
        resultado += "rojo";
      }
    }
    return resultado;
  }
}

/* --------------Agentes Virtuales de CHATGPT------------------- */
//agente random al principio
agentes = ["peta","zeta"]

let random = Math.floor(Math.random() * ["peta","zeta"].length);
let lastAgentUsed = agentes[random];
var check=false;


//agregado un cambio de contexto para en función de la etapa
function SendMessageClick(e){
  e.preventDefault();
  let chatHistory = $(".chat-history1 ul");
  const message = $("#message-to-send1").val();
  let agentName = "";
  //Si el mensaje no esta vacío continuar con conversación
  if (message != ""){
    console.log(message);
    // Expresión regular para buscar el nombre del agente en el mensaje
    const agentRegex = /(Peta|Zeta)/i;
    const match = message.match(agentRegex);

    if (match) {
      agentName = match[0].toLowerCase(); // Convertir el nombre del agente a minúsculas
      lastAgentUsed = agentName; // Actualizar el último agente utilizado
    } else {
      // Si no se detecta ningún agente en el mensaje, utilizar el último agente utilizado
      agentName = lastAgentUsed;
    }

    var prompt_agente = "";
    if (agentName==="peta") {
      prompt_agente = prompt_contexto[0];
    } else {
      prompt_agente = prompt_contexto[1];
    }
     // Utilizamos chat-history1

    context.push({ role: "user", content: message });
		
    const li = $("<li class='message my-message'></li>").text(message);
    chatHistory.append(li);
    $("#message-to-send1").val("");

    const loadingIcon = $("<li class='message loading-message'></li>");
    const spinner = $("<div class='loading-spinner'></div>");
    loadingIcon.append(spinner).append("Escribiendo...");
    chatHistory.append(loadingIcon);
    const apiUrl = agentName === "peta" ? "/api/openai1" : "/api/openai2";
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context: [prompt_agente].concat(context)}),
    })
      .then((res) => res.json())
      .then((data) => {
        chatHistory.find("li.loading-message").remove();
        // console.log(JSON.parse(data.response).respuesta);
        console.log("data.response: ", data.response);
        data.response = JSON.parse(data.response);
        console.log("post_json parse: ",data.response);
        /*        
          Cambio de estrella:
            Detectar con data.response "Cambio de estrella" y saber a que agente le corresponde
            cuando se detecta cambiar la variable opcionSeleccionarP(1-2), para ello, detectar
            que estrella estuvieron de acuerdo a cambiar.

            Se resta 1 a la estrella para seguir el índice del mapa de estrellas (Arreglo Parcial)
        */
        if (typeof data.response.estrellaPeta !== "undefined" && data.response.acuerdoPeta===1) {
          //opcionSeleccionarPX debe ser capaz de recibir diferentes cantidades de estrellas
          //en funcion de variable: max_SelectData
          if(opcionElegidaP1.length < maxSelectData[nivel_actual][1]){
            opcionElegidaP1.push(data.response.estrellaPeta-1); 
          } 
          //eliminar el primer valor del arreglo opcionElegidaP1 y agregar data.response.Estrella-1
          else{
          opcionElegidaP1.shift();
          opcionElegidaP1.push(data.response.estrellaPeta-1);
          // const li = $("<span class='message other-message instruccion'></span>").text("Limite máximo de estrellas elegidas para Peta, se reemplazará la primera estrella elegida");
          // chatHistory.append(li);
          }
        }   

        //Se realiza la misma comparacion pero ahora con variable opcionElegidaP2
        else if (typeof data.response.estrellaZeta !== "undefined" && data.response.acuerdoZeta===1){


          if (opcionElegidaP2.length < maxSelectData[nivel_actual][2]) {
                opcionElegidaP2.push(data.response.estrellaZeta - 1);
          }
          else{
            opcionElegidaP2.shift();
            opcionElegidaP2.push(data.response.estrellaZeta - 1);
            // const li = $("<span class='message other-message instruccion'></span>").text("Limite máximo de estrellas elegidas para Zeta, se reemplazará la primera estrella elegida");
            // chatHistory.append(li);
          }
          //Se detecta cambio de estrella
          decision = true;
        }


        cantidad_seleccionada = (Number(maxSelectData[nivel_actual][1]) + Number(maxSelectData[nivel_actual][2])) - (opcionElegidaP1.length + opcionElegidaP2.length);
       
        // if (cantidad_seleccionada === 0) {
        //     const li = $("<span class='message other-message instruccion'></span>").text("Número máximo de estrellas elegidas para cada agente, pueden proceder a Seleccionar las estrellas");
        //     chatHistory.append(li);
        // }
        
        
        /*        
          Acuerdo:
            Detectar con data.response "Acuerdo" y cuando los agentes se ponen de acuerdo
            y pasar a la etapa de seleccion de estrellas.
            && cantidad_seleccionada === 0
        */

        if (data.response.acuerdo === "Acuerdo" ){
          alert("acuerdo");
          //Funcion de acuerdo
          $("#SendMessageButton1").replaceWith(
            "<button type='button' id='SendStarsButton1' onclick='sendButtonClick()'>Enviar tus estrellas</button>"
          );
          time_to_select = true;
          $("#SendStarsButton1").prop("disabled", true);
        }

        /*        
          Mensaje:
            En caso de que no corresponda a ninguno de los casos anteriores, solo se considera
            el mensaje de respuesta de la API y se muestra en el Chat.
        */
        else{
          const li = $("<li class='message other-message'></li>").text(
            data.response.respuesta
          );
          // Agregar nombre del agente y cambiar color según el agente
          // Cambiado color de fondo del chat de Peta
          if (agentName === "peta") {
            context.push({ role: "assistant", content: "Peta: "+data.response.respuesta});
            li.prepend("<span class='agent-name' style='color: #0cff00;'>Peta:</span> ");
          } else if (agentName === "zeta") {
            context.push({ role: "assistant", content: "Zeta: "+data.response.respuesta});
            li.prepend("<span class='agent-name' style='color: #7fff00;'>Zeta:</span> ");
          }
          else{
            agentName="zeta";
            context.push({ role: "assistant", content: "Zeta: "+data.response.respuesta});
            li.prepend("<span class='agent-name' style='color: #7fff00;'>Zeta:</span> ");
          }
          li.addClass(agentName);

          chatHistory.append(li);
          chatHistory.scrollTop(chatHistory[0].scrollHeight);
        }
    });
    chatHistory.scrollTop(chatHistory[0].scrollHeight);
  }
}

$("#SendMessageButton1").click(SendMessageClick);

//Estados de la app
$("#Estado_uno").click(() => {
  layer.show();
  $('.mapa').html("<img class='img-mapa' src='../images/ETAPAS/'"+imgmapa[""+etapas[0]+etapas[1]+etapas[2]+etapas[3]]+"'>");
  $(".mapa").hide();
  $(".img-mapa").attr(
    "src",
    "../images/ETAPAS/" +
      imgmapa["" + etapas[0] + etapas[1] + etapas[2] + etapas[3]]
  );
});

$("#Estado_dos").click(() => {
  $("#SendMessageButton1").replaceWith(
          "<button type='button' id='SendStarsButton1' onclick='sendButtonClick()'>Enviar tus estrellas</button>"
  );
  time_to_select = true;
});

$("#Estado_tres").click(() => {
  sendButtonClick();
});
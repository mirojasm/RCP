/*
Orden del chat según yo:
2
1
3
4
*/

var host = document.getElementById("client").getAttribute("host");
var port = document.getElementById("client").getAttribute("port");

var server = io.connect("localhost:3000");
var server = io.connect(serverURL);
var db;
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

server.on("test", function (data) {
  //alert("blas");
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
  indiceSeleccion = Math.floor(Math.random() * solutionsP2["level1"].length);
  opcionSeleccionarP2 = solutionsP2["level1"][indiceSeleccion];
  opcionSeleccionarP3 = solutionsP3["level1"][indiceSeleccion];
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
  server.emit("playGame", {
    tipo_juego: tipo_juego(),
    nombre_jugador: get_sent_data()["nombre_s"],
  });
});

function reiniciarLevel() {
  var P = new Promise((resolve, reject) => {
    if (nivel_actual === "level1") {
      server.emit("conversationPlay", 10);
      resolve("level4");
    } else if (nivel_actual === "level4") {
      server.emit("conversationPlay", 11);
      resolve("level6");
    } else if (nivel_actual === "level6") {
      server.emit("conversationPlay", 12);
      resolve("level8");
    } else if (nivel_actual === "level8") {
      server.emit("conversationPlay", 13);
      resolve("final");
    }
  });

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
    //borrar_tablero();
    //startGame(set_stars(nivel_actual));
    $(".erase_button").hide();
    $("#image-final-level").hide();
    $("#selectionTime").hide();
    $("#choicesTime").show();
  });
}

function borrar_tablero() {
  layer.remove();
  layer2.remove();
}

//frase que llega al chat
server.on("phrase", function (data) {
  var phrase = data.phrase.nodePhrases[data.phrase.nodePhraseIndex];
  console.log(data);
  console.log(nivel_actual);
  console.log(maxSelectData);

  if (phrase.indexOf("[i]") != -1) {
    decision = true;
    phrase = phrase.slice(0, phrase.length - 3);
  }
  if (phrase.indexOf("XX1") != -1) {
    var inicio = phrase.indexOf("XX1");
    phrase =
      phrase.slice(0, inicio) +
      jugador2 +
      phrase.slice(inicio + 3, phrase.length);
  }
  if (phrase.indexOf("XX2") != -1) {
    var inicio = phrase.indexOf("XX2");
    phrase =
      phrase.slice(0, inicio) +
      jugador3 +
      phrase.slice(inicio + 3, phrase.length);
  }
  if (data.author.name == "P1") {
    var dat = "A-" + nino_nombre + "-mensaje-" + phrase;
    server.emit("escribir_resultados", dat);
    lista_elegidas = [];
    opcion = $("input:radio[name=choice]:checked").val();
    if ($("input:radio[name=choice]:checked").data("selector")) {
      $(".seleccionada" + opcion).each(function () {
        var current_element = $("option:selected", this);
        lista_elegidas.push(current_element.text());
      });
    }
    if (decision && arreglo_decision.length == 0) {
      arreglo_decision = lista_elegidas.slice();
      for (var aux = 0; aux < arreglo_decision.length; aux++) {
        arreglo_decision[aux] = (
          parseInt(arreglo_decision[aux]) - 1
        ).toString();
      }
    }

    var indices = [];
    if (phrase.indexOf("[#]") != -1) {
      indices = getIndicesOf("[#]", phrase);
      for (var msge = 0; msge < indices.length; msge++) {
        var inicio = phrase.indexOf("[#]");
        phrase =
          phrase.slice(0, inicio) +
          lista_elegidas[msge] +
          phrase.slice(inicio + 3, phrase.length);
      }
    } else if (phrase.indexOf("[$]") != -1) {
      indices = getIndicesOf("[$]", phrase);
      for (var msge = 0; msge < indices.length; msge++) {
        var inicio = phrase.indexOf("[$]");
        phrase =
          phrase.slice(0, inicio) +
          lista_elegidas[msge] +
          phrase.slice(inicio + 3, phrase.length);
      }
    } else if (phrase.indexOf("[") != -1) {
      var inicio = phrase.indexOf("[");
      var fin = phrase.indexOf("]");
      phrase =
        phrase.slice(0, inicio) +
        lista_elegidas[0] +
        phrase.slice(fin + 1, phrase.length);
    }
  } else if (data.author.name == "P2") {
    var timesP2 = parseInt(maxSelectData[nivel_actual][1]);
    console.log(phrase);
    if (phrase.indexOf("[#]") != -1) {
      var indices = [];
      indices = getIndicesOf("[#]", phrase);
      if (indices.length > timesP2) {
        for (var msge = 0; msge < indices.length; msge++) {
          var inicio = phrase.indexOf("[#");
          phrase =
            phrase.slice(0, inicio) +
            (
              parseInt(solutionsData[nivel_actual][indiceSeleccion][msge]) + 1
            ).toString() +
            phrase.slice(inicio + 3, phrase.length);
        }
      } else {
        if (decision === true) {
          for (var msge = 0; msge < indices.length; msge++) {
            var inicio = phrase.indexOf("[#");
            phrase =
              phrase.slice(0, inicio) +
              (parseInt(lista_elegidas[msge]) + 1) +
              phrase.slice(inicio + 3, phrase.length);
          }
        } else {
          for (var msge = 0; msge < indices.length; msge++) {
            var inicio = phrase.indexOf("[#");
            //phrase = phrase.slice(0, inicio) + (parseInt(solutionsData[nivel_actual][indiceSeleccion][msge]) + 1).toString() + phrase.slice(inicio + 3, phrase.length);
            phrase =
              phrase.slice(0, inicio) +
              (parseInt(solutionsP2[nivel_actual][indiceSeleccion][msge]) + 1) +
              phrase.slice(inicio + 3, phrase.length);
          }
        }
      }
    } else if (phrase.indexOf("[$]") != -1) {
      var indices = [];
      console.log(allColors);
      indices = getIndicesOf("[$]", phrase);
      if (indices.length != 1) {
        for (var msge = 0; msge < indices.length; msge++) {
          var inicio = phrase.indexOf("[$");
          phrase =
            phrase.slice(0, inicio) +
            colorToSpanish(allColors[nivel_actual][msge]) +
            phrase.slice(inicio + 3, phrase.length);
        }
      } else {
        var inicio = phrase.indexOf("[$");
        phrase =
          phrase.slice(0, inicio) +
          colorToSpanish(colorP2[nivel_actual]) +
          phrase.slice(inicio + 3, phrase.length);
      }
    }

    if (phrase.indexOf("[") != -1) {
      var inicio = phrase.indexOf("[");
      var fin = phrase.indexOf("]");
      var opciones = phrase.slice(inicio + 1, fin);
      opciones = opciones.split(",");
      var randomChoice = Math.floor(Math.random() * opciones.length);
      phrase =
        phrase.slice(0, inicio) +
        opciones[randomChoice] +
        phrase.slice(fin + 1, phrase.length);
    }
  } else if (data.author.name == "P3") {
    var timesP3 = parseInt(maxSelectData[nivel_actual][2]);
    if (phrase.indexOf("[#]") != -1) {
      var indices = [];
      indices = getIndicesOf("[#]", phrase);
      if (indices.length > timesP3) {
        for (var msge = 0; msge < indices.length; msge++) {
          var inicio = phrase.indexOf("[#");
          phrase =
            phrase.slice(0, inicio) +
            (
              parseInt(solutionsData[nivel_actual][indiceSeleccion][msge]) + 1
            ).toString() +
            phrase.slice(inicio + 3, phrase.length);
        }
      } else {
        if (decision === true) {
          for (var msge = 0; msge < indices.length; msge++) {
            var inicio = phrase.indexOf("[#");
            phrase =
              phrase.slice(0, inicio) +
              (parseInt(lista_elegidas[msge]) + 1) +
              phrase.slice(inicio + 3, phrase.length);
          }
        } else {
          for (var msge = 0; msge < indices.length; msge++) {
            var inicio = phrase.indexOf("[#");
            //phrase = phrase.slice(0, inicio) + (parseInt(solutionsData[nivel_actual][indiceSeleccion][msge]) + 1).toString() + phrase.slice(inicio + 3, phrase.length);
            phrase =
              phrase.slice(0, inicio) +
              (parseInt(solutionsP3[nivel_actual][indiceSeleccion][msge]) + 1) +
              phrase.slice(inicio + 3, phrase.length);
          }
        }
      }
    } else if (phrase.indexOf("[$]") != -1) {
      var indices = [];
      indices = getIndicesOf("[$]", phrase);
      if (indices.length != 1) {
        for (var msge = 0; msge < indices.length; msge++) {
          var inicio = phrase.indexOf("[$");
          phrase =
            phrase.slice(0, inicio) +
            colorToSpanish(allColors[nivel_actual][msge]) +
            phrase.slice(inicio + 3, phrase.length);
        }
      } else {
        var inicio = phrase.indexOf("[$");
        phrase =
          phrase.slice(0, inicio) +
          colorToSpanish(colorP3[nivel_actual]) +
          phrase.slice(inicio + 3, phrase.length);
      }
    }
  }
  if (phrase.indexOf("[") != -1) {
    var inicio = phrase.indexOf("[");
    var fin = phrase.indexOf("]");
    var opciones = phrase.slice(inicio + 1, fin);
    opciones = opciones.split(",");
    var randomChoice = Math.floor(Math.random() * opciones.length);
    phrase =
      phrase.slice(0, inicio) +
      opciones[randomChoice] +
      phrase.slice(fin + 1, phrase.length);
  }

  // Esto pone la hora de envío al mensaje
  var t = new Date(),
    curHour =
      t.getHours() > 12
        ? t.getHours() - 12
        : t.getHours() < 10
        ? "0" + t.getHours()
        : t.getHours(),
    curMinute = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes(),
    curSeconds = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
  var time = "Enviado a las " + curHour + ":" + curMinute + ":" + curSeconds;
  var cl = $(".commentList"); //el text area del chat

  // Esto cambia las imágenes si es que es el autómata, le pone los nombres a los mensajes y manda el mensaje
  if (data.author.name == "Felipe") {
    $(".writing-text").text("Felipe está escribiendo ...");
    $(".writing").show();

    setTimeout(function () {
      $(".writing").hide();
      cl.append(
        "<li><div class='commenterImage p1'></div><div class='commentText comment'><p class=''><strong>Felipe:</strong> " +
          phrase +
          "</p> <span class='date sub-text'>" +
          time +
          "</span></div></li>"
      );
      cl.animate(
        {
          scrollTop: cl.prop("scrollHeight"),
        },
        100
      );
    }, 2000);
  } else if (data.author.name == "P2") {
    $(".writing-text").text("Peta está escribiendo ...");
    $(".writing").show();
    //cl.append("<li class='writing'><div class='commenterImage'><img src='" + serverURL + "/images/writing.gif'/></div><div class='commentText comment'><p class=''>" + jugador2 + " esta escribiendo...</p></div></li>");
    //cl.animate({ scrollTop: cl.prop("scrollHeight")}, 100);
    //delay para que dijera que esta escribiendo
    setTimeout(function () {
      $(".writing").hide();
      cl.append(
        "<li><div class='commenterImage p2'></div><div class='commentText comment'><p class=''><strong>" +
          jugador2 +
          ":</strong> " +
          phrase +
          "</p> <span class='date sub-text'>" +
          time +
          "</span></div></li>"
      );
      cl.animate(
        {
          scrollTop: cl.prop("scrollHeight"),
        },
        100
      );
    }, 2000);
  } else if (data.author.name == "P3") {
    $(".writing-text").text("Zata está escribiendo ...");
    $(".writing").show();
    //cl.append("<li class='writing'><div class='commenterImage'><img src='" + serverURL + "/images/writing.gif'/></div><div class='commentText comment'><p class=''>" + jugador3 + " esta escribiendo...</p></div></li>");
    //cl.animate({scrollTop: cl.prop("scrollHeight")}, 100);
    //delay para que dijera que esta escribiendo
    setTimeout(function () {
      $(".writing").hide();
      cl.append(
        "<li><div class='commenterImage p3'></div><div class='commentText comment'><p class=''><strong>" +
          jugador3 +
          ":</strong> " +
          phrase +
          "</p> <span class='date sub-text'>" +
          time +
          "</span></div></li>"
      );
      cl.animate(
        {
          scrollTop: cl.prop("scrollHeight"),
        },
        100
      );
    }, 2000);
  } else {
    cl.append(
      "<li><div class='commenterImage p4'></div><div class='commentText comment'><p class=''><strong>" +
        "Tú" +
        ":</strong> " +
        phrase +
        "</p> <span class='date sub-text'>" +
        time +
        "</span></div></li>"
    );
    cl.animate(
      {
        scrollTop: cl.prop("scrollHeight"),
      },
      100
    );
  }

  //siguiente frase, se activa si tiene dos cosas para decir
  setTimeout(function () {
    server.emit("phraseRead", "");
  }, 2000);
});

// set de opciones que me llegan
server.on("choices", function (data) {
  //Creamos el html de las nuevas opciones
  var content = "<div class='btn-group-vertical choices'>";
  for (var i = 0; i < data.length; i++) {
    var text =
      data[i].Fields["Menu Text"] == ""
        ? data[i].Fields["Dialogue Text"]
        : data[i].Fields["Menu Text"];
    text = parseText(text).text;
    if (text.indexOf("[i]") != -1) {
      text = text.slice(0, text.length - 3);
    }

    if (text.indexOf("XX1") != -1) {
      var inicio = text.indexOf("XX1");
      text =
        text.slice(0, inicio) + jugador2 + text.slice(inicio + 3, text.length);
    }
    if (text.indexOf("XX2") != -1) {
      var inicio = text.indexOf("XX2");
      text =
        text.slice(0, inicio) + jugador3 + text.slice(inicio + 3, text.length);
    }

    if (text.indexOf("[#]") != -1) {
      var indices = [];
      indices = getIndicesOf("[#]", text);
      //alert("indices " + indices);
      // generar array con 42 estrellas :
      var lista_numeros = [];
      for (var j = 1; j <= 42; j++) {
        lista_numeros.push(j.toString());
      }
      var selector = "<select class='seleccionada" + data[i].ID + "'>";
      //alert('seleccionada'+data[i].ID);
      selector += "<option value='0'>*Elije*</option>";
      for (var j = 0; j < lista_numeros.length; j++) {
        selector +=
          "<option value='" +
          lista_numeros[j] +
          "'>" +
          lista_numeros[j] +
          "</option>";
      }
      selector += "</select>";
      for (var msge = 0; msge < indices.length; msge++) {
        var inicio = text.indexOf("[#]");
        text =
          text.slice(0, inicio) +
          selector +
          text.slice(inicio + 3, text.length);
      }
      var hay_selector = true;
      content +=
        "<input type='radio' name='choice' class='opcion' data-selector='true' nodeid='" +
        data[i].ID +
        "' value='" +
        data[i].ID +
        "' >" +
        " " +
        text +
        "<br>";
      selector = "";
    } else if (text.indexOf("[$]") != -1) {
      indices = [];
      indices = getIndicesOf("[$]", text);
      //alert("indices " + indices);
      // generar array con 42 estrellas ;
      var opciones = ["rojo", "verde", "azul", "amarillo"];
      var selector = "<select class='seleccionada" + data[i].ID + "'>";
      //alert('seleccionada'+data[i].ID);
      selector += "<option value='0'>*Elije*</option>";

      for (var jc = 0; jc < opciones.length; jc++) {
        selector +=
          "<option value='" + opciones[jc] + "'>" + opciones[jc] + "</option>";
      }
      selector += "</select>";
      for (var msge = 0; msge < indices.length; msge++) {
        var inicio = text.indexOf("[$]");
        text =
          text.slice(0, inicio) +
          selector +
          text.slice(inicio + 3, text.length);
      }
      var hay_selector = true;
      content +=
        "<input type='radio' name='choice' class='opcion' data-selector='true' nodeid='" +
        data[i].ID +
        "' value='" +
        data[i].ID +
        "' >" +
        " " +
        text +
        "<br>";
      selector = "";
    } else if (text.indexOf("[") !== -1) {
      indices = [];
      indices = getIndicesOf("[", text);
      for (var msge = 0; msge < indices.length; msge++) {
        var inicio = text.indexOf("[");
        var fin = text.indexOf("]");
        var opciones = text.slice(inicio + 1, fin);
        opciones = opciones.split(",");
        var selector = "<select class='seleccionada" + data[i].ID + "'>";
        selector += "<option value='0'>*Elije*</option>";
        for (var j = 0; j < opciones.length; j++) {
          selector +=
            "<option value='" + opciones[j] + "'>" + opciones[j] + "</option>";
        }
        selector += "</select>";
        text =
          text.slice(0, inicio) + selector + text.slice(fin + 1, text.length);
        //text = text.slice(0, inicio) + selector + text.slice(inicio + 3, text.length);
      }

      var hay_selector = true;
      content +=
        "<input type='radio' name='choice' class='opcion' data-selector='true' nodeid='" +
        data[i].ID +
        "' value='" +
        data[i].ID +
        "' >" +
        " " +
        text +
        "<br>";
      selector = "";
    } else {
      content +=
        "<input type='radio' name='choice' class='opcion' data-selector='false' nodeid='" +
        data[i].ID +
        "' value='" +
        data[i].ID +
        "' >" +
        " " +
        text +
        "<br>";
    }
  }
  content +=
    "<input type='submit' name='submit' value='' class='btn btn-info aChoice' disabled></div>";
  // Todo esto para transformar las opciones a botones.
  //insertamos las opciones
  $(".choices").replaceWith(content);

  $("input:radio[name=choice]").change(function () {
    //var data = "El niño ha cambiado su radio button a: " + this.value;
    //server.emit('escribir_resultados', data);
  });

  // aChoice es la clase de una opcion
  // deshabilitar botones cuando envian
  $(".aChoice").click(function () {
    var opcion;
    opcion = $("input:radio[name=choice]:checked").val();
    hubo_selector = $("input:radio[name=choice]:checked").data("selector");
    $(".aChoice").prop("disabled", true);
    $(".opcion").prop("disabled", true);
    $(".varChanged").prop("disabled", true);
    server.emit("phraseChosen", opcion);
    var data = "A-" + nino_nombre + "-nodo-" + opcion;
    server.emit("escribir_resultados", data);
  });

  $(".opcion").click(function () {
    $(".aChoice").prop("disabled", false);
  });

  $(".aChoice").each(function (i, d) {
    $(d).emoji();
  });

  $(".varChanged").click(function () {
    var nodeId = $(this).attr("nodeid");
    var playerVars = new Array();
    $(".aChoice").prop("disabled", true);
    $(".varChanged").prop("disabled", true);
    //alert(eleccionTT);
    server.emit("varChanged", {
      nodeId: nodeId,
      vars: playerVars,
      eleccionTT: eleccionTT,
    });
  });
});

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

var loadDataVars = function (data) {
  P = new Promise(function (resolve, reject) {
    currentVariableState["A1"] = data["A1"];
    currentVariableState["A2"] = data["A2"];
    currentVariableState["A3"] = data["A3"];
    currentVariableState["exp"] = data["exp"];
    currentVariableState["Puntaje_I5"] = data["Puntaje_I5"];
    currentVariableState["Puntaje_I6"] = data["Puntaje_I6"];
    currentVariableState["Puntaje_I8"] = data["Puntaje_I8"];
    currentVariableState["Puntaje_I9"] = data["Puntaje_I9"];
    currentVariableState["Puntaje_I10"] = data["Puntaje_I10"];
    currentVariableState["Puntaje_I11"] = data["Puntaje_I11"];
    currentVariableState["Puntaje_I12"] = data["Puntaje_I12"];
    currentVariableState["Puntaje_I14"] = data["Puntaje_I14"];
    currentVariableState["Puntaje_I15"] = data["Puntaje_I15"];
    currentVariableState["Puntaje_I16"] = data["Puntaje_I16"];
    currentVariableState["Puntaje_I17"] = data["Puntaje_I17"];
    currentVariableState["Puntaje_I18"] = data["Puntaje_I18"];
    currentVariableState["Puntaje_I20"] = data["Puntaje_I20"];
    currentVariableState["Puntaje_I21"] = data["Puntaje_I21"];
    currentVariableState["Puntaje_I22"] = data["Puntaje_I22"];
    currentVariableState["Puntaje_I23"] = data["Puntaje_I23"];
    resolve("");
  });
  return P;
};

varLevel = 0;
etapa = 0;

// si te llegan variables. Como las nuevas estrellas del nivel.
server.on("variables", function (data) {
  var imageArray = document.getElementById("client").getAttribute("imageNames");

  if ("etapa" in data && etapa != data["etapa"]) {
    etapa = data["etapa"];
    $("#col1").css(
      "background-image",
      "url(../images/" + imageArray[etapa] + ")"
    );
  }

  if (data["show_stars"] == 0) {
    layer.show();
    //$('.mapa').html("<img class='img-mapa' src='../images/ETAPAS/'"+imgmapa[""+etapas[0]+etapas[1]+etapas[2]+etapas[3]]+"'>");
    $(".mapa").hide();
    $(".img-mapa").attr(
      "src",
      "../images/ETAPAS/" +
        imgmapa["" + etapas[0] + etapas[1] + etapas[2] + etapas[3]]
    );
  } else {
    layer.hide();
    $(".mapa").show();
    $(".img-mapa").attr(
      "src",
      "../images/ETAPAS/" +
        imgmapa["" + etapas[0] + etapas[1] + etapas[2] + etapas[3]]
    );
  }

  if (varLevel != data["level"]) {
    //alert("pasaron al nivel "+data["level"]);
    varLevel = data["level"];
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
      borrar_tablero();
      startGame(set_stars(nivel_actual));
      $("#image-final-level").hide();
      $("#selectionTime").hide();
      $("#choicesTime").show();
    });
  }
  if (data["x1"] == true && nivel_actual == "nivel1") {
    decision = true;
    loadDataVars(data).then(function (successMessage) {
      escribirPuntajes();
    });
  } else if (data["x2"] == true && nivel_actual == "nivel4") {
    decision = true;
    loadDataVars(data).then(function (successMessage) {
      escribirPuntajes();
    });
  } else if (data["x3"] == true && nivel_actual == "nivel6") {
    decision = true;
    loadDataVars(data).then(function (successMessage) {
      escribirPuntajes();
    });
  } else if (data["x4"] == true && nivel_actual == "nivel8") {
    decision = true;
    loadDataVars(data).then(function (successMessage) {
      escribirPuntajes();
    });
  } else {
    loadDataVars(data).then(function (successMessage) {
      escribirPuntajes();
    });
  }
});

// por si la conversacion termina
server.on("conversationEnd", function (data) {
  var data = "A-" + nino_nombre + "-Estado-Tiempo para elegir las estrellas:";
  server.emit("escribir_resultados", data);
  $("#choicesTime").hide();
  $("#selectionTime").show();
  $("#selectionTimeButton").replaceWith(
    "<input type='submit' name='submit' value='Enviar tus estrellas' id='selectionTimeButton' class='btn-group-vertical btn btn-info aChoice2' disabled>"
  );
  $("#selectionTimeButton").click(function () {
    sendButtonClick();
  });
  time_to_select = true;
});

var sendButtonClick = function () {
  var data = "A-" + nino_nombre + "-Estado-CLICK para enviar estrellas.";
  server.emit("escribir_resultados", data);
  $(".erase_button").hide();
  estrellas_finales = estrellas_seleccionadas
    .concat(opcionSeleccionarP2)
    .concat(opcionSeleccionarP3);
  //alert("estrellas_seleccionadas" + estrellas_seleccionadas);
  for (var au = 0; au < estrellas_finales.length; au++) {
    selectStar(estrellas_finales[au].toString());
  }
  b = solutionsData[nivel_actual];
  if (decision) {
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
    for (var select = 0; select < estrellas_seleccionadas.length; select++) {
      if (
        arreglo_decision.indexOf(estrellas_seleccionadas[select].toString()) ==
        -1
      ) {
        arreglo_decision.push(estrellas_seleccionadas[select].toString());
      }
    }
    var data =
      "A-" +
      nino_nombre +
      "-Estado-Los jugadores han seleccionado las estrellas: " +
      JSON.stringify(arreglo_decision);
    server.emit("escribir_resultados", data);

    for (var i = 0; i < b.length; i++) {
      var aparece = true;
      for (var j = 0; j < arreglo_decision.length; j++) {
        if (b[i].indexOf(arreglo_decision[j].toString()) == -1) {
          aparece = false;
          break;
        }
      }
      if (aparece) {
        break;
      }
    }
  } else {
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
  if (aparece) {
    $("#image-final-level").attr("src", "../images/level_won.png");
    var data =
      "A-" + nino_nombre + "-resultado-" + nivel_actual + "RESULTADO CORRECTO";
    server.emit("escribir_resultados", data);
    var data = "A-" + nino_nombre + "-nodo-" + opcion;

    if (nivel_actual == "level1") {
      etapas[0] = 2;
      currentVariableState["Puntaje_I7"] = 4;
      currentVariableState["Puntaje_I13"] = -1;
      currentVariableState["Puntaje_I19"] = -1;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level4") {
      etapas[1] = 2;
      currentVariableState["Puntaje_I13"] = 4;
      currentVariableState["Puntaje_I19"] = -1;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level6") {
      etapas[2] = 2;
      currentVariableState["Puntaje_I19"] = 4;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level8") {
      etapas[0] = 2;
      currentVariableState["Puntaje_I24"] = 4;
      escribirPuntajes();
    }
    $("#image-final-level").show();
    decision = false;
    setTimeout(function () {
      reiniciarLevel();
    }, 5000);
  } else {
    $("#image-final-level").attr("src", "../images/level_lost.png");
    var data =
      "A-" +
      nino_nombre +
      "-resultado-" +
      nivel_actual +
      "RESULTADO INCORRECTO";
    server.emit("escribir_resultados", data);
    if (nivel_actual == "level1") {
      etapas[0] = 1;
      currentVariableState["Puntaje_I7"] = 1;
      currentVariableState["Puntaje_I13"] = -1;
      currentVariableState["Puntaje_I19"] = -1;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level4") {
      etapas[1] = 1;
      currentVariableState["Puntaje_I13"] = 1;
      currentVariableState["Puntaje_I19"] = -1;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level6") {
      etapas[2] = 1;
      currentVariableState["Puntaje_I19"] = 1;
      currentVariableState["Puntaje_I24"] = -1;
      escribirPuntajes();
    } else if (nivel_actual == "level8") {
      etapas[3] = 1;
      currentVariableState["Puntaje_I24"] = 1;
      escribirPuntajes();
    }
    $("#image-final-level").show();
    decision = false;
    setTimeout(function () {
      reiniciarLevel();
    }, 5000);
  }
};

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
          $("#chat_button").prop("disabled", false);
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
      $("#selectionTimeButton").prop("disabled", false);
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
      $("#selectionTimeButton").prop("disabled", false);
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
  layer2.add(circle);
  layer2.drawScene();
}

$(".erase_button").click(unselectStar);

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
  $("#selectionTimeButton").prop("disabled", true);
  $(".erase_button").hide();
}

function set_stars(level) {
  var data = "A-" + nino_nombre + "-" + level.toUpperCase();
  //alert(data);
  server.emit("escribir_resultados", data);
  starsArray = new Array();
  if (level == "level1") {
    stars_current_level = levelsData.level1;
    $("#lb_etapa").text("Nivel 1");
    cambiar_label_color();
    current_color = colorData.level1[0];
    current_second_color = secondColorData.level1[0];
    current_solution = solutionsData.level1;
    current_max_select = maxSelectData.level1[0];
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
  } else if (level == "level4") {
    stars_current_level = levelsData.level4;
    $("#lb_etapa").text("Nivel 2");

    cambiar_label_color();
    current_color = colorData.level4[0];
    current_second_color = secondColorData.level4[0];
    current_solution = solutionsData.level4;
    current_max_select = maxSelectData.level4[0];
  } else if (level == "level5") {
    stars_current_level = levelsData.level5;
    $("#lb_etapa").text("Nivel 5");
    cambiar_label_color();
    current_color = colorData.level5[0];
    current_second_color = secondColorData.level5[0];
    current_solution = solutionsData.level5;
    current_max_select = maxSelectData.level5[0];
  } else if (level == "level6") {
    stars_current_level = levelsData.level6;
    $("#lb_etapa").text("Nivel 3");
    ocultar_color_data();
    current_color = colorData.level6[0];
    current_second_color = secondColorData.level6[0];
    current_solution = solutionsData.level6;
    current_max_select = maxSelectData.level6[0];
  } else if (level == "level7") {
    stars_current_level = levelsData.level7;
    $("#lb_etapa").text("Nivel 7");
    cambiar_label_color();
    current_color = colorData.level7[0];
    current_second_color = secondColorData.level7[0];
    current_solution = solutionsData.level7;
    current_max_select = maxSelectData.level7[0];
  } else if (level == "level8") {
    stars_current_level = levelsData.level8;
    $("#lb_etapa").text("Nivel 4");
    ocultar_color_data();
    current_color = colorData.level8[0];
    current_second_color = secondColorData.level8[0];
    current_solution = solutionsData.level8;
    current_max_select = maxSelectData.level8[0];
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

if (window.location.pathname == "/b") {
  var aText = new Array(
    "<h1>Bienvenido<h1>",
    "Sofía es una cientifica que trabaja encontrando nuevas moléculas y necesita tu ayuda para encontrar la cura a una enfermedad."
  );
  var aText2 = new Array(
    [
      "<h1>Bienvenido<h1>",
      "Sofía es una cientifica que trabaja encontrando nuevas moléculas y necesita tu ayuda para encontrar la cura a una enfermedad.",
    ],
    [
      "Para lograrlo tendrás que trabajar con Juan Protón y Elisa Electrón que se encuentran en laboratorios diferentes.",
    ],
    ["Recuerda trabajar en equipo."]
  );
} else {
  var aText = new Array(
    "<h1>Bienvenido<h1>",
    "Felipe es un astronauta que se ha perdido y necesita tu ayuda para volver a su nave."
  );
  var aText2 = new Array(
    [
      "<h1>Bienvenido<h1>",
      "Felipe es un astronauta que se ha perdido y necesita tu ayuda para volver a su nave.",
    ],
    [
      "Para lograrlo tendrás que trabajar con Peta y Zeta que se encuentran en estaciones espaciales diferentes.",
    ],
    ["Recuerda trabajar en equipo."]
  );
}

$("#img_tutorial").click(function () {
  num++;
  if (num > 21) {
    if (window.location.pathname == "/b") {
      window.location.replace("/index_atomos");
    } else {
      window.location.replace("/");
    }
  } else {
    jun = ruta.concat(forma).concat(num).concat(".JPG");
    $("#img_tutorial").attr("src", jun);
  }
});

// set up text to print, each item in array is new line

var iSpeed = 30; // time delay of print out
var iIndex = 0; // start printing array at this posision
var iArrLength = aText[0].length; // the length of the text array
var iScrollAt = 20; // start scrolling up at this many lines

var iTextPos = 0; // initialise text position
var sContents = ""; // initialise contents variable
var iRow; // initialise current row

function typewriter() {
  sContents = " ";
  iRow = Math.max(0, iIndex - iScrollAt);
  var destination = document.getElementById("typedtext");

  while (iRow < iIndex) {
    sContents += aText[iRow++] + "<br />";
  }
  destination.innerHTML =
    sContents + aText[iIndex].substring(0, iTextPos) + "_";
  if (iTextPos++ == iArrLength) {
    iTextPos = 0;
    iIndex++;
    if (iIndex != aText.length) {
      iArrLength = aText[iIndex].length;
      setTimeout("typewriter()", 500);
    } else {
      $(".next-btn").show();
      $(".back-btn").show();
    }
  } else {
    setTimeout("typewriter()", iSpeed);
  }
}
$(".felipe").hide();
$(".next-btn").hide();
$(".back-btn").hide();
$(".start-btn").click(function () {
  $(".start-btn").hide();
  $(".felipe").show();
  typewriter();
});
var i = 0;
$(".next-btn").click(function () {
  if (i > 2) {
    if (window.location.pathname == "/b") {
      window.location.replace("/index_atomos");
    } else if (window.location.pathname == "/a") {
      window.location.replace("/index_estrellas");
    } else if (window.location.pathname == "/c") {
      window.location.replace("/index_estrellas_test");
    }
  } else {
    i++;
    aText = aText2[i];
    iArrLength = aText[0].length;
    iIndex = 0;
    iScrollAt = 20; // start scrolling up at this many lines
    iTextPos = 0; // initialise text position
    sContents = ""; // initialise contents variable
    iRow; // initialise current row
    typewriter();
  }
});
$(".back-btn").click(function () {
  if (i > 0) {
    i--;
    aText = aText2[i];
    iArrLength = aText[0].length;
    iIndex = 0;
    iScrollAt = 20; // start scrolling up at this many lines
    iTextPos = 0; // initialise text position
    sContents = ""; // initialise contents variable
    iRow; // initialise current row
    typewriter();
  }
});

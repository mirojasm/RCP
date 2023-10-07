var config = require("../settings.js");
const { generateResponse1,generateResponse2 } = require("../openai/index.js");
const { generateResponseFromMessages1,generateResponseFromMessages2 } = require("../openai/index.js");

/*
 * Atiende a las solicitudes realizadas al home de la app.
 * Delega la resposabilidad a los otros controladores según corresponda.
 */
var express = require("express");
var router = express.Router();

//Todas las rutas que comiencen con /chat se delegan a su controlador.
//router.use('/chat', require('./chat'))

router.get("/", function (req, res) {
  res.render("index", {
    title: "Actividad Colaborativa",
    names: getNames(),
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/resultados", function (req, res) {
  res.render("results", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
  });
});

router.post("/write_results", function (req, res) {
  write_scores(req.body.results);
});

router.get("/index_estrellas", function (req, res) {
  res.render("index_estrellas", {
    title: "Actividad Colaborativa",
    names: getNames(),
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/index_atomos", function (req, res) {
  res.render("index_atomos", {
    title: "Actividad Colaborativa",
    names: getNames(),
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/a", function (req, res) {
  res.render("tutorial", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
  });
});

/* Prueba inicio --------------------------- */
router.get("/c", function (req, res) {
  res.render("tutorial", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/index_estrellas_test", function (req, res) {
  res.render("test/index_estrellas_test", {
    title: "Actividad Colaborativa",
    names: getNames(),
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/constelaciones_test", function (req, res) {
  res.render("test/constelaciones_test", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
    imageNames: config.IMAGE_NAMES_CONSTELACIONES,
  });
});

router.post("/api/openai1", function (req, res) {
  //console.log("context "+req.body.context)
  generateResponseFromMessages1(req.body.context).then((response) => {
    res.json({ response });
  });
});
router.post("/api/openai2", function (req, res) {
  //console.log(req.body.context)
  generateResponseFromMessages2(req.body.context).then((response) => {
    res.json({ response });
  });
});



/* Prueba Final --------------------------- */

router.get("/b", function (req, res) {
  res.render("tutorial_atomos", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
  });
});

router.get("/constelaciones", function (req, res) {
  res.render("constelaciones", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
    imageNames: config.IMAGE_NAMES_CONSTELACIONES,
  });
});

router.get("/atomos", function (req, res) {
  // nombre de la vista que se debe mostrar
  res.render("atomos", {
    title: "Actividad Colaborativa",
    host: config.HOST,
    port: config.PORT,
    imageNames: config.IMAGE_NAMES_ATOMS,
  });
});

module.exports = router;

function write_scores(data) {
  var data = data + "\r\n";
  var fs = require("fs");
  fs.appendFile("./puntajes.txt", data, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The scores was saved!");
  });
}

function getNames() {
  var fs = require("fs");
  var arr1 = [];
  newDir = "assets/nombre.txt";
  var data = fs.readFileSync(newDir, "utf8");
  var aux1 = data.split("\n");
  var arr = JSON.stringify(aux1);
  var json = {};
  json.names = arr;
  console.log(json);
  return aux1;
}

exports.index = function (req, res) {
  var fs = require("fs");
  newDir = "assets/nombre.txt";
  fs.readFile(newDir, "utf8", function (err, data) {
    if (err) {
      console.log("malo");
      console.log(err);
    } else {
      data = data.replace(/(\r\n|\n|\r)/gm, "");
      var aux1 = data.split("*");
      console.log(aux1);
      var arr = JSON.stringify(aux1);
      res.json(arr);
    }
  });
};

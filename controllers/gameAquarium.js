var chat = require('../models/chat.js');

module.exports = function(io, socket) {
    var cm;
    socket.on('loadGame', function (data) {
        // do stuff here and use the model
        cm = new chat(data.tipo_juego);
        cm.load();
        cm.AddEventListener("onNode", function(params) {
			console.log("emit phrase event");
            var actor = cm.GetActor(cm.currentNode.Fields["Actor"]);
            socket.emit('phrase', {author:actor, phrase:params});
    	});
    	cm.AddEventListener("onChoice", function(choices) {
	        socket.emit('choices', choices);
    	});
	    cm.AddEventListener("onConversationEnd", function() {
	        socket.emit('conversationEnd', null);
	    });
        cm.AddEventListener("onVariablesChanged", function(){
            // console.log(JSON.stringify(cm.getVariables()));
            socket.emit('variables', cm.getVariables());
        });
  		
        /*
        console.log("tipo juego: "+data.tipo_juego);
        console.log("Niveles de las estrellas");
        console.log(starLevels());
        console.log("Soluciones");
        console.log(solutions());
        console.log("Color");
        console.log(color());
        console.log("Segundo color");
        console.log(secondColor());
        console.log("Maxima seleccion");
        console.log(maxSelect());
        console.log("Niveles de las átomos");
        console.log(starLevels2());
        console.log("Soluciones átomos");
        console.log(solutions2());

        console.log("Nombre de los jugadores: "+data.nombre_jugador);
        */
        if(data.tipo_juego == 'constelaciones')
        {
            socket.emit('test',  {stars_level: JSON.stringify(starLevels()), solutions_level: JSON.stringify(solutions()),
                color: JSON.stringify(color()), second_color: JSON.stringify(secondColor()), max_select: JSON.stringify(maxSelect()),
                atoms_level: JSON.stringify(starLevels2()), solutions_atoms: JSON.stringify(solutions2()), partners: getPartners(data.nombre_jugador)
            });
        }
        else{
            socket.emit('test',  {stars_level: JSON.stringify(starLevels()), solutions_level: JSON.stringify(solutions()),
                color: JSON.stringify(color_atoms()), second_color: JSON.stringify(secondColor_atoms()), max_select: JSON.stringify(maxSelect_atoms()),
                atoms_level: JSON.stringify(starLevels2()), solutions_atoms: JSON.stringify(solutions2()), partners: getPartners(data.nombre_jugador)
            });
        }
        //m.PlayConversation(cm.GetConversationIndex(6));
    });

    socket.on("playGame", function(){
        if (cm != null){
            cm.start();
        }     
    });

    socket.on("phraseRead", function(){
      if (cm != null){  
        cm.NextPhrase();// NodeFinished(self.ds.currentNode)
        }     
    });

    socket.on("phraseChosen", function(data) {
      if (cm != null){ 
        cm.PlayNode(cm.GetNode(data));
        }
    });

    socket.on("varChanged", function(data) {
        //cambiar variables
        if (cm != null){ 
            for (var i in data.vars) {
                cm.SetVar(data.vars[i].name, data.vars[i].val);
            }
            cm.SetVar("eleccionTT", data.eleccionTT);
            cm.PlayNode(cm.GetNode(data.nodeId));
    }
    });

    socket.on("conversationPlay", function(data) {
        if (cm != null){ 
            cm.PlayConversation(cm.GetConversationIndex(data));
        }
    });

    socket.on('escribir_resultados', function(data){
        write_results(data);
    });

    socket.on('escribir_puntajes', function(data){
        write_scores(data);
    });


}

function starLevels(){
    var fs = require('fs');
    var arr1 = [];
    newDir = "assets/levels_stars.txt";
    var data = fs.readFileSync(newDir, 'utf8');

            data = data.replace(/(\r\n|\n|\r)/gm, '');
            data = data.replace('-',',');
            data = data.replace(' ','');
        for (var i=0;i < 41 ;i++){
            data = data.replace("-",",");
        }
        var aux1 = data.split('*');
        for (var i = 0; i < aux1.length; i++) {
            var aux2 = aux1[i].split(',');
            arr1[i] = aux2;
        }
        var arr = JSON.stringify(arr1);
        var json = {};
        json.level1 = arr1[0];
        json.level2 = arr1[1];
        json.level3 = arr1[2];
        json.level4 = arr1[3];
        json.level5 = arr1[4];
        json.level6 = arr1[5];
        json.level7 = arr1[6];
        json.level8 = arr1[7];
        /* console.log(json);
        console.log(typeof(json));
        console.log(json.level1);
        console.log(Object.keys(json));*/
        // console.log(JSON.stringify(json));
        return json;
      }

function solutions(){
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/stars_objectives.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('-');
    for (var i = 0; i < aux1.length; i++) {
          var aux2 = aux1[i].split('/');
          arr1[i] = aux2;
        }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var arr = JSON.stringify(arr3);
    var json = {};
    json.level1 = arr3[0];
    json.level2 = arr3[1];
    json.level3 = arr3[2];
    json.level4 = arr3[3];
    json.level5 = arr3[4];
    json.level6 = arr3[5];
    json.level7 = arr3[6];
    json.level8 = arr3[7];
    return json;
}


function color() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/colors.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[0][0];
    json.level2 = arr3[0][1];
    json.level3 = arr3[0][2];
    json.level4 = arr3[0][3];
    json.level5 = arr3[0][4];
    json.level6 = arr3[0][5];
    json.level7 = arr3[0][6];
    json.level8 = arr3[0][7];
    return json;
}

function color_atoms() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/colors.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[1][0];
    json.level2 = arr3[1][1];
    json.level3 = arr3[1][2];
    json.level4 = arr3[1][3];
    json.level5 = arr3[1][4];
    json.level6 = arr3[1][5];
    json.level7 = arr3[1][6];
    json.level8 = arr3[1][7];
    return json;
}

function secondColor_atoms() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/second_color.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[1][0];
    json.level2 = arr3[1][1];
    json.level3 = arr3[1][2];
    json.level4 = arr3[1][3];
    json.level5 = arr3[1][4];
    json.level6 = arr3[1][5];
    json.level7 = arr3[1][6];
    json.level8 = arr3[1][7]; 
    return json;

}

function secondColor() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/second_color.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[0][0];
    json.level2 = arr3[0][1];
    json.level3 = arr3[0][2];
    json.level4 = arr3[0][3];
    json.level5 = arr3[0][4];
    json.level6 = arr3[0][5];
    json.level7 = arr3[0][6];
    json.level8 = arr3[0][7];
    return json;

}

function maxSelect() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/maxselect.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[0][0];
    json.level2 = arr3[0][1];
    json.level3 = arr3[0][2];
    json.level4 = arr3[0][3];
    json.level5 = arr3[0][4];
    json.level6 = arr3[0][5];
    json.level7 = arr3[0][6];
    json.level8 = arr3[0][7];

    return json;

}

function maxSelect_atoms() {
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/maxselect.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('*');
    for (var i = 0; i < aux1.length; i++) {
        var aux2 = aux1[i].split('/');
        arr1[i] = aux2;
    }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var json = {};
    // json.stars = {};
    // json.atoms = {};
    json.level1 = arr3[1][0];
    json.level2 = arr3[1][1];
    json.level3 = arr3[1][2];
    json.level4 = arr3[1][3];
    json.level5 = arr3[1][4];
    json.level6 = arr3[1][5];
    json.level7 = arr3[1][6];
    json.level8 = arr3[1][7];

    return json;

}


function starLevels2(){
    var fs = require('fs');
    var arr1 = [];
    newDir = "assets/levels_atoms.txt";
    var data = fs.readFileSync(newDir, 'utf8');

            data = data.replace(/(\r\n|\n|\r)/gm, '');
            data = data.replace('-',',');
            data = data.replace(' ','');
        for (var i=0;i < 41 ;i++){
            data = data.replace("-",",");
        }
        var aux1 = data.split('*');
        for (var i = 0; i < aux1.length; i++) {
            var aux2 = aux1[i].split(',');
            arr1[i] = aux2;
        }
        var arr = JSON.stringify(arr1);
        var json = {};
        json.level1 = arr1[0];
        json.level2 = arr1[1];
        json.level3 = arr1[2];
        json.level4 = arr1[3];
        json.level5 = arr1[4];
        json.level6 = arr1[5];
        json.level7 = arr1[6];
        json.level8 = arr1[7];
        /* console.log(json);
        console.log(typeof(json));
        console.log(json.level1);
        console.log(Object.keys(json));*/
        // console.log(JSON.stringify(json));
        return json;
      }

function solutions2(){
    var fs = require('fs');
    var arr1 = [];
    var arr3 = [];
    newDir = "assets/atoms_objectives.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    var aux1 = data.split('-');
    for (var i = 0; i < aux1.length; i++) {
          var aux2 = aux1[i].split('/');
          arr1[i] = aux2;
        }
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = [];
        for (var j = 0; j < arr1[i].length; j++) {
            var lista = arr1[i][j].split(',');
            arr2.push(lista);
        }
        arr3.push(arr2);
    }
    var arr = JSON.stringify(arr3);
    var json = {};
    json.level1 = arr3[0];
    json.level2 = arr3[1];
    json.level3 = arr3[2];
    json.level4 = arr3[3];
    json.level5 = arr3[4];
    json.level6 = arr3[5];
    json.level7 = arr3[6];
    json.level8 = arr3[7];
    return json;
}

function getPartners(playerName){
    var fs = require('fs');
    var arr1 = [];
    newDir = "assets/nombre.txt";
    var data = fs.readFileSync(newDir, 'utf8');
    var aux1 = data.split("\n"); 
    var rand1 = aux1[Math.floor(Math.random() * aux1.length)];
    var rand2 = aux1[Math.floor(Math.random() * aux1.length)];
    while(rand1 == rand2 || playerName == rand2 || rand1 == playerName)
    {
        rand1 = aux1[Math.floor(Math.random() * aux1.length)];
        rand2 = aux1[Math.floor(Math.random() * aux1.length)];
    }
    return [rand1, rand2];
}



function write_results(data) {
    var data = data + "\r\n"
    var fs = require('fs');
    fs.appendFile("./resultados.txt", data, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function write_scores(data) {
    var t = new Date(),
    curHour = t.getHours() > 12 ? t.getHours() - 12 : (t.getHours() < 10 ? "0" + t.getHours() : t.getHours()),
    curMinute = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes(),
    curSeconds = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
    var time = curHour + ":" + curMinute + ":" + curSeconds;
    var data = time+"-"+data + "\r\n"
    var fs = require('fs');
    fs.appendFile("./puntajes.txt", data, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file scores was saved!");
    });
}

/* Leer los siguientes:
- El que dice el orden de los colores -> levels_stars
- El que dice cuantas puede seleccionar maximo -> max_select
- Que color deben seleccionar por nivel. Advertirle si eligen otra -> colors, second_color
- El que dice la respuesta correcta es stars_objetives
*/

/*
 *
 *
 * Events
 * onLoaded() - file is loaded and parsed
 * onNode(node,phraseIndex,nodePhrases) - we reached a node.
 * onChoice([nodes]) - we reached a choice and those nodes will display
 * onConversationEnd()
 *
 * Methods
 * load() - load + parse: what to do with importers? use chatmapper as default
 * parse() - CM as default
 * start() - starts from root after JSON was loaded by load()
 * finish() - force finish
 * nextNode() - goes to next
 *
 */

var parser = require('luaparse');

DialogSystemCM = function (tipo) {
	if (tipo === "constelaciones") {
		var chatMapper = require('../chatMapper/constelaciones.json');
	} else {
		var chatMapper = require('../chatMapper/atomos.json');
	}

    var self = this;
    self.project = null;
    self.path = "";

    self.currentNode = null;
    self.currentConversation = null;
    self.currentLocation = null;

    var nodePhrases;
    var nodePhraseIndex = 0;

    var scheduledNode;

    var varTable = new Object();

    //Chatmapper scripts and conditions support
    var Actor = new Object();
    var Item = new Object();
    var Location = new Object();
    var Variable = new Object();
    var Dialog = [];
    var StatusTable = [];
    var RelationshipTable = [];
    var ConversationDialogTable = [];

    self.actors = Actor;
    self.locations = Location;
    self.variables = Variable;

    this.conversantCharacter = null;

    this.onLoaded = null;
    this.onNode = null;
    this.onChoice = null;
    this.onConversationEnd = null;
    this.onVariablesChanged = null;

    self.activeLocalizationField = "Dialogue Text";
    self.localized = false;

    //carga e inicia el juego
    this.loadAndPlay = function () {
        LoadCallback(chatMapper, true);
    }
    //carga el JSON del juego
    this.load = function () {
        LoadCallback(chatMapper, false);
    }

    //Inicia el juego desde el nodo 0
    this.start = function(){
        console.log("start!");
        //enviamos las variables
        self.Dispatch("onVariablesChanged");
    	PlayNextNode();
    }

    //Lee el JSON y crea los distintos objetos
    function ReadAssets(project) {

        //console.log(project);
        var i = 0;
        var listitem;

        //Actors
        for (i = 0; i < project.Assets.Actors.length; i++) {
            listitem = project.Assets.Actors[i];
            var key = listitem.Fields.Name.replace(/ /g, "_");
            Actor[key] = listitem.Fields;
            Actor[key].ID = listitem.ID;
            Actor[key].currentPicture = 0;
            Actor[key].name = key;
            //Parse pictures
            var re = /([^\[||"||\]||;]+)/g
            var pictures = [];
            var capture=null;
            while (capture = re.exec(Actor[key].Pictures)) {
                pictures.push(capture[0]);
            }
            Actor[key].pictures = pictures;
        }

        //Items
        for (i = 0; i < project.Assets.Items.length; i++) {
            listitem = project.Assets.Items[i];
            Item[listitem.Fields.Name.replace(/ /g, "_")] = listitem.Fields;
        }

        //Locations
        for (i = 0; i < project.Assets.Locations.length; i++) {
            listitem = project.Assets.Locations[i];
            var key = listitem.Fields.Name.replace(/ /g, "_");
            Location[key] = listitem.Fields;
            Location[key].ID = listitem.ID;
        }


        //Variables
        for (i = 0; i < project.Assets.UserVariables.length; i++) {
            listitem = project.Assets.UserVariables[i];
            var val = listitem.Fields["Initial Value"];

            //Parse the string to its correct value.
            //Bool?
            if (val.toLowerCase().trim() == "false")
                val = false;
            else if (val.toLowerCase().trim() == "true")
                val = true;
            else {
                //Int?
                var intval = parseInt(val);

                if (!isNaN(intval)) {
                    if (val.trim().length != intval.toString().trim().length) //Not bool, not int, just leave it as string
                        val = listitem.Fields["Initial Value"];
                    else
                        val = intval;
                }

            }

            Variable[listitem.Fields.Name] = val;
        }

        //Conversations
        ConversationDialogTable = [];
        for (i = 0; i < project.Assets.Conversations.length; i++) {
            ConversationDialogTable[i] = null;

            //Parse Each node

            var conversation = project.Assets.Conversations[i];
            for (var j=0; j< conversation.DialogNodes.length; j++) {

                //Audio Files
                if (conversation.DialogNodes[j].Fields.hasOwnProperty("Audio Files")) {
                    var re = /[;\[]([^;\[\]]*)/g
                    var audio_files = [];
                    var capture=null;
                    var str = conversation.DialogNodes[j].Fields["Audio Files"];

                    str = str.replace(/\\/g,"/");

                    while (capture = re.exec(str)) {

                        audio_files.push( capture[1]);
                    }
                    conversation.DialogNodes[j].audio_files = audio_files;

                }

            }
        }


        //Localized
        self.localized = !(project.Language==null);

    }

    //Slecciona la conversación actual y se posiciona en el nodo 0
    function SetConversation(n) {
        console.log("setConversation "+n);
        console.log("conversations: ");
        //console.log(self.project.Assets.Conversations);
        //console.log("n: ");
        //console.log(n);
        self.currentConversation = self.project.Assets.Conversations[n];
        console.log("currentConversation: ");
        //console.log(self.currentConversation);
        self.currentNode = self.currentConversation.DialogNodes[0];

        //Set Location
        self.trySetLocation(self.currentConversation.Fields["Location"]);

        if (ConversationDialogTable[n] == null) {

            //Read conversation status
            Dialog = [];
            var node;
            for (var i = 0; i < self.currentConversation.DialogNodes.length; i++) {
                node = self.currentConversation.DialogNodes[i];
                Dialog[node.ID] = new Object();


                //Fix Condition operators
                node.ConditionsString = node.ConditionsString.replace(/~=/gm, "!=");
                node.ConditionsString = node.ConditionsString.replace(/AND |and /gm, "&& ");
                node.ConditionsString = node.ConditionsString.replace(/OR |or /gm, "|| ");
                node.ConditionsString = node.ConditionsString.replace(/ AND| and/gm, " &&");
                node.ConditionsString = node.ConditionsString.replace(/ OR| or/gm, " ||");
                if (node.ConditionsString.indexOf("'False'") == -1)
                    node.ConditionsString = node.ConditionsString.replace(/ false| False| FALSE/gm, "'False'");
                if (node.ConditionsString.indexOf("'True'") == -1)
                    node.ConditionsString = node.ConditionsString.replace(/ true| True| TRUE/gm, "'True'");
                /*
                node.ConditionsString = node.ConditionsString.replace(/(\r\n|\n|\r)/gm, " ");
                node.ConditionsString = node.ConditionsString.replace(/[ "'\[\]\(\)][l|L][tT][eE][ "'\[\]\(\)]|[ "'\[\]\(\)][l|L][e|E][ "'\[\]\(\)]/gm, "<=");
                node.ConditionsString = node.ConditionsString.replace(/[ "'\[\]\(\)][g|G][tT][eE][ "'\[\]\(\)]|[ "'\[\]\(\)][g|G][e|E][ "'\[\]\(\)]/gm, ">=");
                node.ConditionsString = node.ConditionsString.replace(/[ "'\[\]\(\)][l|L][t|T][ "'\[\]\(\)]/gm, "<");
                node.ConditionsString = node.ConditionsString.replace(/[ "'\[\]\(\)][g|G][t|T][ "'\[\]\(\)]/gm, ">");

                //Fix Script operators
                node.UserScript = node.UserScript.replace(/(\r\n|\n|\r)/gm, "; ");
                if (node.UserScript.indexOf("'False'") == -1)
                    node.UserScript = node.UserScript.replace(/ false| False| FALSE/gm, "'False'");
                if (node.UserScript.indexOf("'True'") == -1)
                    node.UserScript = node.UserScript.replace(/ true| True| TRUE/gm, "'True'");
                */

            }
            ConversationDialogTable[n] = Dialog;

        } else {

            Dialog = ConversationDialogTable[n];

        }
    }

    //Revisa si la conversación esta disponible y cumple con las condiciones
    this.CheckConversationAvailable = function(n) {

        SetConversation(n);
        return CheckCondition(self.currentConversation.DialogNodes[0]);

    }

    //Se asegura que exista un proyecto y una conversación actual y luego despliega el siguiente nodo de la conversación
    function PlayNextNode() {

        if (self.project == null) {
            console.log("DialogSystem: Project not loaded");
            return;
        }

        if (self.currentConversation == null) {
            console.log("currentConversation == null");
            SetConversation(0);
        }

        self.PlayNode(self.currentNode);

    }

    //Despliega el nodo entregado como parametro,
    //lo establece como el nodo actual y cambia su estado a wasDisplayed.
    //Si el nodo tiene Script, llama al metodo que lo ejecuta
    //cambia la localización a la establecida por el nodo
    //Finalmente si el nodo no tiene texto, llama al metodo que revisa si es nodo final,
    //de lo contrario llama al metodo playPhrase()
    this.PlayNode = function (node) {
        // console.log("*** PlayNode ID " + node.ID.toString());
        //console.log(node);

        self.currentNode = node;

        //Execute Script
        if (node.UserScript != null && node.UserScript != "")
        {
            ExecuteScript(node.UserScript);
            //enviamos las variables
            self.Dispatch("onVariablesChanged");
        }

        //Set Displayed=1
        Dialog[node.ID].SimStatus = "WasDisplayed";

        //Set Location
        /*var actor = self.GetActor(node.Fields["Actor"]) || {};
        var aid = actor.Fields["Location"] || null;
        self.trySetLocation(aid);*/ //Actors doesn't set locations, nodes do
        self.trySetLocation(node.Fields["Location"]);

        //****Text node
        //console.log("Text Node");

        //No text, go to the next one
        if (node.Fields[self.activeLocalizationField] == "" || node.Fields[self.activeLocalizationField] == null) {
            console.log("Node: no text");
            self.NodeFinished(node);
            return;
        }

        //console.log(varTable);
        nodePhrases = node.Fields[self.activeLocalizationField].split('|');
        //console.log(nodePhrases);
        nodePhraseIndex = 0;
        //console.log(node.Fields[self.activeLocalizationField]);
        //lastPhraseTime = Date.now();
        PlayPhrase();
        //self.NodeFinished(node,0);
    }

    //Finaliza la conversación y gatilla el evento "onConversationEnd"
    this.DialogFinished = function () {
        //console.log("DIALOG FINISHED");

        nodePhrasePlaying = false;
        scheduledNode = null;

        //if (self.onConversationEnd !== null)
        //    self.onConversationEnd();
        self.Dispatch("onConversationEnd");

    }

    //Revisa si el nodo es nodo final y cuyo caso llama al metodo que finaliza la conversación.
    //En caso de no ser el último nodo, asigna el nodo al que esta vinculado.
    //
    this.NodeFinished = function (node) {
        console.log("NodeFinished: ");
        if (node.OutgoingLinks.length == 0) {
            //console.log("node.OutgoingLinks.length == 0");
            console.log("Finished");
            self.DialogFinished();
            return;
        }


        //Jump to another dialog?
        if (node.OutgoingLinks.length == 1 && node.OutgoingLinks[0].DestinationConvoID != self.currentConversation.ID) {
            console.log("Jump to another conversation");
            //SetConversation(self.GetConversationIndex(node.OutgoingLinks[0].DestinationConvoID));
            //scheduledNode = self.GetNode(node.OutgoingLinks[0].DestinationDialogID);
            self.PlayConversation(self.GetConversationIndex(node.OutgoingLinks[0].DestinationConvoID));
            return;
        }

        //If there is only 1 available node and it doesn't meet the condition, then skip to the next one so we don't get lost
        if (node.OutgoingLinks.length == 1) {
            var nextnode = self.GetNode(node.OutgoingLinks[0].DestinationDialogID);
            console.log("Jump to the next dialog");
            if (!CheckCondition(nextnode)) {
                self.NodeFinished(nextnode);
                return;
            }
        }

        var choices = ReadGroupRecursive(node, null);
        console.log("ChoiceS:");
        //console.log(choices);

        if (choices.length == 1 && !node.IsGroup && choices[0].Fields["Menu Text"].indexOf("[f]")===-1) {
            //if (choices.length==1 && (choices[0].Fields["Menu Text"]=="" || choices[0].Fields["Menu Text"]==null)) {
            //console.log(choices[0]);
            //Just 1 choice, and no menu text -> we go to that node directly.
            console.log("Just 1 choice, and no menu text -> we go to that node directly.");
            scheduledNode = choices[0]; //self.GetNode(node.OutgoingLinks[selectedOutgoingLink].DestinationDialogID);
            this.update();
        } else if (choices.length==0) {
            console.log("No choices -> DialogFinished");
            self.DialogFinished();

        }else {
            //Multiple choices
            console.log("Multiple choices");
            GenerateAndShowChoices(choices);
        }

    }

    //Retorna el nodo que posee la id entregada como parametro, o "null" en caso de no encontrarlo en la conversación actual.
    self.GetNode = function (id) {

        for (var i = 0; i < self.currentConversation.DialogNodes.length; i++) {
            if (self.currentConversation.DialogNodes[i].ID.toString() == id.toString())
                return self.currentConversation.DialogNodes[i];
        }

        return null;

    }

    //Retorna los nodos hijos del nodo entregado como parametro
    function GetChildNodes(node) {

        var childs = [];

        for (var i = 0; i < node.OutgoingLinks.length; i++) {
            childs.push(self.GetNode(node.OutgoingLinks[i].DestinationDialogID));
        }

        return childs;
    }

    //Ordena por prioridad un conjunto de nodos "childs"
    function OrderNodesByPriority(childs) {

        var priorities = [[], [], [], [], [], []];

        for (var i = 0; i < childs.length; i++) {

            if (childs[i].ConditionPriority > 0)
                priorities[childs[i].ConditionPriority].push(childs[i]);

        }
        return priorities;
    }

    //Revisa que el nodo "node" cumpla las condiciones, retorn true si no existen condiciones para el nodo,
    //en caso contrario retorna el resultado evaluar la condición
    function CheckCondition(node) {
        //console.log("CheckConditions: ");
        if (node.ConditionsString == null || node.ConditionsString == ""){
            //console.log("true");
            return true;
        }
        //Dialog[3].SimStatus = "WasDisplayed" ;
        //console.log(Dialog);
        //console.log(node);
        //console.log(node.ConditionsString);
        // console.log(eval(node.ConditionsString));
        //console.log(Location);

        return eval(node.ConditionsString);
    }

    //Revisa las condicones de una conjunto de nodos
    function ParseConditions(nodes) {

        var nodesout = [];

        for (var i = 0; i < nodes.length; i++) {
            if (CheckCondition(nodes[i])) {
                //console.log (nodes[i].ConditionsString + " - TRUE");
                nodesout.push(nodes[i]);
            } else {
                //console.log (nodes[i].ConditionsString + " - FALSE");
            }

        }
        return nodesout;
    }

    //Ejecuta un script
    function ExecuteScript(script) {
        // console.log(script);
        var ast = parser.parse(script);
        var jsScritp = toJavaScript(ast.body);
        // console.log(jsScritp);
        eval(jsScritp);
    }

    //Asigna el grupos de nodos hijos de un nodo a la variable childs
    //y despiega el nodo de mayor prioridad, si no se autoselecciona, se muestran las distintas opciones.
    function PlayGroupNode(node, autoselect) {

        var childs = SelectGroupNodeChilds(node);
        //console.log(childs);

        if (autoselect) {
            if (childs.length == 1) {
                scheduledNode = childs[0];
            } else if (childs.length > 1) {
                console.log("DialogSystem: PlayGroupNode: ERROR: Group Node with Autoplay has more than 1 options available");
                return;
            } else {
                console.log("DialogSystem: Error: Group Node with Autoplay " + node.ID.toString() + " has no active childs. Finishing");
            }
        } else {
            if (childs.length > 0) {

                //Launch popup for the user to choose one of them
                var choices = ReadGroupRecursive(node, null);
                //console.log("Choices:");
                //console.log(choices);

                GenerateAndShowChoices(choices);


                //} else if (childs.length==1) {

                //	scheduledNode = childs[0];

            } else {

                // console.log("DialogSystem: Error: Group Node " + node.ID.toString() + " has no active childs. Finishing");
            }
        }
    }

    //Recorre recursivamente TODOS decendientes (agrupados) de un nodo y retorna una lista con ellos.
    function ReadGroupRecursive(node, list) {
        if (list == null)
            list = [];

        var childs = SelectGroupNodeChilds(node);
        var child;
        for (var i = 0; i < childs.length; i++) {
            child = childs[i];
            if (!child.IsGroup) {
                list.push(child);
            } else {
                ReadGroupRecursive(child, list);
            }
        }
        return list;
    }

    //Asigna los nodo hijos del nodo actual a la variable childs y prioriza los nodos,
    //Luego evalua las condiciones y retorna el primer nodo en orden de prioridad que cumpla las condiciones.
    function SelectGroupNodeChilds(node) {

        var childs = GetChildNodes(node);
        var priorities = OrderNodesByPriority(childs);

        for (var i = 0; i < priorities.length; i++) {

            //Select only the ones with condition true
            priorities[i] = ParseConditions(priorities[i]);

            if (priorities[i].length > 0) {
                return priorities[i];
            }
        }
        return  [];
    }

    //Una vez cargado el proyecto, este metodo lee el JSON,
    //establece la conversación 0 como incial,
    //Notifica que el proyecto esta cargado y
    //ejecuta el primerer nodo en caso que autostart sea true.
    function LoadCallback(_project, autostart) {
        self.project = _project;
        ReadAssets(_project);
        SetConversation(0);
        self.update(); //Get the update up running
        //if (self.onLoaded !== null)
        //    self.onLoaded();
        self.Dispatch("onLoaded");
        if (autostart)
        {
            SetConversation(5);
            PlayNextNode();
        }
            
    }

    //Gatilla un evento que envia la frase para desplegar.
    function PlayPhrase() {

        if (nodePhraseIndex < nodePhrases.length) {
            var phrase = nodePhrases[nodePhraseIndex];

            //if (self.onNode !== null)
            //    self.onNode(self.currentNode, nodePhraseIndex, nodePhrases);
            var params = {
                node: self.currentNode,
                nodePhraseIndex: nodePhraseIndex,
                nodePhrases: nodePhrases};
            //console.log(params);
            self.Dispatch("onNode",params);
        } else {
            //Last phrase
            self.NodeFinished(self.currentNode);
        }
    }

    //Ejecuta la siguiente frase
    this.NextPhrase = function () {
        nodePhraseIndex++;
        PlayPhrase();
    }

    //Ejecuta el nodo agendado y gatilla un evento para actualizar la vista.
    this.update = function () {
        if (scheduledNode != null) {
            var ns = scheduledNode;
            scheduledNode = null;
            self.PlayNode(ns);
        }
    }

    //Asigna una variable a las variables del juego.
    this.SetVar = function(name, value) {
        Variable[name] = value;
        // console.log("Variable: "+Variable[name]);
    }

    //Retorna la variable "name" del juego
    function GetVar(name) {
        return varTable[name];
    }

    this.getVariables = function(){
        return Variable;
    }

    //Retorna las variables del usuario name
    this.GetUserVariable = function(name) {
        return Variable[name];
    }

    //Retorna el Actor de identificación ID
    this.GetActor = function (ID) {
        //for (var i=0; i<Actor)
        for (var key in Actor) {
            if (Actor.hasOwnProperty(key)) {
                if (Actor[key].ID.toString() == ID) {
                    return Actor[key];
                }
            }
        }
    }

    //Retorna la localización de identificación ID
    this.GetLocation = function (ID) {
        //for (var i=0; i<Actor)
        for (var key in Location) {
            if (Location.hasOwnProperty(key)) {
                if (parseInt(Location[key].ID) == parseInt(ID)) {
                    return Location[key];
                }
            }
        }
        return null;
    }

    //Gatilla un evento con las opciones disponibles en un dialogo.
    function GenerateAndShowChoices(choices) {
        self.Dispatch("onChoice",choices);
    }

    //Ejecuta la conversación n
    this.PlayConversation = function (n) {
        SetConversation(n);
        PlayNextNode();
    }

    //Retorna el numero de conversaciones
    this.GetConversationNumber = function () {
        return self.project.Assets.Conversations.length;
    }

    //Retorna el indice de la conversación con identificación id
    this.GetConversationIndex = function (id) {
        for (var i = 0; i < self.project.Assets.Conversations.length; i++) {
            if (self.project.Assets.Conversations[i].ID == id)
                return 	i;
        }
        return -1;
    }

    //Retorna la conversación con identificador id.
    function GetConversation(id) {

        for (var i = 0; i < self.project.Assets.Conversations.length; i++) {

            if (self.project.Assets.Conversations[i].ID == id)
                return 	self.project.Assets.Conversations[i];
        }
        return null;
    }

    //Actualiza el estado a,b y en caso de no existir lo crea y inserta en la tabla de estados.
    function SetStatus(a, b, status) {
        //Look for Existing Status
        for (var i = 0; i < StatusTable.length; i++) {
            if (StatusTable[i][0] == a && StatusTable[i][1] == b) {
                StatusTable[i][2] = status;
                return;
            }

        }

        //Didn't exist
        var s = [a, b, status];
        StatusTable.push(s);
    }

    //Retorn el estado a,b
    function GetStatus(a, b) {
        for (var i = 0; i < StatusTable.length; i++) {
            if (StatusTable[i][0] == a && StatusTable[i][1] == b)
                return StatusTable[i][2];

        }
        return "";
    }

    //Asigna un valor de tipo type a la relación entre a y b
    function SetRelationship(a, b, type, value) {

        //Find existing Relationship
        var r;
        for (var i = 0; i < RelationshipTable.length; i++) {
            r = RelationshipTable[i];
            if (r[0] == a && r[1] == b && r[2] == type) {
                RelationshipTable[i][3] = value;
                return;
            }
        }

        //Didn't exist
        var r = [a, b, type, value];
        RelationshipTable.push(r);
    }

    //Retorna el valor de la relación entre a y b
    function GetRelationship(a, b, type) {
        var r;
        for (var i = 0; i < RelationshipTable.length; i++) {
            r = RelationshipTable[i];
            if (r[0] == a && r[1] == b && r[2] == type) {
                return RelationshipTable[i][3];
            }
        }
        return "";
    }

    //Incrementa la lista de valores que tiene la relación a y b
    function IncRelationship(a, b, type, incrementAmount) {
        SetRelationship(a, b, type, GetRelationship(a, b, type) + incrementAmount);
    }

    //Decrementa la lista de valores que tiene la relación a y b
    function DecRelationship(a, b, type, decrementAmount) {
        SetRelationship(a, b, type, GetRelationship(a, b, type) - decrementAmount);
    }

    //Despliega el consola los objetos del proyeto para probar la lectura.
    this.DumpDebug = function () {
        /* console.log("Actors");
        console.log(Actor);
        console.log("Locations");
        console.log(Location);
        console.log("Status");
        console.log(StatusTable);
        console.log("Relationships");
        console.log(RelationshipTable);
        console.log("Variables");
        console.log(Variable);*/
        return

    }

    //Agregar una función que sera gatilla por el evento name
    self.AddEventListener = function(name,f) {
        if (self[name]===undefined) {
            console.log("Event not found: " + name);
            return;
        }

        var n = name + "_callbacks";

        if (self[n] === undefined) {
            self[n] = [];
        }

        self[n].push(f);
    }

    //Lanza el evento de nombre name y parametros param
    self.Dispatch = function(name,params) {
        var n = name + "_callbacks";

        if (self[n] === undefined) {
            //No listeners
        }else{
            for (var i=0; i<self[n].length; i++) {
                self[n][i](params);
            }
        }
    }

    //Revisa que se pueda cambiar la localización y la cambia si es posible.
    self.trySetLocation = function(id) {
        if (id===undefined || id=== null || id == "-1")
            return;

        var l = self.GetLocation(id);
        if (l!==null) {
            // console.log("DS: Location set: " + l.Name);
            self.currentLocation = l;
        }
    }

    return self;
}

var toJavaScript = function(ast)
{
    var jsOutput ='';
    ast.forEach(function(type) {
        //console.log(type.type);
        // console.log(JSON.stringify(type));
        switch(type.type) {
            case 'AssignmentStatement':
                jsOutput += toJavaScript(type.variables);
                jsOutput += '=';
                jsOutput += toJavaScript(type.init);
                jsOutput += ';';
                jsOutput += '\n';
                break;
            case 'Comment':
                break;
            case 'StringCallExpression':
                break;
            case 'TableCallExpression':
                break;
            case 'CallExpression':
                jsOutput += toJavaScript([type.base]);
                jsOutput += '(';
                for(var i = 0; i<type.arguments.length; i++)
                {
                    jsOutput += toJavaScript([type.arguments[i]]);
                    if(i<type.arguments.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ')';
                break;
            case 'IndexExpression':
                jsOutput += toJavaScript([type.base]);
                jsOutput += '[';
                jsOutput += toJavaScript([type.index]);
                jsOutput += ']';
                break;
            case 'MemberExpression':
                jsOutput += toJavaScript([type.base]);
                jsOutput += type.indexer;
                jsOutput += toJavaScript([type.identifier]);
                break;
            case 'UnaryExpression':
                jsOutput += type.operator;
                jsOutput += toJavaScript([type.argument]);
                break;
            case 'BinaryExpression':
                jsOutput += toJavaScript([type.left]);
                if(type.operator == '~=' || type.operator == '!=' )
                {
                    jsOutput += '!=';
                }
                else{
                    jsOutput += type.operator;
                }
                jsOutput += toJavaScript([type.right]);
                break;
            case 'LogicalExpression':
                jsOutput += toJavaScript([type.left]);
                if(type.operator == 'or' || type.operator == 'OR' )
                {
                    jsOutput += '||';
                }
                else if(type.operator == 'and' || type.operator == 'AND')
                {
                    jsOutput += '&&';
                }
                jsOutput += toJavaScript([type.right]);
                break;
            case 'TableConstructorExpression':
                jsOutput += '[';
                for(var i = 0; i<type.fields.length; i++)
                {
                    jsOutput += toJavaScript([type.fields[i]]);
                    if(i<type.fields.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ']';
                break;
            case 'TableValue':
                jsOutput += toJavaScript([type.value]);
                break;
            case 'TableKeyString':
                jsOutput += '[';
                jsOutput += toJavaScript([type.key]);
                jsOutput += ']';
                jsOutput += ' = ';
                jsOutput += toJavaScript([type.value]);
                break;
            case 'TableKey':
                jsOutput += '[';
                jsOutput += toJavaScript([type.key]);
                jsOutput += ']';
                jsOutput += ' = ';
                jsOutput += toJavaScript([type.value]);
                break;
            case 'Identifier':
                jsOutput += type.name;
                break;
            case 'Chunk':
                break;
            case 'ForGenericStatement':
                jsOutput += 'for(';
                for(var i = 0; i<type.variables.length; i++)
                {
                    jsOutput += toJavaScript([type.variables[i]]);
                    if(i<type.variables.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ' in ';
                    for(var i = 0; i<type.iterators.length; i++)
                {
                    jsOutput += toJavaScript([type.iterators[i]]);
                    if(i<type.iterators.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ')';
                jsOutput += '\n';
                jsOutput += '{';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'ForNumericStatement':
                jsOutput += 'for(var ';
                jsOutput += toJavaScript([type.variable]);
                jsOutput += ' = ';
                jsOutput += toJavaScript([type.start]);
                jsOutput += '; ';
                jsOutput += toJavaScript([type.variable]);
                jsOutput += ' < ';
                jsOutput += toJavaScript([type.end]);
                jsOutput += '; ';
                jsOutput += toJavaScript([type.variable]);
                jsOutput += ' += ';
                jsOutput += toJavaScript([type.step]);
                jsOutput += ')';
                jsOutput += '\n';
                jsOutput += '{';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'FunctionDeclaration':
                jsOutput += 'function ';
                jsOutput += toJavaScript([type.identifier]);
                jsOutput += '(';
                for(var i = 0; i<type.parameters.length; i++)
                {
                    jsOutput += toJavaScript([type.parameters[i]]);
                    if(i<type.parameters.length - 1)
                        jsOutput += ',';
                }
                jsOutput += '){';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'CallStatement':
                jsOutput += toJavaScript([type.expression]);
                jsOutput += ';';
                jsOutput += '\n';
                break;
            case 'LocalStatement':
                jsOutput += 'var ';
                for(var i = 0; i<type.variables.length; i++)
                {
                    jsOutput += toJavaScript([type.variables[i]]);
                    if(i<type.variables.length - 1)
                        jsOutput += ',';
                }
                jsOutput += '=';
                for(var i = 0; i<type.init.length; i++)
                {
                    jsOutput += toJavaScript([type.init[i]]);
                    if(i<type.init.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ';';
                jsOutput += '\n';
                break;
            case 'RepeatStatement':
                jsOutput += 'do{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                jsOutput += 'while(';
                jsOutput += toJavaScript([type.condition]);
                jsOutput += ')';
                jsOutput += '\n';
                break;
            case 'DoStatement':
                jsOutput += 'do{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                jsOutput += 'while(';
                jsOutput += toJavaScript([type.condition]);
                jsOutput += ')';
                jsOutput += '\n';
                break;
            case 'WhileStatement':
                jsOutput += 'while(';
                jsOutput += toJavaScript([type.condition]);
                jsOutput += ')';
                jsOutput += '{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'ElseClause':
                jsOutput += 'else{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'ElseifClause':
                jsOutput += 'else if(';
                jsOutput += toJavaScript([type.condition]);
                jsOutput += ')';
                jsOutput += '{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'IfClause':
                jsOutput += 'if(';
                jsOutput += toJavaScript([type.condition]);
                jsOutput += ')';
                jsOutput += '{';
                jsOutput += '\n';
                for(var i = 0; i<type.body.length; i++)
                {
                    jsOutput += toJavaScript([type.body[i]]);
                }
                jsOutput += '}';
                jsOutput += '\n';
                break;
            case 'IfStatement':
                jsOutput += toJavaScript(type.clauses);
                break;
            case 'ReturnStatement':
                jsOutput += 'return ';
                for(var i = 0; i<type.arguments.length; i++)
                {
                    jsOutput += toJavaScript([type.arguments[i]]);
                    if(i<type.arguments.length - 1)
                        jsOutput += ',';
                }
                jsOutput += ';';
                jsOutput += '\n';
                break;
            case 'GotoStatement':
                break;
            case 'BreakStatement':
                jsOutput += "break;";
                jsOutput += '\n';
                break;
            case 'LabelStatement':
                break;
            case 'StringLiteral':
                jsOutput += "\"";
                jsOutput += type.value;
                jsOutput += "\"";
                break;
            case 'Keyword':
                jsOutput += type.value;
                break;
            case 'NumericLiteral':
                jsOutput += type.value;
                break;
            case 'Punctuator':
                jsOutput += type.value;
                break;
            case 'BooleanLiteral':
                jsOutput += type.value;
                break;
            case 'NilLiteral':
                jsOutput += type.value;
                break;
            default:
                jsOutput += type;
        }
    });
    //console.log(jsOutput);
    return jsOutput;
}

module.exports = DialogSystemCM;

$('#show_button').click(function(e){
	var db = openDatabase('ipredb2', '1.0', 'database used to save current game state', 4 * 1024 * 1024);
	db.transaction(function (tx) {
	  // here be the transaction
	  // do SQL magic here using the tx object
	  	tx.executeSql('SELECT * FROM SCORES', [], function (tx, results) {
		  var len = results.rows.length, i;
		  var str_results="";
		  for (i = 0; i < len; i++) {
		    str_results+=Object.values(results.rows.item(i)).toString()+"\n";
		  }
		  $(".ta_results").val(str_results);
		});
	});
});

$('#send_button').click(function(e){
	var db = openDatabase('ipredb2', '1.0', 'database used to save current game state', 4 * 1024 * 1024);
	db.transaction(function (tx) {
	  // here be the transaction
	  // do SQL magic here using the tx object
	  	tx.executeSql('SELECT * FROM SCORES', [], function (tx, results) {
		  var len = results.rows.length, i;
		  var str_results="";
		  for (i = 0; i < len; i++) {
		    str_results+=Object.values(results.rows.item(i)).toString()+"\n";
		  }
		    $.post("/write_results",
		    {results: str_results},
		    function(data, status){
		        alert("Enviado! "+ "\nStatus: " + status);
		    });
		});
	});
});
// function pasarVariables(pagina, nombres) {
// pagina +="?";
// nomVec = nombres.split(",");
// for (i=0; i<nomVec.length; i++)
// pagina += nomVec[i] + "=" + escape(eval(nomVec[i]))+"&";
// pagina = pagina.substring(0,pagina.length-1);
// console.log(pagina);
// // location.href=pagina;
// }

$("#sel_button").click(function(){
    window.location.href = "constelaciones?nombre_s=" + $('#soflow option:selected').text() + '&status=new';
  });

$("#cargar_button").click(function(){
    window.location.href = "constelaciones?nombre_s=" + $('#soflow option:selected').text() + '&status=last';
  });

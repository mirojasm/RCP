$("#sel_button").click(function(){
    console.log($( "#soflow" ).val());
    window.location.href = "atomos?nombre_s=" + $('#soflow option:selected').text() + '&status=new';
  });

$("#cargar_button").click(function(){
    console.log($( "#soflow" ).val());
    window.location.href = "atomos?nombre_s=" + $('#soflow option:selected').text() + '&status=last';
  });
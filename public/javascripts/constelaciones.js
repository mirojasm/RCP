
var host=document.getElementById('clientConst').getAttribute('host');
var port=document.getElementById('clientConst').getAttribute('port');


var serverURL = host+port;
var queue;

var eleccionTT = -1;


function startActivityAnimation()
{
 
}
var btnsh = false;
var btnch = false;
$('.btn-objective').click(function(){

	if(btnsh == false)
	{
		btnsh = true;
		$('#obj_game').removeClass('hidden');
		setTimeout(function() {
	        $('#obj_game').addClass('hidden');
	        btnsh = false;
	     }, 5000);
	}

	
});
$('.btn-stars').click(function(){
	if(btnch == false)
	{
		btnch = true;
		$('.objective-color').removeClass('hidden');
		setTimeout(function() {
	        $('.objective-color').addClass('hidden');
			btnch = false;
	     }, 5000);
	}
	
});
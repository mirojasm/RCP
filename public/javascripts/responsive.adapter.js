
var scaledX;
var scaledY;

var gameWidth = window.innerWidth-20;
var gameHeight = window.innerHeight-20;

var dispositivo;
var dispositiveName = navigator.userAgent.toLowerCase();
var osPlatform = navigator.platform;



var rezisable = true;

function iniciarResponsive(){
	scaledX = demoCanvas.width/ demoCanvas.offsetWidth;
    scaledY = demoCanvas.height/ demoCanvas.offsetHeight;
	
	OnResizeCalled(rezisable);
	setPlatForm();
	window.addEventListener("resize", OnResizeCalled, false);
	window.addEventListener('orientationchange', doOnOrientationChange);
	
}


function OnResizeCalled() {
	console.log("rezisable " + rezisable );
	if(rezisable == true)
	{
        var gameWidth = window.innerWidth - 20;
        var gameHeight = window.innerHeight - 20;
		var heightY = $(".gameCanvas").height();
		//alert(heightY);
        var scaleToFitX = gameWidth / 800;
        var scaleToFitY = gameHeight / 460;
    
        var currentScreenRatio = gameWidth / gameHeight;
        var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
    
        if (currentScreenRatio >= 1.735 && currentScreenRatio <= 1.74) {
            //demoCanvas.style.width = gameWidth + "px";
            demoCanvas.style.height = gameHeight + "px";
			canvasPrueba.style.height = gameHeight + "px";
        }
        else {
            //demoCanvas.style.width = 800 * optimalRatio + "px";
            demoCanvas.style.height = 460 * optimalRatio + "px";
			canvasPrueba.style.height = 460 * optimalRatio + "px";
        }
		
		demoCanvas.style.width = "100%";
		canvasPrueba.style.width = "100%";
        
        scaledX = demoCanvas.width/ demoCanvas.offsetWidth;
        scaledY = demoCanvas.height/ demoCanvas.offsetHeight;
	}
}

function doOnOrientationChange()
  {
	rezisable = true;
    switch(window.orientation) 
    {  
      case -90: break;
      case 90:
        console.log('landscape');
        break; 
    }
	rezisable = false;
  }
  

function setPlatForm() {
			var screenWidth = window.screen.availWidth;
			var screenHeight = window.screen.availHeight;
		
			if (screenWidth < 599) {

				if (osPlatform.search("iphone")) {
					dispositivo = "mobile";
					rezisable = false;
				} else if (dispositiveName.search("ipod")) {
					dispositivo = "ipod";
					dispositivo = "mobile";
					rezisable = false;
				} else if (dispositiveName.search("android")) {
					dispositivo = "mobile";
					rezisable = false;
				}
				
				screen.style.visibility="hidden";
		
			} else if (screenWidth > 599 && screenWidth < 1025) {
				if (dispositiveName.search("ipad")) {
					dispositivo = "tablet";
					rezisable = false;
				} else if (dispositiveName.search("android")) {
					dispositivo = "tablet";
					rezisable = false;
				}
				
			} else if (screenWidth > 1024) {
				if (osPlatform == "Win32") {
					dispositivo = "pc";
					rezisable = true;
				} else {
					dispositivo = "pc";
					rezisable = true;
				}

			} else if (screenWidth > 1366) {
					rezisable = true;
				if (osPlatform == "Win32") {
					dispositivo = "pc";
					rezisable = true;
				} else {
					dispositivo = "pc";
					rezisable = true;
				}
			}
		}



		




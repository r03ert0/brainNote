loadDependencies();
loadBrainNote();

function loadDependencies()
{
	var	dependencies=["js/jquery/jquery-1.10.2.min.js",
	"js/three/three.min.js","js/three/Detector.js",
	"js/three/SubdivisionModifier.js","js/three/PLYLoader.js",
	"js/three/TrackballControls.js","js/threex/THREEx.screenshot.js",
	"js/threex/THREEx.FullScreen.js","js/threex/THREEx.WindowResize.js",
	"mylogin/login.js"];
	
	dependencies.forEach(function(v,j) {
		var	s = document.createElement('script');
		s.async=false;
		s.src=v;
		document.body.appendChild(s);
	});
}
function loadBrainNote()
{
	var	s = document.createElement('script');
	s.async=false;
	s.src="js/translucent-coords.js";
	document.body.appendChild(s);
}
var	locations=[];
var	mc={};
var	spheres;

init();

//========================================================================================
// Interaction
//========================================================================================
function delRow(row)
{
    var i=$(row.parentNode.parentNode).index();

    document.getElementById('editTable').deleteRow(i);

    mc.scene.remove(locations[i-1].sph);
    locations.splice(i-1,1);
}

function addRow(row)
{
    var i=$(row.parentNode.parentNode).index();

    var new_row = document.getElementById('editTable').insertRow(i+1);
    new_row.innerHTML=[
            "<td contentEditable></td>",
            "<td contentEditable></td>",
            "<td contentEditable></td>",
            "<td contentEditable></td>",
            "<td id='input'><input type='button' id='del' value='&#8854;' onclick='delRow(this)'/></td>",
            "<td id='input'><input type='button' id='add' value='&#8853;' onclick='addRow(this)'/></td>"].join("\n");

	// intercept click
	$(new_row).click(function() {
		$("#editTable td").css({'background-color':'lightGrey'});
		$(this).children('td').css({'background-color':'lightGreen'});
		spheres.children.forEach(function( sph ) { sph.material.color.setRGB( 1,0,0 );});
		locations[$(this).index()-1].sph.material.color.setRGB(0,1,0);
	});
	
	// intercept enter
	$(new_row).find('td[contentEditable]').each(function(){
		$(this).on('keydown',function(e) {
			if(e.which==13&&e.shiftKey==false) {	// enter (without shift)
				parseTable(mc,this);
				return false;
			}
			if(e.which==9) {	// tab
				parseTable(mc,this);
			}				
		});
	});

	if(!locations)
		locations=[];
	locations.splice(i,0,{"x":"","y":"","z":"","text":"empty"});
}
function parseTable(mc0,row)
{
	var	i=-1,j;
	if(row)
	{
	    i=$(row.parentNode).index();

		var cells=row.parentNode.getElementsByTagName('td');
		var x=parseFloat(cells[0].textContent);
		var	y=parseFloat(cells[1].textContent);
		var z=parseFloat(cells[2].textContent);
		var	txt=cells[3].textContent;
		j=i-1;

		locations[j].x=x;
		locations[j].y=y;
		locations[j].z=z;
		locations[j].text=txt;
		
		save("locations",JSON.stringify(locations,["x","y","z","text"]));
	}
		
	// Add locations
	var geometry = new THREE.SphereGeometry(1,16,16);
	var	color=0xff0000;
	for(j=0;j<locations.length;j++)
	{
		if(locations[j].sph)
		{
		    color=locations[j].sph.material.color;
		    spheres.remove(locations[j].sph);
		}

		var x=locations[j].x;
		var y=locations[j].y;
		var z=locations[j].z;
		var sph = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: color}));
		sph.position=new THREE.Vector3(x*0.14,y*0.14+3,z*0.14-2);
		spheres.add(sph);
		locations[j].sph=sph;
	}
}
function store(obj)
{
	var	name=$(obj).attr('class').split(" ")[1];
	var	value=$(obj).text();
	save(name,value);
}
function save(name,value)
{
	// save to local storage
	localStorage.setItem(name,value);
	
	// save to DB
	
	
}
//========================================================================================
// Configuration
//========================================================================================
function init()
{
	// 1. Add widget div
	//var div = Siph.settings[0].container;
	var div = document.createElement("div");
	document.body.appendChild(div);
	div.innerHTML=[
"<div style='padding:5px;border:1px solid lightGrey'>",
"	<div class='experiments'>",
"	</div>",
"</div>"].join("\n");

	// 2. Load "experiment" template
	$(".experiments").append($('<div class="experiment">').load("templates/experiment.html",
		function(responseText, textStatus, XMLHttpRequest) {
			var title=(localStorage.title)?localStorage.title:"You can edit this title";
			var caption=(localStorage.caption)?localStorage.caption:"You can edit this caption";
			if(localStorage.locations)
				locations=JSON.parse(localStorage.locations);
				
			// Add experiment legend
			$(".experiment .stored.title").html(title);
			$(".experiment .stored.caption").html(caption);

			// Add locations to metacoords view
			initTranslucentBrain();
			
			spheres = new THREE.Object3D();
			mc.scene.add(spheres);


			if(!locations)
				return;
			// Add experiment locations to table
			var html="";
			for(j=0;j<locations.length;j++)
			{
				var x=locations[j].x;
				var y=locations[j].y;
				var z=locations[j].z;
				var txt=locations[j].text;
				var new_row = document.getElementById('editTable').insertRow(j+1);
				new_row.innerHTML=[
						"<td contentEditable>"+x+"</td>",
						"<td contentEditable>"+y+"</td>",
						"<td contentEditable>"+z+"</td>",
						"<td contentEditable>"+txt+"</td>",
						"<td id='input'><input type='button' id='del' value='&#8854;' onclick='delRow(this)'/></td>",
						"<td id='input'><input type='button' id='add' value='&#8853;' onclick='addRow(this)'/></td>"].join("\n");

				// intercept click
				$(new_row).click(function() {
					$("#editTable td").css({'background-color':'lightGrey'});
					$(this).children('td').css({'background-color':'lightGreen'});
					spheres.children.forEach(function( sph ) { sph.material.color.setRGB( 1,0,0 );});
					locations[$(this).index()-1].sph.material.color.setRGB(0,1,0);
				});
			}
			//$(".experiment .experiment-locations .xyztable table").append(html);
	
			// intercept enter on table cells
			$('#editTable td').on( 'keydown',function(e) {
				if(e.which==13&&e.shiftKey==false) {	// enter (without shift)
					parseTable(mc,this);
					return false;
				}
				if(e.which==9) {	// tab
					parseTable(mc,this);
				}
			});
		
			// intercept enter on 'stored' fields
			$('.stored').on( 'keydown',function(e) {
				if(e.which==13&&e.shiftKey==false) {	// enter (without shift)
					store(this);
					return false;
				}
				if(e.which==9) {	// tab
					store(this);
				}
			});

			// parse coordinates table
			parseTable(mc,"");
			
			// Adjust locations table height
			var padd,legendheight,xyzhdrheight,ontheight;
			padd=parseInt($('.experiment').css('padding-top'));
			legendheight=$('.experiment .experiment-title').innerHeight();
			legendheight+=$('.experiment .experiment-caption').innerHeight();
			xyzhdrheight=$('.experiment .xyzheader').innerHeight();
			ontheight=$('.experiment .ontologies').innerHeight();
			badTableHeight=$(".experiment input.badTable").innerHeight()+10;
			$('.experiment .xyztable').css({"height":300,"max-height":300-badTableHeight-padd});
		}
	));
}

function initTranslucentBrain()
{
	mc.container=$(".experiment div.metaCoords");

	// Init render
	init_render(mc);
	animate();

}
// init the scene
function init_render(mc0)
{
	// Init rendered
	if( Detector.webgl ){
		mc0.renderer = new THREE.WebGLRenderer({
			antialias				: true,	// to get smoother output
			preserveDrawingBuffer	: true	// to allow screenshot
		});
		mc0.renderer.setClearColor( 0xffffff, 0 );
	}else{
		mc0.renderer = new THREE.CanvasRenderer();
	}

	var container=mc0.container;
	var	width=container.width();
	var	height=container.height();
	mc0.renderer.setSize( width, height );
	container.append(mc0.renderer.domElement);

	// create a scene
	mc0.scene = new THREE.Scene();
	
	// create projector (for hit detection)
	mc0.projector = new THREE.Projector();
	mc0.renderer.domElement.addEventListener( 'mousedown', function(e){onDocumentMouseDown(e,mc0);}, false );

	// put a camera in the scene
	mc0.camera	= new THREE.PerspectiveCamera(40,width/height,1,100);
	mc0.camera.position.set(0, 0, 40);
	mc0.scene.add(mc0.camera);

	// create a camera control
	mc0.cameraControls=new THREE.TrackballControls(mc0.camera,mc0.container.get(0) )
	mc0.cameraControls.noZoom=true;
	mc0.cameraControls.addEventListener( 'change', function(){mc0.light.position.copy( mc0.camera.position );} );

	// allow 'p' to make screenshot
	//THREEx.Screenshot.bindKey(renderer);
	
	// Add lights
	var	light	= new THREE.AmbientLight( 0x3f3f3f);
	mc0.scene.add(light );
	mc0.light	= new THREE.PointLight( 0xffffff,2,80 );
	//var	light	= new THREE.DirectionalLight( 0xffffff);
	//light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
	mc0.light.position.copy( mc0.camera.position );
	//light.position.set( 0,0,0 );
	mc0.scene.add(mc0.light );
	
	// Load mesh (ply format)
	var oReq = new XMLHttpRequest();
	oReq.open("GET", "data/lrh3.ply", true);
	oReq.responseType="text";
	oReq.onload = function(oEvent)
	{
		var tmp=this.response;
		var modifier = new THREE.SubdivisionModifier(1);
		
		mc0.material=new THREE.ShaderMaterial({
			uniforms: { 
				coeficient	: {
					type	: "f", 
					value	: 1.0
				},
				power		: {
					type	: "f",
					value	: 2
				},
				glowColor	: {
					type	: "c",
					value	: new THREE.Color('grey')
				},
			},
			vertexShader	: [ 'varying vec3	vVertexWorldPosition;',
								'varying vec3	vVertexNormal;',
								'varying vec4	vFragColor;',
								'void main(){',
								'	vVertexNormal	= normalize(normalMatrix * normal);',
								'	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',
								'	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
								'}',
								].join('\n'),
			fragmentShader	: [ 'uniform vec3	glowColor;',
								'uniform float	coeficient;',
								'uniform float	power;',
								'varying vec3	vVertexNormal;',
								'varying vec3	vVertexWorldPosition;',
								'varying vec4	vFragColor;',
								'void main(){',
								'	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
								'	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
								'	viewCameraToVertex	= normalize(viewCameraToVertex);',
								'	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
								'	gl_FragColor		= vec4(glowColor, intensity);',
								'}',
							].join('\n'),
			transparent	: true,
			depthWrite	: false,
		});
		
		mc0.geometry=new THREE.PLYLoader().parse(tmp);
		mc0.geometry.sourceType = "ply";
		
		modifier.modify(mc0.geometry);
		for(i=0;i<mc0.geometry.vertices.length;i++)
		{
			mc0.geometry.vertices[i].x*=0.14;
			mc0.geometry.vertices[i].y*=0.14;
			mc0.geometry.vertices[i].z*=0.14;
			mc0.geometry.vertices[i].y+=3;
			mc0.geometry.vertices[i].z-=2;
		}

		mc0.brainmesh=new THREE.Mesh(mc0.geometry,mc0.material);
		mc0.scene.add(mc0.brainmesh);
	};
	oReq.send();
}
// hit detection
function onDocumentMouseDown( event,mc0 ) {
	event.preventDefault();
	var	x,y,i;
	var r = event.target.getBoundingClientRect();

	projector = new THREE.Projector();
	mouseVector = new THREE.Vector3();
	mouseVector.x= ((event.clientX-r.left) / event.target.clientWidth ) * 2 - 1;
	mouseVector.y=-((event.clientY-r.top) / event.target.clientHeight ) * 2 + 1;
	
	var raycaster = projector.pickingRay( mouseVector.clone(), mc0.camera );
	var intersects = raycaster.intersectObjects( spheres.children );

	if(intersects.length==0)
		return;
	spheres.children.forEach(function( sph ) { sph.material.color.setRGB( 1,0,0 );});
	intersects[0].object.material.color.setRGB(0,1,0);
	for(i=0;i<locations.length;i++) {
		if(locations[i].sph==intersects[0].object)
		{
			$("table#editTable tr:eq("+(i+1)+") td").css({"background-color":"lightGreen"});
		}
		else
		{
			$("table#editTable tr:eq("+(i+1)+") td").css({"background-color":"lightGrey"});
		}
	};
}

// animation loop
function animate()
{
	requestAnimationFrame( animate );
	render(mc);
}
// render the scene
function render(mc0) {
	// update camera controls
	mc0.cameraControls.update();
	
	// actually render the scene
	mc0.renderer.render(mc0.scene,mc0.camera );
}
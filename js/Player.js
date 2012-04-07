
;(function(scope,undefined){

var GT=scope.GT;

GT.Player=GT.newClass({

	score : 0 ,

			

	beforeInit : GT.noop,	
	init : function(stage){
		this.beforeInit(stage);
		this.stage=stage;

		var type="player";
		var geometry=stage.game.entityInfo[type].geometry,
		scale=stage.game.entityInfo[type].scale||1;

	
		this.minX=-200;
		this.maxX=200;

		this.minY=-180;
		this.maxY=180;

		//var geometry= new THREE.CubeGeometry( w, h, d);

		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(  ) );
		var mc = THREE.CollisionUtils.MeshColliderWBox(mesh);
			//var mc = THREE.CollisionUtils.MeshOBB( mesh );

		mesh.position = new THREE.Vector3( this.x, this.y, this.z  ) ;
		mesh.rotation = new THREE.Vector3( this.rx , this.ry ,this.rz  ) ;
		mesh.scale=new THREE.Vector3( scale, scale,scale);


		mesh.castShadow = !true;
		mesh.receiveShadow = !true;

		var mc = THREE.CollisionUtils.MeshOBB( mesh );

		this.core=mesh;

		var w=70, h=40, d=140;

		var offsetX=0, offsetY=40, offsetZ=-50;
		this.rays=[

			[ { x:offsetX+0, y:offsetY+0, z:offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			
			[ { x:offsetX+(-w/2), y:offsetY+h/2, z: offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			[ { x:offsetX+0, y:offsetY+h/2, z: offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			[ { x:offsetX+w/2, y:offsetY+h/2, z:offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			
			[ { x:offsetX+(-w/2), y:offsetY+(-h/2), z:offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			[ { x:offsetX+0, y:offsetY+(-h/2), z:offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ],
			[ { x:offsetX+w/2, y:offsetY+(-h/2), z:offsetZ+d/2 } , new THREE.Vector3( 0, 0, -1 ) , d ]
		];

		if (window.debugEnabled){
			this.pp=[];
			for (var i=0;i<this.rays.length;i++){
				
				var pos=this.core.position.clone();
				pos.addSelf( this.rays[i][0] );
				var lineMat = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 1, linewidth: 2 } );
				var geom = new THREE.Geometry();
				geom.vertices.push( new THREE.Vertex( pos ) );
				geom.vertices.push( new THREE.Vertex( pos ) );
				var pp = new THREE.Line(geom, lineMat);
				stage.scene.add( pp );
				this.pp.push(pp);

			}
		}
		this.level=1;
		this.onInit(stage);
	},

	onInit : function(){
		

	},

	getGift : function(mesh){
		this.score+= 10;
		mesh.posTween=new TWEEN.Tween( mesh.position ).to( {
			x: 300,
			y: 300
			}, 4000 )
		.easing( TWEEN.Easing.Elastic.EaseOut).start();

		mesh.scaleTween=new TWEEN.Tween( mesh.scale ).to( {
			x : 0.1,
			y : 0.1,
			z : 0.1
			}, 1000 )
		.start();
	

	},
	beKilled : function(mesh){
		this.dead=true;
		new TWEEN.Tween( this.core.position ).to( {
			y: -400
			}, 1000 )
		.start();

		new TWEEN.Tween( this.core.rotation ).to( {
			z: ( Math.random() * 360*8 ) * Math.PI / 180
			 }, 1000 )
		.start();
		var Me=this;

		localStorage.setItem('yourScore',Me.scoresum);
		var hiScore=localStorage.getItem('hiScore');
		if (Me.scoresum>hiScore){
			localStorage.setItem('hiScore',Me.scoresum);
		}


		this.stage.game.timer.addDeferJob(function(){
			game.gameover();
			GT.$id("ysnum").innerHTML=Me.scoresum;
			
		},1100);

						
	},

	update : function(deltaTime){
		
		if (!this.dead){
			this.time+=deltaTime;
			var t=Math.floor(this.time/1000);
			this.stage.game.timeBar.innerHTML="Time : "+t;
			this.scoresum=(t+this.score);
			var newLevel=Math.ceil(this.scoresum/(25*this.level) );
			if (newLevel>this.level){
				this.level=newLevel;
				this.stage.game.moveSpeedZ+=0.06;
			}
			
			this.stage.game.curScoreBar.innerHTML="Score : "+this.scoresum  ;
			this.updateXYZ(deltaTime);
			this.rz=Math.max(Math.min( this.rz ,  GT.CONST.deg90 ), -GT.CONST.deg90 );
				

			for (var i=0;i<this.rays.length;i++){

				var rayInfo=this.rays[i];
				var ro=this.core.position.clone();
				ro.addSelf( rayInfo[0] );
	

				if (window.debugEnabled){
					var pp = this.pp[i];
					pp.geometry.vertices[0].position = ro;
					pp.geometry.vertices[1].position = ro.clone().subSelf({x:0,y:0,z:300});
					pp.geometry.__dirtyVertices = true;
					pp.geometry.__dirtyElements = true;
				}
			
				var ray = new THREE.Ray( ro, rayInfo[1] );
				var c = THREE.Collisions.rayCastNearest( ray );
				
				if (c){
					//GT.$log( c.distance )
					var type=c.mesh.type;
					var scale=this.stage.game.entityInfo[type].scale||1;
					// scale=1;	
					if ( c.distance < rayInfo[2]/scale-10 ) {
						if (!c.mesh.beHit){
							c.mesh.beHit=true;
							THREE.Collisions.colliders.removeItem(c.mesh.mc);
							if (type.indexOf("gift")===0){
								this.getGift(c.mesh);
							}else{							
								this.beKilled(c.mesh);
							}

						}
						break;
					} 

				}
					
			}
		}
	

	},
	speedDown : function(speedName,step){
		if (Math.abs(this[speedName])<step){
			this[speedName]=0;
		}else if (this[speedName]>0){
			this[speedName]+=-step;
		}else if(this[speedName]<0){
			this[speedName]+=step;
		}else{
			this[speedName]=0;
		}	
	},
	handleInput : function(deltaTime){

		var up=GT.KeyState[GT.Key.W]||GT.KeyState[GT.Key.UP];
		var down=GT.KeyState[GT.Key.S]||GT.KeyState[GT.Key.DOWN];
		var left=GT.KeyState[GT.Key.A]||GT.KeyState[GT.Key.LEFT];
		var right=GT.KeyState[GT.Key.D]||GT.KeyState[GT.Key.RIGHT];
		

		var moveSpeed=0.2;

		var step=0.0004*deltaTime;
		
		if (up && !down){
			this.speedY=moveSpeed;
		}else if (down && !up){
			this.speedY=-moveSpeed;	
		}else{
			this.speedDown("speedY",step);		
		}			

		if (left && !right){
			this.speedX=-moveSpeed;
		}else if (right && !left){
			this.speedX=moveSpeed;
		}else{
			this.speedDown("speedX",step);		
		}

	}

}, GT.Entity );
	
})(this);
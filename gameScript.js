// the box2d world
var world;

var currentLevelNumber = 1; // starts on level of index 1
var lastLevelNumber = 6; // the quantity of levels

// control variables
var runGame = false;
var won = false;
var gameFinished;
var countDownToNextLevel;
var currentLevel;

var scale = 0.5;
var worldX = 0;
var worldY = 0;
var worldScale = 70;

var indexOfCreatureChosen = -1;

// variables used to set the a fixed time step 
var targetFps = 60;
var millistep = 1000/targetFps;
var timeStep = 1/targetFps;
var msdelta = 0;
var acumulator = 0;
var previousTime = 0;
var loops;
var animFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        null ;

// determines the speed of the simulation
var fastForwardX = 1;

var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint, gotBody;
var userClicked = false;
var selectedIcon;
var canvasPosition = getElementPosition(document.getElementById("canvas"));

// add the fps counters to the document
//var statsMainLoop = new Stats();
//var statsUpdates = new Stats();
//document.getElementById("fps1").appendChild(statsMainLoop.domElement);
//document.getElementById("fps1").appendChild(statsUpdates.domElement);

var canvas = document.getElementById("canvas");
var context=canvas.getContext("2d");

// interface elements
var creaturesContainer = new CreaturesContainer();
var selectionPanel = new SelectionPanel();
var selectionLimit = 3;
var bin = new Bin(); 
var helpButton = new HelpButton(); 
var nextGenButton = new NextGenerationButton();     
var showInstructions = -1;  

var rightFootParticleEmitter = new ParticleEmitter();
var leftFootParticleEmitter = new ParticleEmitter();

var helpPanels = [document.getElementById("hp1"),
                  document.getElementById("hp2"),
                  document.getElementById("hp3"),
                  document.getElementById("hp4")];



// the first function called
function init() {
	// set up the box 2d world
	world = new b2World(
	   new b2Vec2(0, 12)    //gravity
	,  true                 //allow sleep
	);
	
	//pm.start(200, 150);
	
	//setup debug draw
	{
		//polygonGrd.addColorStop(0,"#40aa40");
		//polygonGrd.addColorStop(1,"#205020");

		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(context); //document.getElementById("canvas").getContext("2d"));
		debugDraw.SetDrawScale(worldScale);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		/*
		debugDraw.DrawSolidPolygon = function(vertices, vertexCount, color){
			//var context=canvas.getContext("2d");
			/*
			var x;
			var y;
			context.beginPath();
			for(var i = 0; i < vertexCount; i++)
			{		
				// Fill with gradient
				x = vertices[i].x * worldScale;
				y = vertices[i].y * worldScale;
				context.fillStyle=polygonGrd;
				context.lineTo(x,y);
				context.fill();
			}
			///
		};
		//*/
		
		//*
		debugDraw.DrawSolidCircle = function(center, radius, axis, color)
		{
			/*	
			var x = center.x*worldScale;
			var y = center.y*worldScale;
			var r = radius*worldScale;		
				
			// Fill with gradient
			var circleGrd=context.createRadialGradient(x-(r*0.25),y-(r*0.25),r*0.5,x,y,r);
			circleGrd.addColorStop(0,"#ddcc55");
			circleGrd.addColorStop(1,"#776633");
			context.beginPath();
			context.fillStyle=circleGrd;
			context.arc(x,y,r,0,360*DEGTORAD);//0*Math.PI,2*Math.PI);
			context.fill();
			//*/
		};
		//*/
		world.SetDebugDraw(debugDraw);
	}

	//mouse

	window.addEventListener('keydown', function(event) {
		
		if (event.keyCode == 80) // 'p' to pause
			runGame = !runGame; // pause or unpause game
		
		if(runGame)
		{
			switch (event.keyCode) {
				case 32: // space to start
				
				break;
				
				case 189: // -
					if(fastForwardX > 1) fastForwardX--;
				break;
				
				case 187: // +
					if(fastForwardX < 5) fastForwardX++;
				break;

				case 173: // -
					if(fastForwardX > 1) fastForwardX--;
				break;
				
				case 61: // +
					if(fastForwardX < 5) fastForwardX++;
				break;
				
				case 13: // Enter: creates new mutated creatures from the current selected ones		
					if(selectionPanel.selected.length > 0)			
					{	
						currentLevel.restore();
						creaturesContainer.createNextGeneration(
																selectionPanel.selected,
																currentLevel.creaturesParameters.chanceOfMutation,
																currentLevel.creaturesParameters.amountOfMutation
															   );
															   
						console.debug("next generation created.");
						selectionPanel.removeAllSelected();
					}
				break;
				
				case 37: // Left
					if(creaturesContainer.activeCreature > 0)
						indexOfCreatureChosen = creaturesContainer.activeCreature - 1;
				break;

				case 38: // Up
					//debugDraw.SetDrawScale(++worldScale);
					if(creaturesContainer.activeCreature < (creaturesContainer.amountOfCreatures - 1))
						indexOfCreatureChosen = creaturesContainer.activeCreature + 1;
				break;

				case 39: // Right
					if(creaturesContainer.activeCreature < (creaturesContainer.amountOfCreatures - 1))
						indexOfCreatureChosen = creaturesContainer.activeCreature + 1;
				break;

				case 40: // Down
					//debugDraw.SetDrawScale(--worldScale);
					if(creaturesContainer.activeCreature > 0)
						indexOfCreatureChosen = creaturesContainer.activeCreature - 1;
				break;
				
				default:
					if(event.keyCode >= 97 && event.keyCode <= 105) // if a number between 1 and 9 was pressed
					{
						indexOfCreatureChosen = event.keyCode - 97;
					}
					else if(event.keyCode >= 49 && event.keyCode <= 57) // if a number between 1 and 9 was pressed
					{
						indexOfCreatureChosen = event.keyCode - 49;
					}
				break;
			}
			
		}
	}, false);
		
	document.addEventListener("mousedown", function(e) {
		isMouseDown = true;
		handleMouseMove(e);
		document.addEventListener("mousemove", handleMouseMove, true);
	}, true);
	
	document.addEventListener("mouseup", function() {
		document.removeEventListener("mousemove", handleMouseMove, true);
		userClicked = true;
		isMouseDown = false;
		mouseX = undefined;
		mouseY = undefined;
	}, true);
	
	document.addEventListener("touchstart", function(e) {
		isMouseDown = true;
		won = true;
		handleTouchMove(e);
		document.addEventListener("touchmove", handleTouchMove, true);
	}, true);
	
	document.addEventListener("touchend", function() {
		document.removeEventListener("touchmove", handleTouchMove, true);
		isMouseDown = false;
		mouseX = undefined;
		mouseY = undefined;
	}, true);

	// set up the contact listener 
	var myContactListener = new Box2D.Dynamics.b2ContactListener;
	
	myContactListener.BeginContact = function(contact)
	{
		var gameEntityA = contact.GetFixtureA().GetUserData();
		var gameEntityB = contact.GetFixtureB().GetUserData();
		//alert("A entity type: " + gameEntityA.entityType + " B entity type: " + gameEntityB.entityType);
		if((gameEntityA.entityType == ENTITY_TYPE.Goal && 
		    gameEntityB.isCreature()) ||
		   (gameEntityB.entityType == ENTITY_TYPE.Goal && 
		    gameEntityA.isCreature()))
			{
				if(won == false)
				{
					won = true;
					countDownToNextLevel = 120;	
				}
			}
			
		if(gameEntityA.isGround() && 
		   gameEntityB.isFoot())
		    {
		        var wmf = new b2WorldManifold;
                contact.GetWorldManifold(wmf);
                pts = wmf.m_points.length;
                var contactPoint = wmf.m_points[0];
                var cx = contactPoint.x * worldScale + worldX;
                var cy = contactPoint.y * worldScale + worldY;
		    	if(gameEntityB.entityType == ENTITY_TYPE.LFoot)
		    	{
		    		creaturesContainer.getActiveCreature().leftFootGrounded++;
                    
                    if(creaturesContainer.getActiveCreature().leftFootGrounded == 1)
                    {
                        //console.debug("lala");
                        //var contactPoint = contact.GetManifold().m_points[0];
                        leftFootParticleEmitter.start(cx, cy);
                    }
		    	}
		    	else
		    	{
		    		creaturesContainer.getActiveCreature().rightFootGrounded++;
		    		
		    		if(creaturesContainer.getActiveCreature().rightFootGrounded == 1)
                    {
                        //console.debug("pts: " + pts);
                        //console.debug("right foot! x: " + cx + " y: " + cy);
                        rightFootParticleEmitter.start(cx, cy);
                    }
		    	}	
		    }
		else if(gameEntityA.isFoot() && 
		    	gameEntityB.isGround())
			{
    			var wmf = new b2WorldManifold;
                contact.GetWorldManifold(wmf);
                pts = wmf.m_points.length;
                var contactPoint = wmf.m_points[0];
                var cx = contactPoint.x * worldScale + worldX;
                var cy = contactPoint.y * worldScale + worldY;
                
				//alert("foot on ground! (A)");
				if(gameEntityA.entityType == ENTITY_TYPE.LFoot){
		    		creaturesContainer.getActiveCreature().leftFootGrounded++;
		    		
		    		if(creaturesContainer.getActiveCreature().leftFootGrounded == 1);
		    		{
		    		    //console.debug("lala");
    		    		//var contactPoint = contact.GetManifold().m_points[0];
    		    		//leftFootParticleEmitter.start(contactPoint[0] * worldScale, contactPoint[0] * worldScale);
    		    		leftFootParticleEmitter.start(cx, cy);
    		        }
		    	}
		    	else{
		    		var rfg = creaturesContainer.getActiveCreature().rightFootGrounded++;
		    		
		    		if(creaturesContainer.getActiveCreature().rightFootGrounded == 1)
		    		{
                        //console.debug("pts: " + pts);
                        //console.debug("right foot! x: " + cx + " y: " + cy);
                        
                        rightFootParticleEmitter.start(cx, cy);
                    }
		    	}
			}
		
	};
	
	myContactListener.EndContact = function(contact) 
	{
		var gameEntityA = contact.GetFixtureA().GetUserData();
		var gameEntityB = contact.GetFixtureB().GetUserData();
		
		if(gameEntityA.isGround() && 
		   gameEntityB.isFoot())
		    {
		    	if(gameEntityB.entityType == ENTITY_TYPE.LFoot)
		    	{
		    		creaturesContainer.getActiveCreature().leftFootGrounded--;
		    		
		    		if(creaturesContainer.getActiveCreature().leftFootGrounded == 0)
                    {
                        //console.debug("");
                        leftFootParticleEmitter.stop();
                    }
		        }
		    	else
		    	{
		    		creaturesContainer.getActiveCreature().rightFootGrounded--;
		    		
		    		if(creaturesContainer.getActiveCreature().rightFootGrounded == 0)
                    {
                        //console.debug("right foot off");
                        rightFootParticleEmitter.stop();
                    }
		    	}	
		    }
		else if(gameEntityA.isFoot() && 
		    	gameEntityB.isGround())
			{
				if(gameEntityA.entityType == ENTITY_TYPE.LFoot)
				{
		    		creaturesContainer.getActiveCreature().leftFootGrounded--;
		    		
		    		if(creaturesContainer.getActiveCreature().leftFootGrounded == 0)
                    {
                        //console.debug("");
                        leftFootParticleEmitter.stop();
                    }
		        }
		    	else
		    	{
		    		creaturesContainer.getActiveCreature().rightFootGrounded--;
                    
                    if(creaturesContainer.getActiveCreature().rightFootGrounded == 0)
                    {
                        //console.debug("right foot off");
                        rightFootParticleEmitter.stop();
                    }
		    	}
			}
	};
		
	//*
	myContactListener.PostSolve = function(contact, impulse)
	{
        var gameEntityA = contact.GetFixtureA().GetUserData();
        var gameEntityB = contact.GetFixtureB().GetUserData();
        
        if(gameEntityA.isGround() && 
           gameEntityB.isFoot())
            {
                var wmf = new b2WorldManifold;
                contact.GetWorldManifold(wmf);
                var contactPoint = wmf.m_points[0];
                var cx = contactPoint.x * worldScale + worldX;
                var cy = contactPoint.y * worldScale + worldY;
                if(gameEntityB.entityType == ENTITY_TYPE.LFoot)
                {
                    leftFootParticleEmitter.update(cx, cy);
                }
                else
                {
                    //console.debug("... x: " + cx + " ... y: " + cy);
                    rightFootParticleEmitter.update(cx, cy);
                    
                    var numOfTanImpulses = impulse.tangentImpulses.length;
                    //console.debug("total tan imp: " + numOfTanImpulses);
                    for(var i = 0; i < numOfTanImpulses; i++)
                    {
                        var imp = impulse.tangentImpulses[i];
                        //console.debug("impulse " + i + " val: " + imp);
                        //console.debug(" ");
                    }
                }   
            }
        else if(gameEntityA.isFoot() && 
                gameEntityB.isGround())
            {
                var wmf = new b2WorldManifold;
                contact.GetWorldManifold(wmf);
                var contactPoint = wmf.m_points[0];
                var cx = contactPoint.x * worldScale + worldX;
                var cy = contactPoint.y * worldScale + worldY;
                if(gameEntityA.entityType == ENTITY_TYPE.LFoot)
                {
                    leftFootParticleEmitter.update(cx, cy);
                }
                else
                {
                    //console.debug("... x: " + cx + " ... y: " + cy);
                    rightFootParticleEmitter.update(cx, cy);
                    
                    var numOfTanImpulses = impulse.tangentImpulses.length;
                    //console.debug("total tan imp: " + numOfTanImpulses);
                    for(var i = 0; i < numOfTanImpulses; i++)
                    {
                        var imp = impulse.tangentImpulses[i];
                        //console.debug("impulse " + i + " val: " + imp);
                        //console.debug(" ");
                    } 
                }
            }
	};
	
	/*
	myContactListener.PreSolve = function(contact, oldManifold) {};
	//*/
	
	// add the contact listener to the world
	world.SetContactListener(myContactListener);
		
	// creates the level
	currentLevel = createLevel(currentLevelNumber);
	currentLevel.initialize();
		
	creaturesContainer.populateWithNewCreatures(currentLevel.creaturesParameters);
	creaturesContainer.createSelectableIcons();
	
	creaturesContainer.setActiveCreature(0);
	
	// prepare the active one to start
	creaturesContainer.getActiveCreature().prepareToStart();
	
	won = false;
	runGame = true;
	
	previousTime = (new Date).getTime();
	// start the mainloop
	//window.setInterval(recursiveAnim,1000/60);
	animFrame(recursiveAnim);
}

function handleMouseMove(e) {
	// left and top caculated as described on http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
	var doc = document.documentElement, body = document.body;
	var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
	var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
	
	mouseX = ((e.clientX + left) - (canvasPosition.x + worldX))/((worldScale/2)/scale);
	mouseY = ((e.clientY + top) - (canvasPosition.y + worldY))/((worldScale/2)/scale);
}

function recursiveAnim() {
	msdelta = (new Date).getTime() - previousTime;
	previousTime = (new Date).getTime();
	
	loops = 0;
  	
  	acumulator += msdelta;
	while(acumulator>=millistep)
	{
		for(var i = 0; i < fastForwardX; i++)
			update();
		
		acumulator-=millistep;
		if(acumulator < 0) acumulator = 0;
		//statsUpdates.update();
		loops++;
	}
	
	draw(msdelta);

	//statsMainLoop.update();
    return animFrame(recursiveAnim);
}
    
function playerWonEntireGame(){
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.fillStyle = "#2222cc";
	context.fillRect(220, 165, 250, 50)
	context.fillStyle = "yellow";
	context.font = "29px Arial";
	context.fillText("This is it for now.", 241, 200);
}

function playerWonLevel(){
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.fillStyle = "#2222cc";
	context.font = "30px Arial";
	context.fillText("Congratulations!", 240, 200);
}
 
    
function update() {
	if(runGame)
	{
	    if(showInstructions > -1)
	    {
	       
	       if(userClicked && isMouseDown)
	       {
	           userClicked = false;
	           showInstructions++;
	           if(showInstructions == 4) showInstructions = -1;
	       }
	    }
	    else
	    {
    	    if(gameFinished)
    		{
    			return;		
    		}
    		if(won)
    		{
    			countDownToNextLevel--;
    			console.debug("countdown: " + countDownToNextLevel);
    			if(countDownToNextLevel == 0)
    			{
    				creaturesContainer.destroyAllCreatures();	
    				currentLevel.destroy();
    				
    				currentLevelNumber++;
    				// creates the level
    				if(currentLevelNumber <= lastLevelNumber)
    				{
    					currentLevel = createLevel(currentLevelNumber);
    					currentLevel.initialize();
    						
    					creaturesContainer.populateWithNewCreatures(currentLevel.creaturesParameters);
    					creaturesContainer.createSelectableIcons();
    					
    					creaturesContainer.setActiveCreature(0);
    					
    					// prepare the active one to start
    					creaturesContainer.getActiveCreature().prepareToStart();
    					won = false;
    					return;
    				}	
    				else
    				{
    					gameFinished = true;
    				}
    			}
    		}
    		
    		var bodyPos = creaturesContainer.getActiveCreature().mainPart.mainBody.GetPosition();
    		var centeredX = (canvas.width/2) - bodyPos.x * worldScale;
    		var centeredY = (canvas.height/2) - bodyPos.y * worldScale;
    		var maxX = currentLevel.maxX;
    		var maxY = currentLevel.maxY;
    		var minX = currentLevel.minX;
    		var minY = currentLevel.minY;
    		if(centeredX > maxX)
    			worldX = maxX;
    		else if (centeredX < minX) 
    			worldX = minX;
    		else
    			worldX = centeredX;
    		
    		if(centeredY > maxY)
    			worldY = maxY;
    		else if (centeredY < minY) 
    			worldY = minY;
    		else
    			worldY = centeredY;
    		
    		
    		if(isMouseDown && (!selectedIcon))
    		{
    			selectedIcon = getIconAtMouse();
    		}
    		
    		if(selectedIcon)
    		{
    			switch(selectedIcon.type)
    			{				
    				case ICON_TYPE.SelectableIcon:
    					//console.debug("switch selectable");
    					if(isMouseDown)
    					{
    					    //var prevX = selectedIcon.icon.x;
    					    //var prevY = selectedIcon.icon.y;
    					    
    						selectedIcon.icon.x = (mouseX * worldScale) - selectedIcon.icon.grabbedX + worldX;
    						selectedIcon.icon.y = (mouseY * worldScale) - selectedIcon.icon.grabbedY + worldY;
    						
    						//var distX = Math.abs(selectedIcon.icon.x - prevX);
    						//var distY = Math.abs(selectedIcon.icon.y - prevY);
    						
    						//console.debug("dx: " + distX + "dy: " + distY);
    						
    						//var vel = Math.sqrt(distX*distX + distY*distY);
    						//selectedIcon.icon.updateScaleBasedOnVelocity(vel);  
    					}
    					else
    					{
    						if(wasChosen())
    						{	
    							var index = wasChosenToMate();
    							if(index != -1)
    								selectionPanel.addSelected(creaturesContainer.creatures[selectedIcon.icon.index], index);
    							else 
    								if(selectionPanel.selected.length < selectionLimit)
    									selectionPanel.addSelected(creaturesContainer.creatures[selectedIcon.icon.index]);
    						}
    						else if(selectedIcon.icon.isCloseToOriginalPosition())
    						{
    						      indexOfCreatureChosen = selectedIcon.icon.index;
    						}
    						
    						selectedIcon.icon.resetPosition();
    						selectedIcon = undefined;
    					}
    					
    				break;
    				
    				case ICON_TYPE.SelectedIcon:
    					//console.debug("switch selected");
    					if(isMouseDown)
    					{
    						selectedIcon.icon.x = (mouseX * worldScale) - selectedIcon.icon.grabbedX + worldX;;
    						selectedIcon.icon.y = (mouseY * worldScale) - selectedIcon.icon.grabbedY + worldY;;
    					}
    					else
    					{
    						if(wasBinned())
    						{
    							selectionPanel.removeSelected(selectedIcon.id);
    						}
    						selectedIcon.icon.resetPosition();
    						selectedIcon = undefined;	
    					}
    				break;
    				
    				case ICON_TYPE.Help:
        				    showInstructions = 0;
        				    userClicked = false;
        				    selectedIcon = undefined;
        				
    				break;
    				
    				case ICON_TYPE.NextGen:
        				if(selectionPanel.selected.length > 0)          
                        {   
                            currentLevel.restore();
                            creaturesContainer.createNextGeneration(
                                                                    selectionPanel.selected,
                                                                    currentLevel.creaturesParameters.chanceOfMutation,
                                                                    currentLevel.creaturesParameters.amountOfMutation
                                                                   );
                                                                   
                            //console.debug("next generation created.");
                            selectionPanel.removeAllSelected();
                        }      
                        selectedIcon = undefined;
                    break;
    				
    				case ICON_TYPE.Bin:
    					selectedIcon = undefined;
    				break;
    				
    				default:
    				//console.debug("switch default");
    			}
    		}
 
    		// code to drag dinamic bodies (used for debug purposes only)
    		//*
    		{
    			if(isMouseDown && (!mouseJoint)) {	
    				var body = getBodyAtMouse();
    				if(body) {
    					gotBody = true;	
    					var md = new b2MouseJointDef();
    					md.bodyA = world.GetGroundBody();
    					md.bodyB = body;
    					md.target.Set(mouseX, mouseY);
    					md.collideConnected = true;
    					
    					if(body.GetUserData().isCreature())
    					{
    						md.maxForce = 300.0 * body.GetUserData().creature.totalMass();
    						mouseJoint = world.CreateJoint(md);
    						body.SetAwake(true);
    					}
    				}
    				else gotBody = false;
    			}
    	
    			if(mouseJoint) {
    				if(isMouseDown) {
    					mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
    				} else {
    					world.DestroyJoint(mouseJoint);
    					mouseJoint = null;
    				}
    			}
    		}
    		// End of code to drag dynamic bodies*/
		
    		var ac = creaturesContainer.getActiveCreature();
    		
    		// checks if another creature was chosen
    		if(indexOfCreatureChosen != -1 && ac.id != indexOfCreatureChosen)
    		{
    			currentLevel.restore();
    			ac.rest(); // put the active creature to rest
    			creaturesContainer.setActiveCreature(indexOfCreatureChosen); // activate the other 
    			indexOfCreatureChosen = -1;	// reset the variable that shows whether or not another creature was chosen
    		}	
    		
    		if(ac.canJump())
    		{
    			ac.jump();
    		}
    
    		if(ac.isGrounded())
    		{
    			ac.standStraight(true);
    		}
    		else
    		{
    			ac.standStraight(false);
    		}
    
    		ac.updateJump();
    		
    		//*/
    		world.ClearForces();
    	    world.Step(timeStep, 20, 20);
    		world.ClearForces();
		}
	}
}

function draw(msdelta){
	if(!runGame)
	{
		return;
	}
	if(gameFinished)
	{
		playerWonEntireGame();
		return;	
	}

	//context.clearRect(0, 0, 825, 500);
	//*
	context.save();
	var skyGrad = context.createLinearGradient(0, 0, 0, canvas.height);
	skyGrad.addColorStop(0, "#00ABEB");
	skyGrad.addColorStop(1, "#FFF");
	context.fillStyle = skyGrad;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.restore();
	//*/
	
//	context.save();
//	context.translate(worldX, worldY);

//	world.DrawDebugData();

//	context.restore();
	{	
		var pixelsToJump = 12;
		var pixelCounter = 60;
		var ac = creaturesContainer.getActiveCreature();
		
		// debug information
				
		//writeToCanvas("Arrow keys to switch between creatures", 10, pixelCounter += pixelsToJump);
		//writeToCanvas("Drag and drop to select", 10, pixelCounter += pixelsToJump);
		//writeToCanvas("Enter to create next generation from the ones selected", 10, pixelCounter += pixelsToJump);
		//writeToCanvas("x" + fastForwardX, 10, pixelCounter += pixelsToJump);
		
		//writeToCanvas("Creature " + (ac.id + 1), 10, pixelCounter+=pixelsToJump);
		//writeToCanvas("P to pause/resume", 10, pixelCounter += pixelsToJump);
		//writeToCanvas("scale: " + ac.dna.scale.toFixed(2), 10, pixelCounter += pixelsToJump);
		//writeToCanvas(ac.dna.jumps[0].rightInclination.toFixed(2) + " (inclination jump 0)", 10, pixelCounter += pixelsToJump);
		//writeToCanvas(ac.dna.jumps[0].totalImpulse.toFixed(2) + " (impulse jump 0)", 10, pixelCounter += pixelsToJump);
		//writeToCanvas(ac.dna.jumps[1].rightInclination.toFixed(2) + " (inclination jump)", 10, pixelCounter += pixelsToJump);
		//writeToCanvas(ac.dna.jumps[1].totalImpulse.toFixed(2) + " (impulse jump 1)", 10, pixelCounter += pixelsToJump);
		//writeToCanvas("is grounded: " + ac.isGrounded(), 10, pixelCounter += pixelsToJump);
		//writeToCanvas("legs stretched: " + ac.areAnyLegsStretched(), 10, pixelCounter += pixelsToJump);
		//writeToCanvas("L fg: " + ac.leftFootGrounded, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("R fg: " + ac.rightFootGrounded, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("jump: " + ac.jumpCounter, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("timeOut: " + ac.timeOut, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("jumpDuration: " + ac.jumpDuration, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("timeBeforeFirstJump: " + ac.timeBeforeFirstJump, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("isJumping: " + ac.isJumping, 10, pixelCounter += pixelsToJump);
		//writeToCanvas("canJump: " + ac.canJump(), 10, pixelCounter += pixelsToJump);
		//writeToCanvas("impulse: " + creaturesContainer.getActiveCreature().dna.jumps[creaturesContainer.getActiveCreature().jumpCounter].totalImpulse,10,pixelCounter+=pixelsToJump);
		//writeToCanvas("loops " + loops,10,pixelCounter+=pixelsToJump);
		//writeToCanvas("mouseX " + mouseX + " mouseY " + mouseY, 10, pixelCounter+=pixelsToJump);
		//writeToCanvas("gotbody " + gotBody,10,pixelCounter+=pixelsToJump);
		
		//writeToCanvas("",10,pixelCounter+=pixelsToJump);

		currentLevel.render();
		rightFootParticleEmitter.draw();
		leftFootParticleEmitter.draw();
		creaturesContainer.getActiveCreature().render(msdelta);
		
    	selectionPanel.render(context, bin); 
		helpButton.render(context);
		
		if(selectionPanel.selected.length > 0)
		      nextGenButton.render(context);
		
		creaturesContainer.render(context);
		
		if(won)
			playerWonLevel();
			
		if(showInstructions > -1)
		{
		     context.drawImage(helpPanels[showInstructions], 0, 0, canvas.width, canvas.height);
		}
	}
}

function getIconAtMouse()
{
	var icons = creaturesContainer.selectableIcons;
	var totalIcons = icons.length;
	var x = mouseX * worldScale + worldX;
	var y = mouseY * worldScale + worldY;
	var i;
	for(i = 0; i < totalIcons; i++)
	{
		if((x >= icons[i].x - (icons[i].w/2 * icons[i].scale) && x <= icons[i].x + (icons[i].w/2 * icons[i].scale)) &&
		   (y >= icons[i].y - (icons[i].h/2 * icons[i].scale) && y <= icons[i].y + (icons[i].h/2 * icons[i].scale)))
			{
				icons[i].grabbedX = x - icons[i].x;
				icons[i].grabbedY = y - icons[i].y;
				//console.debug("returned selectable icon");
		   		return new ClickableIcon(icons[i], ICON_TYPE.SelectableIcon);
		   	}
	}
	
	icons = selectionPanel.selected;
	totalIcons = icons.length;
	
	//console.debug("total selected: " + totalIcons);
	
	for(i = 0; i < totalIcons; i++)
	{
		if((x >= icons[i].x - (icons[i].w/2 * icons[i].scale) && x <= icons[i].x + (icons[i].w/2 * icons[i].scale)) &&
		   (y >= icons[i].getAdjustedY(i) - (icons[i].h/2 * icons[i].scale) && y <= icons[i].getAdjustedY(i) + (icons[i].h/2 * icons[i].scale)))
			{
				icons[i].grabbedX = x - icons[i].x;
				icons[i].grabbedY = y - icons[i].y;
				//console.debug("returned selected icon");
		   		return new ClickableIcon(icons[i], ICON_TYPE.SelectedIcon, i);
		   	}
	}
	   
	if((x >= bin.x && x <= bin.x + bin.w) &&
		   (y >= bin.y && y <= bin.y + bin.h))
			{
				//console.debug("returned bin icon");
		   		return new ClickableIcon(bin, ICON_TYPE.Bin);
		   	}
    if((x >= nextGenButton.x && x <= nextGenButton.x + nextGenButton.image.width) &&
           (y >= nextGenButton.y && y <= nextGenButton.y + nextGenButton.image.height))
            {
                return new ClickableIcon(nextGenButton, ICON_TYPE.NextGen);
            }

    if((x >= helpButton.x && x <= helpButton.x + helpButton.image.width) &&
           (y >= helpButton.y && y <= helpButton.y + helpButton.image.height))
            {
                return new ClickableIcon(helpButton, ICON_TYPE.Help);
            }

	return;
}

function wasChosen()
{
	var icon = selectedIcon.icon;
	if((icon.x >= selectionPanel.x && icon.x <= selectionPanel.x + selectionPanel.w) &&
		(icon.y >= selectionPanel.y && icon.y <= selectionPanel.y + selectionPanel.h))
		{
			//console.debug("was chosen");
			return true;
		}
	return false;
}

function wasBinned()
{
	var icon = selectedIcon.icon;
	//console.debug("was binned was called");
	if((icon.x >= bin.x && icon.x <= bin.x + bin.w) &&
		(icon.getAdjustedY(selectedIcon.id) >= bin.y && icon.getAdjustedY(selectedIcon.id) <= bin.y + bin.h))
		{
			//console.debug("icon was binned");
			return true;
		}
	return false;
}

function wasChosenToMate()
{
	var selected = selectionPanel.selected;
	var totalChosen = selected.length;
	var icon = selectedIcon.icon;
	var leftX = icon.x;
	var topY = icon.y;
	var rightX = icon.x + icon.w;
	var bottomY = icon.y + icon.h;
	
	for(var i = 0; i < totalChosen; i++)
	{
		if(leftX < selected[i].x  + selected[i].w &&
			rightX > selected[i].x &&
			topY < selected[i].getAdjustedY(i) + selected[i].h && 
			bottomY > selected[i].getAdjustedY(i))
			{
				return i;
			}	
	}

	return -1;
}

//helpers
// the next three functions were not implemented by me
//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
	var elem = element, tagname = "", x = 0, y = 0;

	while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
	   y += elem.offsetTop;
	   x += elem.offsetLeft;
	   tagname = elem.tagName.toUpperCase();

	   if(tagname == "BODY")
		  elem = 0;

	   if(typeof(elem) == "object") {
		  if(typeof(elem.offsetParent) == "object")
			 elem = elem.offsetParent;
	   }
	}

	return {x: x, y: y};
};

function getBodyAtMouse() {
	mousePVec = new b2Vec2(mouseX, mouseY);
	var aabb = new b2AABB();
	aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
	aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

	// Query the world for overlapping shapes.

	selectedBody = null;
	world.QueryAABB(getBodyCB, aabb);
	return selectedBody;
}

function getBodyCB(fixture) {
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
	   if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
		  selectedBody = fixture.GetBody();
		  return false;
	   }
	}
	return true;
}

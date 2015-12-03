// scene objects can be boxes or polygons, dynamic or static

			
			
function SceneObject(level)
{
	this.body;
	this.fixture;
	this.scale;
	this.image;
	this.originalPosition;
	this.originalOrientation;
	
	GameEntity.call(this);
	this.level = level;
}

SceneObject.prototype = new GameEntity();
SceneObject.prototype.constructor = SceneObject;

SceneObject.prototype.initialize = function(scale, isDynamic, position, fixDef, bodyDef)
{
	this.scale = scale;
	
	this.originalPosition = new b2Vec2(position.x * scale, position.y * scale);
 	this.originalOrientation = 0;
 	
 	bodyDef.position.x = this.originalPosition.x;
	bodyDef.position.y = this.originalPosition.y;
 	
	fixDef.density = 1.0;
	fixDef.friction = 1.0;
	fixDef.restitution = 0.2;
	fixDef.shape = new b2PolygonShape;
	
	if(isDynamic)
	{
		bodyDef.type = b2Body.b2_dynamicBody;
	}
	else
	{
		bodyDef.type = b2Body.b2_staticBody;	
	}
};

SceneObject.prototype.restore = function()
{
	stopBody(this.body);	
		
	this.body.SetPositionAndAngle(this.originalPosition, this.originalOrientation);	
	this.body.SetActive(true);
}

SceneObject.prototype.render = function()
{
    var body = this.body;
    var pos = body.GetPosition();
    var angle = body.GetAngle();
    
    /*
    if(this.entityType == ENTITY_TYPE.SceneBox)
    {  
    	var image = this.image;
    	if(image!=null && image!=undefined)
    	{
    		context.save();
    		context.translate(pos.x * worldScale + worldX, pos.y * worldScale + worldY);
    		context.rotate(body.GetAngle());
    		
    		var vertices = body.GetFixtureList().GetShape().GetVertices();
    		var width = vertices[1].x - vertices[0].x; 
    		var height = vertices[2].y - vertices[0].y;			
    		
    		context.drawImage(image, vertices[0].x-(width * (worldScale/2)), vertices[0].y-(height * (worldScale/2)), width * worldScale, height * worldScale);
    		context.restore();
    	}
    }
    */
    // change to terrain box
    if(this.isGround())
    {		
    /*
			var groundGradient = context.createLinearGradient(0, 0, 0, canvas.height);
			groundGradient.addColorStop(0, "#26c000");
			groundGradient.addColorStop(1, "#FFF");
			context.fillStyle = groundGradient;
    */
        context.save();
        
        var groundGradient = context.createLinearGradient(0, 0, 0, canvas.height);
        groundGradient.addColorStop(0, "#268800");
        groundGradient.addColorStop(0.5, "#80bb00");
        groundGradient.addColorStop(1, "#268800");
        context.fillStyle = groundGradient;
        
        
        context.translate(pos.x * worldScale + worldX, pos.y * worldScale + worldY);
        var vertices = body.GetFixtureList().GetShape().GetVertices();
        
        context.beginPath();
        for(var i = 0; i < vertices.length; i++)
        {
        	//console.debug("counting vertices. x:" + vertices[i].x + "y: " + vertices[i].y);
        	context.lineTo(vertices[i].x * (worldScale), vertices[i].y * (worldScale));
        }
        context.closePath();
        context.clip();
        
        context.translate(-pos.x * worldScale - worldX, -pos.y * worldScale - worldY);
        
        context.fillRect(0,0,canvas.width, canvas.height);
        		
        context.restore();  
    }
    
    if(this.entityType == ENTITY_TYPE.Brick)
    {
        context.save();
    
        var vertices = body.GetFixtureList().GetShape().GetVertices();
        
        var width = (vertices[1].x - vertices[0].x) * worldScale; 
        var height = (vertices[2].y - vertices[0].y) * worldScale;
        
        //console.debug("width * worldScale: " + width * worldScale + " width * worldScale: " + height * worldScale);
        
        var x = -width/2;
        var y = -height/2;
        
        context.translate(pos.x * worldScale + worldX, pos.y * worldScale + worldY);
        context.rotate(angle);
        
        context.fillStyle = "#ff8833";
            
        context.fillRect(x, y, width, height);
        
        context.lineWidth = 2;
        context.strokeStyle = "#aa2222";
        context.strokeRect(x, y, width, height);
        context.restore();
    }
}

SceneObject.prototype.initializePolygon = function(vertices, scale, isDynamic, position)
{
	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;
	this.initialize(scale, isDynamic, position, fixDef, bodyDef);
	this.entityType = ENTITY_TYPE.GroundPolygon;

	for(var i = 0; i < vertices.length; i++)
	{
		vertices[i].x = vertices[i].x * this.scale;
		vertices[i].y = vertices[i].y * this.scale; 
	}
	fixDef.shape.SetAsArray(vertices, vertices.length);
	
	this.body = world.CreateBody(bodyDef);
	this.fixture = this.body.CreateFixture(fixDef);
	
	this.fixture.SetUserData(this);
	this.body.SetUserData(this);
	
	return this;
};

SceneObject.prototype.initializeBox = function(w, h, scale, isDynamic, position, image)
{
	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;
	this.initialize(scale, isDynamic, position, fixDef, bodyDef);
	if(isDynamic)
	   this.entityType = ENTITY_TYPE.Brick;
	else
	   this.entityType = ENTITY_TYPE.GroundBox;
	this.image = image;
	
	fixDef.shape.SetAsOrientedBox(w * this.scale, h * this.scale, new b2Vec2(0, 0), 0);
	
	this.body = world.CreateBody(bodyDef);
	this.fixture = this.body.CreateFixture(fixDef);
	
	this.fixture.SetUserData(this);
	this.body.SetUserData(this);
	
	return this;
};

function Level()
{
	this.assets = new Array();
	this.theGoal;
	this.creaturesParameters;
	
	this.maxX = 0;
	this.maxY = 0;
	this.minX = 0;
	this.minY = 0;
}

Level.prototype.destroy = function()
{
	var length = this.assets.length;
	//console.debug("length: " + length);
	for(var i = 0; i < length; i++)
	{
		//console.debug("i: " + i);
		world.DestroyBody(this.assets[i].body);
	}
	world.DestroyBody(this.theGoal.body);
}

Level.prototype.restore = function()
{
	var numberOfAssets = this.assets.length;
	//console.debug("length: " + length);
	for(var i = 0; i < numberOfAssets; i++)
	{
		this.assets[i].restore();	
	}
}

Level.prototype.initialize = function()
{
	alert("Level initialization not implemented for this level.");	
};

Level.prototype.render = function()
{
	var numberOfAssets = this.assets.length;
	//console.debug("length: " + length);
	this.theGoal.render();
	
	for(var i = 0; i < numberOfAssets; i++)
	{
		this.assets[i].render();	
	}
};

function createLevel(levelId) // there is only one level for now, so the levelId is not used.
{	
	
	switch(levelId)
	{
		case 1:
			return new Level4(); // should be 4
		break;
		
		case 2:
			return new Level5();
		break;
		
		case 3:
			return new Level6();
		break;
		
		case 4:
			return new Level1();
		break;
		
		case 5:
			return new Level2();
		break;
		
		case 6:
			return new Level3();
		break;
	}
}

	
function Level1()
{
	Level.call(this);
}

Level1.prototype = new Level();
Level1.prototype.constructor = Level1;

Level1.prototype.initialize = function()
{
	var scale = 1;
	var boxImage = document.getElementById("rectangularPlatform");
	
 	this.assets.push(new SceneObject(this).initializeBox(10, 1, scale, false, new b2Vec2( 5  , 7.55))); // floor
 	this.assets.push(new SceneObject(this).initializeBox( 1, 7, scale, false, new b2Vec2(-0.9, 6.5 ))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 7, scale, false, new b2Vec2(10.9, 6.5 ))); // right wall
 	
 	/*
 	this.assets.push(new SceneBlock(this).initializePolygon([
 					new b2Vec2(  0, 0),
 					new b2Vec2(1.5, 0),
 					new b2Vec2(2.0, 1),
 					new b2Vec2(2.0, 2),
 					new b2Vec2(  0, 2)
 					], 1, false, new b2Vec2(0.1, 4.55)));
 */
 	this.assets.push(new SceneObject(this).initializeBox(0.7, 0.2, scale, false, new b2Vec2(6.8, 4.7), boxImage));
 	this.assets.push(new SceneObject(this).initializeBox(0.7, 0.2, scale, false, new b2Vec2(3.3, 4.7), boxImage));
 	this.assets.push(new SceneObject(this).initializeBox(0.6, 0.2, scale, false, new b2Vec2(5, 2.7), boxImage)); 
		
	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(5, 2));
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 3;
	cp.maxInitImpulse = 35
	cp.minInitImpulse = 20;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(5 * scale, 6 * scale);
	this.creaturesParameters = cp;
};

function Level2()
{
	Level.call(this);
}

Level2.prototype = new Level();
Level2.prototype.constructor = Level2;

Level2.prototype.initialize = function()
{
	var scale = 1;
	var boxImage = document.getElementById("rectangularPlatform");
	
 	this.assets.push(new SceneObject(this).initializeBox(10, 1, scale, false, new b2Vec2( 5  , 7.55))); // floor
 	this.assets.push(new SceneObject(this).initializeBox( 1, 7, scale, false, new b2Vec2(-0.9, 6.5 ))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 7, scale, false, new b2Vec2(10.9, 6.5 ))); // right wall
 	
 	
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(  0, 0),
 					new b2Vec2(1.5, 0),
 					new b2Vec2(2.0, 1),
 					new b2Vec2(2.0, 2),
 					new b2Vec2(  0, 2)
 					], scale, false, new b2Vec2(0.1, 4.65)));
 	
 	
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(   0, 0),
 					new b2Vec2(1.25, 0),
 					new b2Vec2(2.00, 1),
 					new b2Vec2(   0, 1)
 					], scale, false, new b2Vec2(2.1, 5.65)));
 					
	// the goal platform
	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(0.75, 0  ),
 					new b2Vec2(3.00, 0  ),
 					new b2Vec2(3.00, 0.5),
 					new b2Vec2(   0, 0.5)
 					], scale, false, new b2Vec2(2.5, 2.5)));
	
	// right stairs
		// first step
		this.assets.push(new SceneObject(this).initializeBox(0.5, 0.25, scale, false, new b2Vec2(6.4, 6.4)/*, boxImage*/)); // right wall
		
		// second step
		this.assets.push(new SceneObject(this).initializeBox(0.5, 0.5, scale, false, new b2Vec2(7.4, 6.15)/*, boxImage*/)); // right wall
		
		// final block
		this.assets.push(new SceneObject(this).initializeBox(1, 0.75, scale, false, new b2Vec2(8.9, 5.9)/*, boxImage*/)); // right wall
	// end of stairs
	
	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(4.5, 2));
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 4;
	cp.maxInitImpulse = 35
	cp.minInitImpulse = 20;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(5 * scale, 5.75 * scale);
	this.creaturesParameters = cp;
};

function Level3()
{
	Level.call(this);
}

Level3.prototype = new Level();
Level3.prototype.constructor = Level2;

Level3.prototype.initialize = function()
{
	var scale = 1/2.4;
	var boxImage = document.getElementById("rectangularPlatform");
	
 	this.assets.push(new SceneObject(this).initializeBox(18.5, 2, scale, false, new b2Vec2( 16.5, 17))); // floor
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2( -1, 7.5 ))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2(34, 7.5 ))); // right wall
 	
 // center obstacle
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(   0, 0),
 					new b2Vec2( 1.0, 0),
 					new b2Vec2( 3.0, 6),
 					new b2Vec2(-2.0, 6)
 					], scale, false, new b2Vec2(12, 9.1)));
 	
 // goal platform left
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(  0, 0),
 					new b2Vec2(5.0, 0),
 					new b2Vec2(8.0, 6),
 					new b2Vec2(8.0, 8)
 					], scale, false, new b2Vec2(13, 0)));
 					
// goal platform right
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(  0, 0),
 					new b2Vec2(5.0, 0),
 					new b2Vec2(4.0, 2),
 					new b2Vec2(  0, 2)
 					], scale, false, new b2Vec2(20.95, 6)));
 	
	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(23 * scale, 5 * scale));
	
	// set the offset limit in the x direction as this level is horizontaly bigger than the screen
	this.minX = -265;
	
	this.maxY = 100;
	
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 3;
	cp.maxInitImpulse = 45
	cp.minInitImpulse = 30;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(5 * scale, 14 * scale);
	this.creaturesParameters = cp;
};


// the first
function Level4()
{
	Level.call(this);
}

Level4.prototype = new Level();
Level4.prototype.constructor = Level2;

Level4.prototype.initialize = function()
{
	var scale = 1/2.4;
	var boxImage = document.getElementById("rectangularPlatform");
	
 	this.assets.push(new SceneObject(this).initializeBox(12.5, 2, scale, false, new b2Vec2( 12, 17))); // floor
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2( -1, 7.5 ))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2(25, 7.5 ))); // right wall
 	
 // center obstacle
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(   0, 0),
 					new b2Vec2( 1.0, 0),
 					new b2Vec2( 8.0, 7),
 					new b2Vec2(-3.0, 7)
 					], scale, false, new b2Vec2(13, 8.1)));
 	
 	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(22.5 * scale, 14 * scale));
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 2;
	cp.maxInitImpulse = 35
	cp.minInitImpulse = 20;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(5 * scale, 14 * scale);
	this.creaturesParameters = cp;
};

function Level5()
{
	Level.call(this);
}

Level5.prototype = new Level();
Level5.prototype.constructor = Level2;

Level5.prototype.initialize = function()
{
	var scale = 1/2.4;
	var boxImage = document.getElementById("rectangularPlatform");
	
	this.assets.push(new SceneObject(this).initializeBox(12, 2, scale, false, new b2Vec2( 12, 36))); // floor
 	this.assets.push(new SceneObject(this).initializeBox( 1, 18, scale, false, new b2Vec2( -1, 16))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 18, scale, false, new b2Vec2(25, 16))); // right wall
 	
 // right part of the ground
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(   0, 0),
 					new b2Vec2( 7.0, 0),
 					new b2Vec2( 9.0, 3),
 					new b2Vec2(11.0, 9),
 					new b2Vec2( 0.0, 9)
 					], scale, false, new b2Vec2(0, 16)));
 
 // left part of the ground
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2(   0, 0),
 					new b2Vec2( 7.0, 0),
 					new b2Vec2( 7.0, 9),
 					new b2Vec2(-4.0, 9),
 					new b2Vec2(-2.0, 3)
 					], scale, false, new b2Vec2(17, 16)));
 	
 	
 	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(5 * scale, 32 * scale));
	
	this.minY = -(canvas.height + 30);
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 4;
	cp.maxInitImpulse = 35
	cp.minInitImpulse = 20;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(4 * scale, 14 * scale);
	this.creaturesParameters = cp;
};

function Level6()
{
	Level.call(this);
}

Level6.prototype = new Level();
Level6.prototype.constructor = Level2;

Level6.prototype.initialize = function()
{
var scale = 1/2.4;
	var boxImage = document.getElementById("rectangularPlatform");
	
 	this.assets.push(new SceneObject(this).initializeBox(12, 2, scale, false, new b2Vec2( 12, 17))); // floor
 	this.assets.push(new SceneObject(this).initializeBox(12, 2, scale, false, new b2Vec2( 12, -0.35))); // roof
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2( -1, 7.5 ))); // left wall
 	this.assets.push(new SceneObject(this).initializeBox( 1, 8, scale, false, new b2Vec2(25, 7.5 ))); // right wall
 	
 	// left platform
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2( 0, 0),
 					new b2Vec2(10, 7),
 					new b2Vec2( 0, 7),
 					], scale, false, new b2Vec2(0, 8.1)));
 	
 	// gloal platform
 	this.assets.push(new SceneObject(this).initializePolygon([
 					new b2Vec2( 0, 0),
 					new b2Vec2(12, 0),
 					new b2Vec2(12, 6),
 					new b2Vec2( 0, 6),
 					], scale, false, new b2Vec2(12, 9.1)));
 	
 	for(var i = 0; i < 9; i++)
 	{
 		this.assets.push(new SceneObject(this).initializeBox( 0.2, 0.4, scale, true, new b2Vec2(12.2, 2.21 + i*0.8))); // left wall
 	}
 	// add the goal
	this.theGoal = new Goal();
	this.theGoal.initialize(new b2Vec2(19 * scale, 7 * scale));
	
	// initialize the creature's parameters
	
	// physical creature's parameters
	var cp = new CreaturesParameters();
	cp.stdLegForce = 0.5;
	cp.stdFootSpeed = 2;
	cp.jumpingFootSpeed = 20;
	cp.stdJumpDuration = 10;
	cp.timeBeforeFirstJump = 60;
	
	// dna parameters
	cp.quantityOfJumps = 2;
	cp.maxInitImpulse = 35
	cp.minInitImpulse = 20;
	cp.minScale = 0.7;
	cp.maxScaleVariation = 0.5;
	cp.minDuration = 3;
	cp.timeOut = 120;
	
	// dna manipulation's parameters
	cp.chanceOfMutation = 1/(cp.quantityOfJumps);
	cp.amountOfMutation = 0.2;
	
	cp.initialPosition = new b2Vec2(5 * scale, 9.5 * scale);
	this.creaturesParameters = cp;

};
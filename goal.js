// the definition of the goal object
function Goal () {
	this.entityType;
	this.body;
	this.fixture;
	this.initialPosition;
	GameEntity.call(this);
}

Goal.prototype = new GameEntity();
Goal.prototype.constructor = Goal;

Goal.prototype.initialize = function(pos)
{	
	this.entityType = ENTITY_TYPE.Goal;
	
	var scale  = 0.5;
	var charBodyDef = new b2BodyDef;

	charBodyDef.type = b2Body.b2_kinematicBody;
	
	this.initialPosition = pos.Copy();
	charBodyDef.position = this.initialPosition;

	//this.body.SetFixedRotation(true);
	this.body = world.CreateBody(charBodyDef);
	
	var charFixDef = new b2FixtureDef;

	// general settings
	charFixDef.friction = 0.5;
	charFixDef.restitution = 0.2;
	
	// 
	charFixDef.shape = new b2PolygonShape;
	charFixDef.isSensor = true;
	charFixDef.shape.SetAsBox(0.35 * scale,0.35 * scale);
	this.fixture = this.body.CreateFixture(charFixDef);
	this.body.SetAngularVelocity( 90 * DEGTORAD );
	
	this.body.SetUserData(this);
	this.fixture.SetUserData(this);
};


Goal.prototype.render = function()
{
    var body = this.body;
    var pos = body.GetPosition();
    var angle = body.GetAngle();
    
    context.save();
    
    var vertices = body.GetFixtureList().GetShape().GetVertices();
    
    var width = (vertices[1].x - vertices[0].x) * worldScale; 
    var height = (vertices[2].y - vertices[0].y) * worldScale;
    
    //console.debug("width * worldScale: " + width * worldScale + " width * worldScale: " + height * worldScale);
    
    var x = -width/2;
    var y = -height/2;
    
    context.translate(pos.x * worldScale + worldX, pos.y * worldScale + worldY);
    context.rotate(angle);
    
    var groundGradient = context.createLinearGradient(x, y, width, height);
        groundGradient.addColorStop(0, "#5555cc");
        groundGradient.addColorStop(1, "#aaaaff");
        context.fillStyle = groundGradient;
    
    
        
    context.fillRect(x, y, width, height);
    
    context.lineWidth = 3;
    context.strokeStyle = "#111188";
    context.strokeRect(x, y, width, height);
    
    context.restore();  
};
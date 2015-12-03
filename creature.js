// loading the images used to draw the creature
var cTop = document.getElementById("cTop");
var cBottom = document.getElementById("cBottom");
var cRFoot = document.getElementById("cRFoot");
var cLFoot = document.getElementById("cLFoot");

// the creature's main part (circle at the top)
function MainPart()
{
	this.mainBody;
	this.headFixture;
	this.bellyFixture;
	GameEntity.call(this);
	this.creature;
}
// performing inheritance
MainPart.prototype = new GameEntity();
MainPart.prototype.constructor = MainPart;

// creating the main part
MainPart.prototype.initialize = function(creature, bodyDef, fixDef)
{
	this.entityType = ENTITY_TYPE.CreatureMain;
	this.creature = creature;
	var scale = this.creature.dna.scale;
	 
	bodyDef.fixedRotation = true;
	this.mainBody = world.CreateBody(bodyDef);
	
	// main body: belly
	fixDef.friction = 0.2;
	fixDef.shape = new b2CircleShape(0.2 * scale);
	this.bellyFixture = this.mainBody.CreateFixture(fixDef);
	
	// main body: head
	//charFixDef.shape = new b2CircleShape(0.075 * this.dna.scale);
	//charFixDef.shape.SetLocalPosition(new b2Vec2(0 * this.dna.scale,-0.25 * this.dna.scale));
	//this.headFixture = this.mainBody.CreateFixture(charFixDef);
	
	this.mainBody.SetUserData(this);
	this.bellyFixture.SetUserData(this);
};

// the middle part of the creature's body (the hip)
function MiddlePart()
{
	this.middleBody;
	this.middleFixture;
	this.mainJoint;
	GameEntity.call(this);
	this.creature;
	
	// used to enable and disable the joint that makes the creature stand straight
	this.distJointDef;
	this.distJointR;
	this.distJointL;
}

// performing inheritance
MiddlePart.prototype = new GameEntity();
MiddlePart.prototype.constructor = MiddlePart;

// creating the middle part
MiddlePart.prototype.initialize = function(creature, bodyDef, fixDef, mainBody)
{
	this.entityType = ENTITY_TYPE.CreatureMiddle;
	this.creature = creature;
	var scale = this.creature.dna.scale;
	
	bodyDef.fixedRotation = false;
	this.middleBody = world.CreateBody(bodyDef);
		
	// middle body
	fixDef.friction = 0.2;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(0.2 * scale, 0.1 * scale);
	this.middleFixture = this.middleBody.CreateFixture(fixDef);

	// connecting main and middle bodies
	var revJointDef = new b2RevoluteJointDef;
  	revJointDef.bodyA = mainBody;
  	revJointDef.bodyB = this.middleBody;
	revJointDef.collideConnected = false;

	var hipAngle = 45;
	revJointDef.localAnchorA.Set(0, (0.25 * scale) / 2);
	revJointDef.localAnchorB.Set(0,-0.1 * scale);
	revJointDef.enableLimit = true;
	revJointDef.lowerAngle = -hipAngle * DEGTORAD;
	revJointDef.upperAngle = hipAngle * DEGTORAD;
	this.mainJoint = world.CreateJoint(revJointDef);

	// connecting main and middle bodies with distance joint
	this.distJointDef = new b2DistanceJointDef;
  	this.distJointDef.bodyA = mainBody;
  	this.distJointDef.bodyB = this.middleBody;
  	this.distJointDef.collideConnected = false;
	this.distJointDef.dampingRatio = 0;
	this.distJointDef.frequencyHz = 10;
	this.distJointDef.length = 0.3;

	this.distJointDef.localAnchorA.Set(0, 0);
	
	this.middleBody.SetUserData(this);
	this.middleFixture.SetUserData(this);
};

// defining the creature's foot
function Foot()
{
	this.footBody;
	this.footFixture;
	this.middleJoint;
	this.isRightFoot;
	GameEntity.call(this);
	this.creature;
}

// performing inheritance
Foot.prototype = new GameEntity();
Foot.prototype.constructor = Foot;

// creating the foot
Foot.prototype.initialize = function(creature, bodyDef, fixDef, middleBody, isRightFoot, stdLegForce, stdFootSpeed)
{
	var x = 0.15;
	if(isRightFoot)
	{
		this.entityType = ENTITY_TYPE.RFoot;	
	}
	else
	{
		this.entityType = ENTITY_TYPE.LFoot;
		x = -x;
	}
	
	this.creature = creature;
	var scale = this.creature.dna.scale;
	
	bodyDef.fixedRotation = false;
	this.footBody = world.CreateBody(bodyDef);

	fixDef.shape = new b2CircleShape(0.08 * scale);
	fixDef.friction = 1;
	//fixDef.shape = new b2PolygonShape;
	//fixDef.shape.SetAsBox(0.07 * scale, 0.07 * scale);
	
	this.footFixture = this.footBody.CreateFixture(fixDef);
	
	// connecting middle and right foot bodies
	var prismJointDef = new b2PrismaticJointDef;
  	prismJointDef.bodyA = middleBody;
  	prismJointDef.bodyB = this.footBody;
  	prismJointDef.collideConnected = false;
	
	prismJointDef.localAxisA.Set(0, 1);
	prismJointDef.localAxisA.Normalize();
	prismJointDef.localAnchorA.Set(x * scale, 0.15 * scale);
	prismJointDef.localAnchorB.Set(0,0);
	
	prismJointDef.enableLimit = true;
  	prismJointDef.lowerTranslation = 0;
 	prismJointDef.upperTranslation = 0.3 * scale;
	
	prismJointDef.enableMotor = true;
  	prismJointDef.maxMotorForce = stdLegForce;
  	prismJointDef.motorSpeed = stdFootSpeed;
	
	this.middleJoint = world.CreateJoint(prismJointDef);
	
	this.footBody.SetUserData(this);
	this.footFixture.SetUserData(this);
};	

// the definition of a creature
function Creature(idNumber)
{
	this.dna;
	this.id = idNumber;
	
	this.mainPart = new MainPart();
	
	this.middlePart = new MiddlePart();
	
	this.rightFoot = new Foot();
	this.leftFoot = new Foot();
	
	this.initialPosition;
	this.selectableIcon = new SelectableIcon(this);
	
	this.jumpCounter = 0;
	this.jumpDuration = 0;
	this.timeOut = 0;
	this.timeBeforeFirstJump;
	this.jumpingFootSpeed;
	this.isJumping = false;
	
	this.stdLegForce;
	this.stdFootSpeed;
	
	this.leftFootGrounded = 0;
	this.rightFootGrounded = 0;
	this.isStandingStraight = false;
	this.isActive;
	
};

// returns true if the creature has any of its feet on the ground
Creature.prototype.isGrounded = function()
{
	return ((this.leftFootGrounded + this.rightFootGrounded) > 0);
}

// returns true if at least one foot is in position to give a good jump.
Creature.prototype.atLeastOneGoodFoot = function()
{
	return (this.leftFootGrounded > 0 && this.leftFoot.middleJoint.GetJointTranslation() <= this.leftFoot.middleJoint.GetLowerLimit()) ||
		   (this.rightFootGrounded > 0 && this.rightFoot.middleJoint.GetJointTranslation() <= this.rightFoot.middleJoint.GetLowerLimit());
}

// returns true if any legas are at least a minimaly stretched
Creature.prototype.areAnyLegsStretched = function()
{
	return this.leftFoot.middleJoint.GetJointTranslation() > this.leftFoot.middleJoint.GetLowerLimit() ||
		   this.rightFoot.middleJoint.GetJointTranslation() > this.rightFoot.middleJoint.GetLowerLimit();
}

// adds or removes (dependint on the value of boolVal) the joints used to make the creature unrotate its hips
Creature.prototype.standStraight = function(boolVal)
{
	if(boolVal)
	{
		if(!this.isStandingStraight)
		{
			var distJointDef = this.middlePart.distJointDef;
			distJointDef.localAnchorB.Set(-0.2 * this.dna.scale,-0.1 * this.dna.scale);
			this.middlePart.distJointL =  world.CreateJoint(distJointDef);
			
			distJointDef.localAnchorB.Set(0.2 * this.dna.scale,-0.1 * this.dna.scale);
			this.middlePart.distJointR =  world.CreateJoint(distJointDef);
			this.isStandingStraight = true;
		}
	}
	else
	{
		if(this.isStandingStraight)
		{
			world.DestroyJoint(this.middlePart.distJointR);
			world.DestroyJoint(this.middlePart.distJointL);
			this.isStandingStraight = false;
		}
	}

} 

// sets the dna
Creature.prototype.setDna = function(dna)
{
	this.dna = dna;
};
  
// creates and initialize the creature's dna with the parameters passed.
Creature.prototype.initializeDna = function(quantityOfJumps, minInitImpulse, maxInitImpulse, minDuration, timeOut, minScale, maxScaleVariation)
{
	this.dna = new Dna();
	this.dna.initialize(quantityOfJumps, minInitImpulse, maxInitImpulse, minDuration, timeOut, minScale, maxScaleVariation);
};
 
// sets some basic initial parameters
Creature.prototype.initialize = function(initialPosition, timeBeforeFirstJump, jumpingFootSpeed, stdLegForce, stdFootSpeed)
{
	this.timeBeforeFirstJump = timeBeforeFirstJump;
	this.jumpingFootSpeed = jumpingFootSpeed;
	this.initialPosition = initialPosition.Copy();
	this.stdLegForce = stdLegForce;
	this.stdFootSpeed = stdFootSpeed;	
};

// creates the creature's body. It is necessary that the creature contains a valid dna
Creature.prototype.createBody = function()
{
	//console.debug("scale: " + this.dna.scale);
	var sharedBodyDef = new b2BodyDef;
	
	sharedBodyDef.type = b2Body.b2_dynamicBody;
	sharedBodyDef.position = this.initialPosition;
		
	var sharedFixDef = new b2FixtureDef;

	// general settings
	sharedFixDef.restitution = 0.2;
	sharedFixDef.density = 1;
	
	// main part
	this.mainPart.initialize(this, sharedBodyDef, sharedFixDef);
	
	// middle part
	this.middlePart.initialize(this, sharedBodyDef, sharedFixDef, this.mainPart.mainBody);
	
	// right foot
	this.rightFoot.initialize(
								this,
								sharedBodyDef,
								sharedFixDef,
								this.middlePart.middleBody,
								true,
								this.stdLegForce,
								this.stdFootSpeed
							 );
	
	// left foot
	this.leftFoot.initialize(
								this,
								sharedBodyDef,
								sharedFixDef,
								this.middlePart.middleBody,
								false,
								this.stdLegForce,
								this.stdFootSpeed
							 );
}

// returns the creature's total mass
Creature.prototype.totalMass = function()
{
	return this.mainPart.mainBody.GetMass() +
		   this.middlePart.middleBody.GetMass() +
		   this.rightFoot.footBody.GetMass() +
		   this.leftFoot.footBody.GetMass();
	
};

// returns whether or not the creature can jump
Creature.prototype.canJump = function()
{
	if(!this.isJumping && this.jumpCounter < this.dna.quantityOfJumps)
	{
		if(this.isGrounded() && !this.areAnyLegsStretched())
		{
			return true;
		}
		else if(this.timeOut == 0 && this.atLeastOneGoodFoot())
		{
			return true
		}
		else
		{
			return false;
		}
	}
	else
		return false;
}

// performs the jump by tunring on motors on the joints connecting the creature's hip to its feet (thinking of the joints as legs)
Creature.prototype.jump = function()
{
	var jumpInfo = this.dna.jumps[this.jumpCounter++];
	//alert((this.jumpCounter - 1) + " total: "+jumpInfo.totalImpulse + " right incllination: " + jumpInfo.rightInclination
	//+ " duration: " + jumpInfo.duration);
	this.rightFoot.middleJoint.SetMaxMotorForce(jumpInfo.totalImpulse * jumpInfo.rightInclination); 
	this.leftFoot.middleJoint.SetMaxMotorForce(jumpInfo.totalImpulse * (1-jumpInfo.rightInclination)); 
	this.rightFoot.middleJoint.SetMotorSpeed(this.jumpingFootSpeed);
	this.leftFoot.middleJoint.SetMotorSpeed(this.jumpingFootSpeed);
	
	this.jumpDuration = jumpInfo.duration;
	this.timeOut = jumpInfo.timeOut;
	this.isJumping = true;
};

// checks if a jump should still be going on
// should be called at every game update.
Creature.prototype.updateJump = function()
{
	if(this.isJumping)
	{
		if(this.jumpDuration < 1)
		{
			this.stopJumping();
		}
		else
		{
			this.jumpDuration--;
		}
	}
	if(this.timeOut > 0)
		this.timeOut--;
};

// stops the jump by turning the legs' motors back to the standard values
Creature.prototype.stopJumping = function()
{
	this.rightFoot.middleJoint.SetMaxMotorForce(this.stdLegForce); 
	this.leftFoot.middleJoint.SetMaxMotorForce(this.stdLegForce);
	this.rightFoot.middleJoint.SetMotorSpeed(this.stdFootSpeed);
	this.leftFoot.middleJoint.SetMotorSpeed(this.stdFootSpeed);

	this.isJumping = false;
};

// positions the creature in a position ready to start jumping about the level
Creature.prototype.prepareToStart = function()
{
	this.jumpCounter = 0;
	
	stopBody(this.mainPart.mainBody);
	stopBody(this.middlePart.middleBody);
	stopBody(this.rightFoot.footBody);
	stopBody(this.leftFoot.footBody);	
		
	this.mainPart.mainBody.SetPositionAndAngle(this.initialPosition,0);
	this.middlePart.middleBody.SetPositionAndAngle(new b2Vec2(this.initialPosition.x,this.initialPosition.y+0.1),0);
	this.rightFoot.footBody.SetPositionAndAngle(new b2Vec2(this.initialPosition.x+0.5,this.initialPosition.y+0.2),0);
	this.leftFoot.footBody.SetPositionAndAngle(new b2Vec2(this.initialPosition.x-0.5,this.initialPosition.y+0.2),0);
	
	this.mainPart.mainBody.SetActive(true);
	this.middlePart.middleBody.SetActive(true);
	this.rightFoot.footBody.SetActive(true);
	this.leftFoot.footBody.SetActive(true);
	
	this.timeOut = this.timeBeforeFirstJump;
};

// instantiates a new creature that is a copy of the original 
Creature.prototype.clone = function(idOfClone)
{
	var newCreature = new Creature(idOfClone);
	newCreature.dna = this.dna.clone();
	newCreature.initialize(
							this.initialPosition,
							this.timeBeforeFirstJump,
							this.jumpingFootSpeed,
							this.stdLegForce,
							this.stdFootSpeed
						  );
	return newCreature;
};

// mate the current creature with the one suplied. Returns the creature itself
Creature.prototype.mate = function(otherCreature)
{
	this.dna = this.dna.crossover(otherCreature.dna);
	return this;
};

// calls the mutation method on the creature's dna
Creature.prototype.mutateDna = function(chanceOfMutation, amountOfMutation)
{
	this.dna.mutate(chanceOfMutation, amountOfMutation);
};

// when another creature is activated, this method should be called to put the current one to rest
Creature.prototype.rest = function()
{
	//var restPosition = new b2Vec2((0.58 + (1.0815 * this.id)), 0.5);
	var restPosition = new b2Vec2(-100, -100);
	
	this.mainPart.mainBody.SetActive(false);
	this.middlePart.middleBody.SetActive(false);
	this.rightFoot.footBody.SetActive(false);
	this.leftFoot.footBody.SetActive(false);
	
	this.mainPart.mainBody.SetPositionAndAngle(restPosition, 0);
	this.middlePart.middleBody.SetPositionAndAngle(restPosition, 0);
	this.rightFoot.footBody.SetPositionAndAngle(restPosition, 0);
	this.leftFoot.footBody.SetPositionAndAngle(restPosition, 0);
};

// destroy all the parts of the creature's body
Creature.prototype.destroyBody = function()
{
	world.DestroyBody(this.mainPart.mainBody);
	world.DestroyBody(this.middlePart.middleBody);
	world.DestroyBody(this.rightFoot.footBody);
	world.DestroyBody(this.leftFoot.footBody);	
}

// uses the creature's properties to draw it
Creature.prototype.render = function(msdelta)
{	
	var body;
	var pos;
	var fix;
	var fixturePosition;
	var x;
	var y;
	var r;
	var vertices;
	var width;
	var height;
	
	body = this.mainPart.mainBody;
	pos = body.GetPosition();
	fix = this.mainPart.bellyFixture;
	fixturePosition = fix.GetShape().GetLocalPosition();
	x = (pos.x + fixturePosition.x) * worldScale + worldX;
	y = (pos.y + fixturePosition.y) * worldScale + worldY;
	r = fix.GetShape().GetRadius() * worldScale;	
		
	context.save();
	context.translate(x, y);
	context.rotate(body.GetAngle());
	context.drawImage(cTop, fixturePosition.x/worldScale - (r + 2),fixturePosition.y/worldScale - (r + 2) + 3, (r * 2) + 4, (r * 2) + 4);
	context.restore();
	
	body = this.middlePart.middleBody;
	pos = body.GetPosition();
	fix = this.middlePart.middleFixture;
	x = (pos.x + fixturePosition.x) * worldScale + worldX;
	y = (pos.y + fixturePosition.y) * worldScale + worldY;
	
	vertices = body.GetFixtureList().GetShape().GetVertices();
	width = (vertices[1].x - vertices[0].x) * worldScale; 
	height = (vertices[2].y - vertices[0].y) * worldScale;	

	context.save();
	context.translate(x, y);
	context.rotate(body.GetAngle());
	context.drawImage(cBottom, vertices[0].x - (width / 2) - 2, vertices[0].y - (height / 2) - 2, width + 6, height + 6);
	context.restore();
	
	body = this.leftFoot.footBody;
	pos = body.GetPosition();
	fix = this.leftFoot.footFixture;
	fixturePosition = fix.GetShape().GetLocalPosition();
	x = (pos.x + fixturePosition.x) * worldScale + worldX;
	y = (pos.y + fixturePosition.y) * worldScale + worldY;
	r = fix.GetShape().GetRadius() * worldScale;	
		
	context.save();
	context.translate(x, y);
	context.rotate(body.GetAngle());
	context.drawImage(cLFoot, fixturePosition.x/worldScale - (r + 2),fixturePosition.y/worldScale - (r + 2), (r * 2) + 4, (r * 2) + 4);
	context.restore();

	body = this.rightFoot.footBody;
	pos = body.GetPosition();
	fix = this.rightFoot.footFixture;
	fixturePosition = fix.GetShape().GetLocalPosition();
	x = (pos.x + fixturePosition.x) * worldScale + worldX;
	y = (pos.y + fixturePosition.y) * worldScale + worldY;
	r = fix.GetShape().GetRadius() * worldScale;	
		
	context.save();
	context.translate(x, y);
	context.rotate(body.GetAngle());
	context.drawImage(cRFoot, fixturePosition.x/worldScale - (r + 2),fixturePosition.y/worldScale - (r + 2), (r * 2) + 4, (r * 2) + 4);
	context.restore();

	context.save();
	context.translate(pos.x * worldScale, pos.y * worldScale);
	context.rotate(this.middlePart.middleBody.GetAngle());	
	context.translate(-(pos.x * worldScale), -(pos.y * worldScale));
		
	context.fillStyle = "white";
	context.font = "12px Arial";
	//context.fillText(this.id + 1, pos.x * worldScale - 4 , 10 + pos.y * worldScale);
	context.restore();
	
};
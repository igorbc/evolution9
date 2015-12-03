// a structure used to facilitate the handling of creature's parameters

function CreaturesParameters()
{
	this.stdLegForce = 0.5;
	this.stdFootSpeed = 2;
	this.jumpingFootSpeed = 20;
	this.stdJumpDuration = 10;
	this.timeBeforeFirstJump = 60;
	
	// dna parameters
	this.quantityOfJumps = 2;
	this.maxInitImpulse = 35
	this.minInitImpulse = 20;
	this.minScale = 0.7;
	this.maxScaleVariation = 0.5;
	this.minDuration = 3;
	this.timeOut = 120;
	
	// dna manipulation's parameters
	this.chanceOfMutation = 1/(this.quantityOfJumps);
	this.amountOfMutation = 0.2;
	
	this.initialPosition = new b2Vec2(5, 5.75);
} 
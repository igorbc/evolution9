// definition of an enumeration classifying all the diferent kinds of physical objects in the game
var ENTITY_TYPE = {
	"CreatureMain": 0,
	"CreatureMiddle": 1,
	"RFoot": 2,
	"LFoot": 3,
	"Goal": 4,
	"BoxGround": 5,
	"PolygonGround": 6,
	"Brick": 7
	}

// definition of a prototype to be inherited by all physical objects in the game
// by doing this the contact listenet (defined in gameScript.js) can now everithing about the objects colliding
function GameEntity()
{
	this.entityType;
}

// checks if any entity is a creature
GameEntity.prototype.isCreature = function()
{
	return this.entityType == ENTITY_TYPE.LFoot ||
		   this.entityType == ENTITY_TYPE.RFoot ||
		   this.entityType == ENTITY_TYPE.CreatureMiddle ||
		   this.entityType == ENTITY_TYPE.CreatureMain;
}

// checks if the entity is ground, wall of platform
GameEntity.prototype.isGround = function()
{
	return this.entityType == ENTITY_TYPE.GroundPolygon ||		   
		   this.entityType == ENTITY_TYPE.GroundBox;
}

// checks if the entity is a creature's foot
GameEntity.prototype.isFoot = function()
{
	return this.entityType == ENTITY_TYPE.RFoot ||		   
		   this.entityType == ENTITY_TYPE.LFoot;
}
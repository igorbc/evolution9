 
 // general definitions
 
 var   b2Vec2 = Box2D.Common.Math.b2Vec2
	,  b2AABB = Box2D.Collision.b2AABB
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
	,   b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
	,	b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
	,   b2WorldManifold = Box2D.Collision.b2WorldManifold
	;
var DEGTORAD = 0.0174532925199432957;
var RADTODEG = 57.295779513082320876;
	
function stopBody(body)
{
	//body.SetLinearDamping(0);
	//body.SetAngularDamping(0);
	body.SetAngularVelocity(0);
	body.SetLinearVelocity(new b2Vec2(0,0));
}	
	
// The next two functions are from examples on the Mozilla Developer Center
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
/**
 * Returns a random number between min and max
 */
function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}
 
/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function writeToCanvas(text, x, y)
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.fillStyle = "#005500";
	context.font = "13px Arial";
	context.fillText(text, x, y);
}
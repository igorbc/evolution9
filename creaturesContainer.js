// the amount of creatures to chose from in the game
var amountOfCreatures = 9;

// this prototype represents the top bar containing all the icons with the creatures' numbers
//and is also used as a container to the creatures themselves
function CreaturesContainer () {
	this.x = canvas.width * 0.001;
	this.y = canvas.height * 0.001;
	this.w = canvas.width * 0.845;
	this.h = canvas.height * 0.12;
	
	// the amount of creatures created on each generation
	this.amountOfCreatures = amountOfCreatures;

	// variable that will store the index of the creature being currently simulated
	this.activeCreature = -1;
	
	this.creatures = new Array();
	this.selectableIcons = new Array();
} 

CreaturesContainer.prototype.populateWithNewCreatures = function(creaturesParameters)
{	
	var cp = creaturesParameters;
	for(var i = 0; i < this.amountOfCreatures; i++)
	{
		var creature = new Creature(i);
		
		creature.initializeDna(
								cp.quantityOfJumps,
								cp.minInitImpulse,
								cp.maxInitImpulse, 
								cp.minDuration,
								cp.timeOut,
								cp.minScale,
								cp.maxScaleVariation
							  );
		
		creature.initialize(
								cp.initialPosition,
								cp.timeBeforeFirstJump,
								cp.jumpingFootSpeed,
								cp.stdLegForce,
								cp.stdFootSpeed
						   );
		creature.createBody();
		creature.isActive = false;		
		creature.rest();
		this.creatures[i] = creature;
	}
}

CreaturesContainer.prototype.destroyAllCreatures = function()
{	
	for(var i = 0; i < this.amountOfCreatures; i++)
	{
		this.creatures[i].destroyBody();
	}
}

CreaturesContainer.prototype.createSelectableIcons = function()
{
	for(var i=0; i < this.amountOfCreatures; i++)
	{
		this.selectableIcons[i] = new SelectableIcon(this.creatures[i]);
	}
}

CreaturesContainer.prototype.setActiveCreature = function(index) 
{	
	if(this.creatures[this.activeCreature] != undefined)
	{
		
		this.creatures[this.activeCreature].isActive = false;
		this.selectableIcons[this.activeCreature].deactivate();
	}
	
	this.activeCreature = index;
	this.creatures[this.activeCreature].isActive = true;
	this.creatures[this.activeCreature].prepareToStart();
	this.selectableIcons[this.activeCreature].activate();
}

CreaturesContainer.prototype.getActiveCreature = function() 
{
	return this.creatures[this.activeCreature];	
}

CreaturesContainer.prototype.createNextGeneration = function(allSelected, chanceOfMutation, amountOfMutation) {
	var amountSelected = allSelected.length;
	var newCreatures = new Array();
	
	/*
	console.debug("amount selected: " + amountSelected + 
				" chance of mutation: " + chanceOfMutation + 
				" amount of mutation: " + amountOfMutation);
	//*/
	for(var i = 0; i < this.amountOfCreatures; i++)
	{
		var selected = allSelected[i % amountSelected];
		
		newCreatures[i] = this.creatures[selected.id1].clone(i);	
		
		
		if(selected.hasCouple())
		{
			newCreatures[i].mate(this.creatures[selected.id2]);
			newCreatures[i].mutateDna(chanceOfMutation/2, amountOfMutation/2); 
		}
		else
		{
			//console.debug("mutating creature " + i);
			newCreatures[i].mutateDna(chanceOfMutation, amountOfMutation);
		} 
		
		this.creatures[i].destroyBody();
		newCreatures[i].createBody();
		newCreatures[i].rest();
	}
	
	this.creatures = newCreatures;
	
	this.setActiveCreature(0);
}

// draws the container and its icons
CreaturesContainer.prototype.render = function(context) {
	//draw the panel
	context.fillStyle="rgba(200,200,200, 0.7)";
	context.fillRect(this.x, this.y, this.w, this.h);
	
	this.renderSelectableIcons(context);
}

CreaturesContainer.prototype.renderSelectableIcons = function(context)
{
	for(var i = 0; i < this.amountOfCreatures; i++)
	{
		this.selectableIcons[i].render(context);
	}
}

// this prototype represents the icons representing each creature
function SelectableIcon(creature) {
	this.index = creature.id;
	
	this.space = 35;
	
	this.active = false;
	this.justChangedActivationState = false;
	
	this.maxScale = 1.5;
	this.defaultScale = 1.0;
	this.scale = this.defaultScale;
	this.time = 0;

	this.w = 40;
	this.h = 30;

	this.x = canvas.width * 0.05 + ((this.space + this.w) * this.index);
	this.y = canvas.height * 0.055;

	this.grabbedX;
	this.grabbedY;
	
	this.defaultColor1 = "#ffffdd";
	this.defaultColor2 = "#dddd00";
	this.colorWhenSelected1 = "#ddddff";
	this.colorWhenSelected2 = "#0000ff";
	
	this.colorOnMouseOver = "#ff5555";
	this.colorOnMouseOver = "#dd3333";
	
	this.defaultCaptionColor = "#335511";
	this.captionColorWhenActive = "#335511";
	
	this.color1 = this.defaultColor1;
	this.color2 = this.defaultColor2;
	this.captionColor = this.defaultCaptionColor;
}

SelectableIcon.prototype.isCloseToOriginalPosition = function()
{
    if(Math.abs(this.x - (canvas.width * 0.05 + (this.space + this.w) * this.index)) < 10 && 
       Math.abs(this.y - (canvas.height * 0.055)) < 10)
       return true;
     
     return false; 
}

// function called when the icon, after being dragged, is released
SelectableIcon.prototype.resetPosition = function() 
{
	this.x = canvas.width * 0.05 + ((this.space + this.w) * this.index);
	this.y = canvas.height * 0.055;	
	
	this.grabbedX = undefined;
	this.grabbedY = undefined;
}

SelectableIcon.prototype.deactivate = function()
{
    this.active = false;
	this.color1 = this.defaultColor1;
	this.color2 = this.defaultColor2;
	this.captionColor = this.defaultCaptionColor;
	this.justChangedActivationState = true;
}

SelectableIcon.prototype.activate = function()
{
    this.active = true;
	this.color1 = this.colorWhenSelected1;
	this.color2 = this.colorWhenSelected2;
	this.captionColor = this.captionColorWhenActive;
	this.justChangedActivationState = true; 
}

SelectableIcon.prototype.stepScale = function()
{   
    if(this.active)
    {
        if(this.justChangedActivationState)
        {
            this.justChangedActivationState = false;
            this.time = 0;
        }
        //var change = (this.maxScale - this.defaultScale) * (msdelta/1000);
        //this.scale = ((this.scale + change) <= this.maxScale)? this.scale + change: this.maxScale;
        
        this.scale = easeOutElastic(this.time/1000, this.defaultScale, (this.maxScale - this.defaultScale), 1);
        this.time += msdelta; 
    }
    else
    {
        if(this.justChangedActivationState)
        {
            this.justChangedActivationState = false;
            this.time = 0;
        }
        this.scale = easeOutElastic(this.time/1000, this.maxScale , -(this.maxScale - this.defaultScale), 1);
        this.time += msdelta;
    }

}   

// adapted from http://wpf-animation.googlecode.com/svn/trunk/src/WPF/Animation/PennerDoubleAnimation.cs
/// "t" Current time in seconds.
/// "b" Starting value.
/// "c" Final value.
/// "d" Duration of animation.

function easeOutElastic(t, b, c, d)
{ 
    if ((t /= d) == 1)
        return b + c;

    var p = d * 0.3;
    var s = p / 4;

    return (c * Math.pow(2, -10 * t ) * Math.sin(( t * d - s ) * (2 * Math.PI) / p) + c + b );
}



SelectableIcon.prototype.render = function(context) {
    this.stepScale(msdelta);

	var x = this.x - (this.w/2) * this.scale;
	var y =  this.y - (this.h/2) * this.scale;
	var w = this.w * this.scale;
	var h = this.h * this.scale;
	
	var gradient = context.createRadialGradient(x, y, h*0.4, x, y, h);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
	context.fillStyle = gradient;
	
	context.fillRect(x, y, w, h);
    
    context.strokeStyle = this.captionColor;
    context.lineWidth = 2;
    context.strokeRect(x, y, w, h);

	context.fillStyle = this.captionColor;
	var fontSize = Math.round(12 * this.scale);
	context.font = fontSize + "px Arial";
	context.fillText((this.index + 1), this.x - 4, this.y + 3);
}

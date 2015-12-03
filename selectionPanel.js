// the definition of the panel containing the items representing the creatures selected to be the parents of the next generation

function SelectionPanel () {
	this.x = canvas.width * 0.85;
	this.y = canvas.height * 0.001;
	this.w = canvas.width * 0.149;
	this.h = canvas.height * 0.998;
	this.selected = new Array();
}

SelectionPanel.prototype.render = function(context, bin) {
	//draw the panel
	var gradient = context.createLinearGradient(this.x, 0, this.x + this.w, 0);
    gradient.addColorStop(0, "#77cc77");
    gradient.addColorStop(0.3, "#99ee99");
    gradient.addColorStop(0.7, "#99ee99");
    gradient.addColorStop(1, "#77cc77");
	context.fillStyle=gradient;
	context.fillRect(this.x, this.y, this.w, this.h);
	
	//draw the panel title
	context.fillStyle="#006600";
	context.font = "20px Arial";
	context.fillText("Selected", this.x + 20, this.y + 28);
	
	//draw bin
	bin.render(context);
	
	//draw the selected items
	for(var i = 0; i < this.selected.length; i++) {
		this.selected[i].render(context, i);		
	}
}

SelectionPanel.prototype.addSelected = function(creature, index) {
	if(index == undefined)
		this.selected.push(new SelectedItem(creature));
	else {
		this.selected[index].addSecondCreature(creature);
	}
}
 
SelectionPanel.prototype.removeSelected = function(index) {
	this.selected.splice(index, 1);
}

SelectionPanel.prototype.removeAllSelected = function() {
	this.selected = new Array();
}

// the definition a selected item
function SelectedItem(creature) {
	this.dna1 = creature.dna.clone();
	this.id1 = creature.id;
	
	this.dna2;
	this.id2;
	
	this.scale = 1.0;
	
	this.resetPosition();
	this.space = 40;
	
	this.w = 40;
	this.h = 30;
	
	this.grabbedX;
	this.grabbedY;
	
    this.defaultColor1 = "#ffffdd";
    this.defaultColor2 = "#dddd00";
    this.colorWhenSelected1 = "#6666ff";
    this.colorWhenSelected2 = "#111155";
    
    this.colorOnMouseOver = "#ff5555";
    this.colorOnMouseOver = "#dd3333";
    
    this.defaultCaptionColor = "#335511";
    this.captionColorWhenActive = "#335511";
    
    this.color1 = this.defaultColor1;
    this.color2 = this.defaultColor2;
    this.captionColor = this.defaultCaptionColor;
}

SelectedItem.prototype.hasCouple = function() 
{
	return (this.id2 != undefined);
}

SelectedItem.prototype.addSecondCreature = function(creature)
{
	if(creature.id != this.id1)
	{
		this.dna2 = creature.dna.clone();
		this.id2 = creature.id;
	}	
}

SelectedItem.prototype.resetPosition = function() 
{
	this.x = canvas.width * 0.925;
	this.y = canvas.height * 0.3;
	this.grabbedX = undefined;
	this.grabbedY = undefined;
}

SelectedItem.prototype.render = function(context, index)
{
    var adjY = this.getAdjustedY(index);
    var x = this.x - (this.w/2) * this.scale;
    var y =  adjY - (this.h/2) * this.scale;
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

	if(this.id2 == undefined)
		context.fillText((this.id1 + 1), x + 16, y + 20);
	else
		context.fillText((this.id1 + 1) + " & " + (this.id2 + 1), x + 8, y + 20);
}

SelectedItem.prototype.getAdjustedY = function(index) {
	return	this.y + (this.space + this.h) * index;
}

var ICON_TYPE = {
	"SelectableIcon": 0, // the icons on the top of the screen representing each creature
	"SelectedIcon": 1, // the icons created on the right column after selection
	"Bin": 2, // the icon used to delete selected items
	"Forward": 3, // the button used to switch to the next creature
	"Backward": 4, // the button used to switch to the previous creature
	"Help": 5,
	"NextGen": 6
	}

var helpIcon = document.getElementById("helpIcon");
var nextGen = document.getElementById("nextGen");

// this is what is returned by the getIconAtMouse function (gameScript.js)
function ClickableIcon(icon, type, id)
{
	this.icon = icon; // a GenericClickableIcon object
	this.type = type; // the type of the icon as defined by ICON_TYPE
	this.id = id; // the id of the icon (dependent on context)
}

// the base prototype of a clickable icon
function GenericClickableIcon()
{
	this.w = 40;
	this.h = 30;

	this.x;
	this.y;
	
	this.mainColor = "#336666";
	this.captionColor = "#ffffff";
	this.caption = "x";
}

// uses the icon's properties to draw it
GenericClickableIcon.prototype.render = function(context) {
    if(this.image != undefined)
    {
        context.drawImage(this.image, this.x, this.y);
    }
    else
    {
    	context.fillStyle = this.mainColor;
    	context.fillRect(this.x, this.y, this.w, this.h);
    	context.fillStyle = "#222222";
    	context.lineWidth = 2;
    	context.strokeRect(this.x , this.y, this.w, this.h);
    	context.fillStyle = this.captionColor;
    	context.font = "12px Arial";
    	context.fillText(this.caption, this.x + 17, this.y + 23);
    }
}

// the definition of the buttom used to switch to the next creature
function NextButton()
{
	this.caption = ">";
	
	this.x = canvas.width * 0.77;
	this.y = canvas.height * 0.15;
}
NextButton.prototype = new GenericClickableIcon();

// the definition of the buttom used to switch to the previous creature
function PreviousButton()
{
	this.caption = "<";
	
	this.x = canvas.width * 0.7;
	this.y = canvas.height * 0.15;
}
PreviousButton.prototype = new GenericClickableIcon();

// the definition of the bin icon
function Bin()
{
	this.caption = " BIN";
	
	this.x = canvas.width * 0.88;
	this.y = canvas.height * 0.8;
	this.w = this.w * 1.5;
	this.h = this.h * 1.5;
	this.mainColor = "#888888";
}
Bin.prototype = new GenericClickableIcon();

function HelpButton()
{
    this.image = helpIcon;
    
    this.x = canvas.width * 0.02;
    this.y = canvas.height * 0.13;
    this.w = this.w * 1.5;
    this.h = this.h * 1.5;
}
HelpButton.prototype = new GenericClickableIcon();

function NextGenerationButton()
{
    this.image = nextGen;
    
    this.x = canvas.width * 0.865;
    this.y = canvas.height * 0.13;
    this.w = this.w * 1.5;
    this.h = this.h * 1.5;
}
NextGenerationButton.prototype = new GenericClickableIcon();

// stores the information needed to perform a jump
function JumpInfo(totalImpulse, rightInclination, duration, timeOut)
{
	this.totalImpulse = totalImpulse;
	this.rightInclination = rightInclination;
	this.duration = duration;
	this.timeOut = timeOut;
}

JumpInfo.prototype.clone = function()
{
	var newJumpInfo = new JumpInfo(this.totalImpulse, this.rightInclination, this.duration, this.timeOut);
	return newJumpInfo;
};

// the Dna definition
function Dna ()
{
	this.quantityOfJumps;
    this.jumps = new Array();
    this.scale;
    	
	this.minInitImpulse;
	this.maxInitImpulse;
	this.minDuration;
	this.timeOut;
	this.maxScaleVariation;
}

Dna.prototype.initialize = function(quantityOfJumps, minInitImpulse, maxInitImpulse, minDuration, timeOut, minScale, maxScaleVariation)
{
	this.quantityOfJumps = quantityOfJumps;	
	
	this.minInitImpulse = minInitImpulse;
	this.maxInitImpulse = maxInitImpulse;
	this.minDuration = minDuration;
	this.timeOut = timeOut;
	
	this.maxScaleVariation = maxScaleVariation;
	
	// populates the jumps array. The total impulses and inclination will be random
 	for (var i = 0; i < this.quantityOfJumps; i++)
	{ 
		this.jumps[i] = new JumpInfo(
							getRandomArbitary(this.minInitImpulse, this.maxInitImpulse),
							Math.random(),
							this.minDuration,
							this.timeOut
							);
	}
	
	this.scale = minScale + (this.maxScaleVariation * ((Math.random() + Math.random() + Math.random() + Math.random())/4));
}

// uses a one-point crossover algorithm to mix the current dna with the given dna
Dna.prototype.crossover = function(pair){
		
		var crossoverPoint = getRandomInt(0, this.quantityOfJumps - 2);
		
		//console.debug(" ");
		//console.debug("mating this and pair");
		//console.debug("crossover: " + crossoverPoint);
		
		var newDna = new Dna();
		newDna.quantityOfJumps = this.quantityOfJumps;
		
		newDna.minInitImpulse = this.minInitImpulse;
		newDna.maxInitImpulse = this.maxInitImpulse;
		newDna.minDuration = this.minDuration;
		newDna.timeOut = this.timeOut;
		newDna.maxScaleVariation = this.maxScaleVariation;
		
		//console.debug("quantity of jumps of this: " + this.quantityOfJumps);
		//console.debug("quantity of jumps of newDna: " + newDna.quantityOfJumps);
		
		var randomStart = Math.random();
		if(randomStart <= 0.5) // if true will start by copying from the pair
		{
			//console.debug("starting with pair because " + randomStart + " is <= 0.5");	
			newDna.scale = pair.scale;
			
			//console.debug("pair. newDna.scale == " + newDna.scale + " == " + pair.scale + " == pair.scale");
			
			for (var i = 0; i < this.quantityOfJumps; i++)
				if(i <= crossoverPoint)
				{
					newDna.jumps[i] = pair.jumps[i].clone();
					//console.debug("pair. newDna.jumps[i].totalImpulse == " + newDna.jumps[i].totalImpulse + " == " + pair.jumps[i].totalImpulse + " == pair.jumps[i].totalImpulse");
				}
				else
				{
					newDna.jumps[i] = this.jumps[i].clone();
					//console.debug("this. newDna.jumps[i].totalImpulse == " + newDna.jumps[i].totalImpulse + " == " + this.jumps[i].totalImpulse + " == this.jumps[i].totalImpulse");
				}
		}
		else // will start by copying from this
		{
			//console.debug("starting with this because " + randomStart + " is NOT <= 0.5");	
			newDna.scale = this.scale;
			
			//console.debug("this. newDna.scale == " + newDna.scale + " == " + this.scale + " == this.scale");
			
			for (var i = 0; i < this.quantityOfJumps; i++) 
				if(i <= crossoverPoint)
				{
					newDna.jumps[i] = this.jumps[i].clone();
					//console.debug("this. newDna.jumps[i].totalImpulse == " + newDna.jumps[i].totalImpulse + " == " + this.jumps[i].totalImpulse + " == this.jumps[i].totalImpulse");
				}
				else
				{
					newDna.jumps[i] = pair.jumps[i].clone();
					//console.debug("pair. newDna.jumps[i].totalImpulse == " + newDna.jumps[i].totalImpulse + " == " + pair.jumps[i].totalImpulse + " == pair.jumps[i].totalImpulse");
				}
		}
		return newDna;
	
};

Dna.prototype.mutate = function(chance, amount){
	
	for (var i = 0; i < this.quantityOfJumps; i++)
	{  
		if(Math.random() <= chance)
		{
			var maxImpulseVariation =  (this.maxInitImpulse - this.minInitImpulse);
			this.jumps[i].totalImpulse += (Math.random() * amount * maxImpulseVariation * 2) - (amount * maxImpulseVariation) ;
			//console.debug("impulse of jump " + i + " mutated");
		}
		if(Math.random() <= chance)
		{
			this.jumps[i].rightInclination += (Math.random() * amount * 2) - amount;
			//console.debug("inclination of jump " + i + " mutated");
		}		
	}
	
	if(Math.random() <= chance)
	{
		//console.debug("scale before mutation : " + this.scale);
		this.scale += (-(amount * (this.maxScaleVariation) / 2) + Math.random() * amount * this.maxScaleVariation);
		//console.debug("scale mutated : " + this.scale + " (maxScaleVariation: " + this.maxScaleVariation + ")");
	}
	
};

Dna.prototype.clone = function()
{
	newDna = new Dna();
	
	newDna.quantityOfJumps = this.quantityOfJumps;	
	
	newDna.minInitImpulse = this.minInitImpulse;
	newDna.maxInitImpulse = this.maxInitImpulse;
	newDna.minDuration = this.minDuration;
	newDna.timeOut = this.timeOut;
	newDna.maxScaleVariation = this.maxScaleVariation;
	
	for(var i = 0; i < this.quantityOfJumps; i++)
	{
		newDna.jumps[i] = this.jumps[i].clone();
	}
	newDna.scale = this.scale;
	return newDna;
};

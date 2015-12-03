/**
 * @authorIgor Correa
 * dust particle effect
 * inspired by http://thecodeplayer.com/walkthrough/html5-canvas-experiment-a-cool-flame-fire-effect-using-particles
 */


function Particle(initialX, initialY)
{
	//speed, life, location, life, colors
	//speed.x range = -0.2 to 0.2 
	//speed.y range = -1.5 to -0.5 to make it move upwards
	this.speed = {x: -0.2+Math.random()*0.4, y: -0.7 + Math.random() * 0.4};
	
	this.beginning = false;
	
	//Now the flame follows the mouse coordinates
	this.location = {x: initialX, y: initialY}; 
	this.worldX = worldX;
	this.worldY = worldY;
	
	//radius range = 3-5
	this.radius = 3+Math.random()*2;
	
	//life range = 20-30
	this.life = 20+Math.random()*10;
	
	this.remaining_life = this.life;
	
	//colors
	var howLight = 200 + Math.random() * 50;
	this.r = Math.round(howLight);
	this.g = Math.round(howLight);
	this.b = Math.round(howLight * 0.8);
}
	

function ParticleEmitter()
{
	this.particles = [];
	this.emitting = false;
	this.particleAmount = 30;
	this.x;
	this.y;
	
	
	this.maxTotalParticles = 20;
	this.totalParticlesCounter = this.maxTotalParticles;
	//*
    for(var i = 0; i < this.particleAmount; i++)
    {
        this.particles.push(new Particle(0, 0));
    }
    
    this.beginning = true;
    //*/
}

ParticleEmitter.prototype.start = function(x, y)
{
	this.emitting = true;
	
	this.x = x;
	this.y = y;
	
	this.totalParticlesCounter = this.maxTotalParticles;
	//*

    //*/
};

ParticleEmitter.prototype.stop = function()
{
	this.emitting = false;
	this.beginning = false;
}

ParticleEmitter.prototype.update = function(x, y)
{
    this.x = x;
    this.y = y;
    if(this.totalParticlesCounter <= 0)
    {
        this.stop();
        return;
    }
    /*    
    for(var i = 0; i < this.particles.length; i++)
    {
        var p = this.particles[i];
        
        //p.speed.x+= -0.1 + Math.random()*0.2;
        
        //lets move the particles
        p.remaining_life--;
        p.radius+=0.3;
        p.location.x += p.speed.x;
        p.location.y += p.speed.y;
        
        //regenerate particles
        if(this.emitting && (p.remaining_life < 0 || p.radius <= 0))
        {
            //a brand new particle replacing the dead one
            this.particles[i] = new Particle(x, y);
        }
    }
    //*/
}
	
ParticleEmitter.prototype.draw  = function()
{
    if(this.beginning && this.emitting)
    {
       var i = 0;
       while(i < 2 * this.particleAmount)
       {
               
           for(var j = 0; j < this.particles.length; j++)
           {
               var p = this.particles[j];
               p.remaining_life--;
               //p.radius+=0.5;
               //p.location.x += p.speed.x;// * (msdelta/1000);
               //p.location.y += p.speed.y;// * (msdelta/1000);
           
               if(this.emitting && (p.remaining_life < 0 || p.radius <= 0))
               {
                    //a brand new particle replacing the dead one
                    this.particles[i] = new Particle(this.x, this.y);
                    i++;
               }
           }
       }
       this.beginning = false;
    }

	//Painting the canvas black
	//Time for lighting magic
	//In the next frame the background is painted normally without blending to the 
	//previous frame

	context.save();	
	
	for(var i = 0; i < this.particles.length; i++)
	{
		var p = this.particles[i];
		context.beginPath();
		//changing opacity according to the life.
		//opacity goes to 0 at the end of life of a particle
		p.opacity = Math.round(p.remaining_life/p.life*100)/100
		//a gradient instead of white fill

//*		
        var gradient = context.createRadialGradient(p.location.x + worldX - p.worldX,
													p.location.y + worldY - p.worldY,
													0,
													p.location.x + worldX - p.worldX,
													p.location.y + worldY - p.worldY,
													p.radius);
													
		gradient.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
		gradient.addColorStop(0.5, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
		gradient.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");
	//*/
		context.fillStyle =  gradient;
		context.arc(p.location.x + worldX - p.worldX,
					p.location.y + worldY - p.worldY,
					p.radius, Math.PI*2, false);
		context.fill();
		
		p.remaining_life--;
        p.radius+=0.2;
        p.location.x += p.speed.x;
        p.location.y += p.speed.y;
        
        //regenerate particles
        if(this.emitting && (p.remaining_life < 0 || p.radius <= 0))
        {
            //a brand new particle replacing the dead one
            this.particles[i] = new Particle(this.x, this.y);
            this.totalParticlesCounter--;
        }
		
	}
	
	context.restore();
}

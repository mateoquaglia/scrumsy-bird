
var pipeHoleSize =100; ////////////////////////////////////////////////////////////////////////////////////////////
game.pipeVelocity = -5; 
if (typeof game.pipeEntities === 'undefined') {  //lo hago porque cuando inicia strategy espera modificar pipeEntities antes de que pipeEntities se defina 
    game.pipeEntities = [];                      //esta manera no se sobreescriba la variable y no se duplique pipeEntities
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

game.BirdEntity = me.Entity.extend({                            
    init: function(x, y) {
        var settings = {};
        settings.image = 'clumsy';
       
        settings.width = 85;
        settings.height = 60;
        this.addObserver(pipeSpeedObserver);
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0.2;
        this.maxAngleRotation = Number.prototype.degToRad(-30);
        this.maxAngleRotationDown = Number.prototype.degToRad(35);
        this.renderable.addAnimation("flying", [0, 1, 2]);
        this.renderable.addAnimation("idle", [0]);
        this.renderable.setCurrentAnimation("flying");
        //this.renderable.anchorPoint = new me.Vector2d(0.1, 0.5);
        this.body.removeShapeAt(0);
        this.body.addShape(new me.Ellipse(5, 5, 71, 51));

        // a tween object for the flying physic effect
        this.flyTween = new me.Tween(this.pos);
        this.flyTween.easing(me.Tween.Easing.Exponential.InOut);

        this.currentAngle = 0;
        this.angleTween = new me.Tween(this);
        this.angleTween.easing(me.Tween.Easing.Exponential.InOut);

        // end animation tween
        this.endTween = null;

        // collision shape
        this.collided = false;

        this.gravityForce = 0.2;
    },

    update: function(dt) {
        var that = this;
        this.pos.x = 60;
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.renderable.currentTransform.identity();
        if (me.input.isKeyPressed('fly')) {
            me.audio.play('wing');
            this.gravityForce = 0.2;
            var currentPos = this.pos.y;

            this.angleTween.stop();
            this.flyTween.stop();


            this.flyTween.to({y: currentPos - 72}, 50);
            this.flyTween.start();

            this.angleTween.to({currentAngle: that.maxAngleRotation}, 50).onComplete(function(angle) {
                that.renderable.currentTransform.rotate(that.maxAngleRotation);
            })
            this.angleTween.start();

        } else {
            this.gravityForce += 0.2;
            this.pos.y += me.timer.tick * this.gravityForce;
            this.currentAngle += Number.prototype.degToRad(3);
            if (this.currentAngle >= this.maxAngleRotationDown) {
                this.renderable.currentTransform.identity();
                this.currentAngle = this.maxAngleRotationDown;
            }
        }
        this.renderable.currentTransform.rotate(this.currentAngle);
        me.Rect.prototype.updateBounds.apply(this);

        var hitSky = -80; // bird height + 20px
        if (this.pos.y <= hitSky || this.collided) {
            game.data.start = false;
            me.audio.play("lose");
            this.endAnimation();
            return false;
        }
        me.collision.check(this);
        return true;
    },

    onCollision: function(response) {
        var obj = response.b;
        if (obj.type === 'pipe' || obj.type === 'ground') {
            me.device.vibrate(500); 
            this.collided = true;
            
        }
        // remove the hit box
        if (obj.type === 'hit') {
            me.game.world.removeChildNow(obj);
            game.data.steps++;
            me.audio.play('hit');
        }/////////////////////////////////////////////////////////////////////////////////////
        if (obj.type === 'mariposaRoja') {
            var strategy = new DecreaseSpeedStrategy();
            strategy.changeSpeed(game.pipeEntities); 
            this.renderable.image = me.loader.getImage('clumsyRojo'); 
            this.notifyObservers(game.pipeEntities);
        
        }
        if (obj.type === 'mariposaAzul') {
            var strategy = new IncreaseSpeedStrategy();
            strategy.changeSpeed(game.pipeEntities); 
            this.renderable.image = me.loader.getImage('clumsyAzul'); 
            this.notifyObservers(game.pipeEntities);
        
        }
        if (obj.type === 'mariposaBlanca') {
            var strategy = new ResetSpeedStrategy();
            strategy.changeSpeed(game.pipeEntities); 
            this.renderable.image = me.loader.getImage('clumsy'); 
            this.notifyObservers(game.pipeEntities);
         
        
        }
        ////////////////////////////////////////////////////////////////////////////////
    },

    endAnimation: function() {
        me.game.viewport.fadeOut("#fff", 100);
        var currentPos = this.pos.y;
        this.endTween = new me.Tween(this.pos);
        this.endTween.easing(me.Tween.Easing.Exponential.InOut);

        this.flyTween.stop();
        this.renderable.currentTransform.identity();
        this.renderable.currentTransform.rotate(Number.prototype.degToRad(90));
        var finalPos = me.game.viewport.height - this.renderable.width/2 - 96;
        this.endTween
            .to({y: currentPos}, 1000)
            .to({y: finalPos}, 1000)
            .onComplete(function() {
                me.state.change(me.state.GAME_OVER);
            });
        this.endTween.start();
    }

});


game.createBirdEntity = function(x, y) {
    return new game.BirdEntity(x, y);
};


game.PipeEntity = me.Entity.extend({
    init: function(x, y) {
        
        var settings = {};
        settings.image = this.image = me.loader.getImage('pipe');
        settings.width = 148;
        settings.height= 1664;
        settings.framewidth = 148;
        settings.frameheight = 1664;

        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(game.pipeVelocity, 0);
        this.type = 'pipe';
////////////////////////////////////////////////////////
        game.pipeEntities.push(this);
////////////////////////////////////////////////////////
    },
////////////////////////////////////////////////////////
    onDestroyEvent: function() {
        var index = game.pipeEntities.indexOf(this);
        if (index !== -1) {
            game.pipeEntities.splice(index, 1);
        }
    },
    ////////////////////////////////////////////////////////
    update: function(dt) {
        // mechanics
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.image.width) {
            me.game.world.removeChild(this);
        }
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    },

});

game.PipeGenerator = me.Renderable.extend({
    init: function() {
        this._super(me.Renderable, 'init', [0, me.game.viewport.width, me.game.viewport.height, 92]);
        this.alwaysUpdate = true;
        this.generate = 0;
        this.pipeFrequency = 100;
        this.pipeHoleSize = 1260;
        this.posX = me.game.viewport.width;
    },

    update: function(dt) {
        if (this.generate++ % this.pipeFrequency == 0) {
            var posY = Number.prototype.random(
                    me.video.renderer.getHeight() - 100,
                    200
            );
            var posY2 = posY - me.game.viewport.height - this.pipeHoleSize;
            var pipe1 = new me.pool.pull('pipe', this.posX, posY);
            var pipe2 = new me.pool.pull('pipe', this.posX, posY2);
            var hitPos = posY - 100;
            var hit = new me.pool.pull("hit", this.posX, hitPos);
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            var nonCollidingEntity = new game.NonCollidingEntity(this.posX, posY + pipeHoleSize / 2); // ,
            var nonCollidingEntity1 = new game.NonCollidingEntity1(this.posX, posY - pipeHoleSize*1.4  ); 
            var nonCollidingEntityReset = new game.NonCollidingEntityReset(this.posX, posY - pipeHoleSize  );// ,
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            pipe1.renderable.currentTransform.scaleY(-1);
            me.game.world.addChild(pipe1, 10);
            me.game.world.addChild(pipe2, 10);
            me.game.world.addChild(hit, 11);
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            me.game.world.addChild(nonCollidingEntity, 10);
            me.game.world.addChild(nonCollidingEntity1, 10);
            me.game.world.addChild(nonCollidingEntityReset, 10);
            /////////////////////////////////////////////////////////////////////////////////////////////////////
        }
        this._super(me.Entity, "update", [dt]);
    },

});

game.HitEntity = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = this.image = me.loader.getImage('hit');
        settings.width = 148;
        settings.height= 60;
        settings.framewidth = 148;
        settings.frameheight = 60;

        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.updateTime = false;
        this.renderable.alpha = 0;
        this.body.accel.set(-5, 0);
        this.body.removeShapeAt(0);
        this.body.addShape(new me.Rect(0, 0, settings.width - 30, settings.height - 30));
        this.type = 'hit';
    },

    update: function(dt) {
        // mechanics
        this.pos.add(this.body.accel);
        if (this.pos.x < -this.image.width) {
            me.game.world.removeChild(this);
        }
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, "update", [dt]);
        return true;
    },

});

game.Ground = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = me.loader.getImage('ground');
        settings.width = 900;
        settings.height= 96;
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(-4, 0);
        this.type = 'ground';
    },

    update: function(dt) {
        // mechanics
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.renderable.width) {
            this.pos.x = me.video.renderer.getWidth() - 10;
        }
        me.Rect.prototype.updateBounds.apply(this);
        return this._super(me.Entity, 'update', [dt]);
    },

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
game.NonCollidingEntity = me.Entity.extend({
    init: function(x, y) {
        var settings = {
            image: "mariposaAzul", 
            width: 480, 
            height: 480,
            framewidth: 480, 
            frameheight: 480, 
        };
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(-850, 0);
        this.type = 'mariposaAzul';
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    },
    update: function(dt) {
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        this.pos.x += this.body.vel.x * dt/1000;
        
        if (this.pos.x + this.width < 0) {
            me.game.world.removeChild(this);
        }
        
        this._super(me.Entity, 'update', [dt]);
        return true;
    },
    onCollision: function(response, other) {
        me.game.world.removeChild(this);
    }
});


game.NonCollidingEntity1 = me.Entity.extend({
    init: function(x, y) {
        var settings = {
            image: "mariposaRoja", 
            width: 480, 
            height: 480,
            framewidth: 480, 
            frameheight: 480, 
        };
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(-550, 0);
        this.type = 'mariposaRoja';
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    },
    update: function(dt) {
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        this.pos.x += this.body.vel.x * dt/1000;
        
        if (this.pos.x + this.width < 0) {
            me.game.world.removeChild(this);
        }
        
        this._super(me.Entity, 'update', [dt]);
        return true;
    },
    onCollision: function(response, other) {
        me.game.world.removeChild(this);
    }
    
});
game.NonCollidingEntityReset = me.Entity.extend({
    init: function(x, y) {
        var settings = {
            image: "mariposaBlanca", 
            width: 480, 
            height: 480,
            framewidth: 480, 
            frameheight: 480, 
        };
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(-350, 0);
        this.type = 'mariposaBlanca';
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    },
    update: function(dt) {
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        this.pos.x += this.body.vel.x * dt/1000;
        
        if (this.pos.x + this.width < 0) {
            me.game.world.removeChild(this);
        }
        
        this._super(me.Entity, 'update', [dt]);
        return true;
    },
    onCollision: function(response, other) {
        me.game.world.removeChild(this);
    }
    
});

var SpeedChangeStrategy = function() {   
    this.changeSpeed = function(pipeEntities) {
        throw new Error("el metodo 'changeSpeed' no esta implementado"); 
    }
}



var DecreaseSpeedStrategy = function() { // Crea una subclase de SpeedChangeStrategy
    SpeedChangeStrategy.call(this); // Llama al constructor de la superclase

    this.changeSpeed = function(pipeEntities) {
        game.pipeVelocity += 3;
        for (var i = 0; i < pipeEntities.length; i++) {         
            pipeEntities[i].body.vel.x = game.pipeVelocity; // Cambia la velocidad de cada tubería
        }
    }
}

var IncreaseSpeedStrategy = function() { // Crea una subclase de SpeedChangeStrategy
    SpeedChangeStrategy.call(this); // Llama al constructor de la superclase

    this.changeSpeed = function(pipeEntities) {
        game.pipeVelocity -= 1;
        for (var i = 0; i < pipeEntities.length; i++) {         
            pipeEntities[i].body.vel.x = game.pipeVelocity; // Cambia la velocidad de cada tubería
        }
    }
}
var ResetSpeedStrategy = function() { // Crea una subclase de SpeedChangeStrategy
    SpeedChangeStrategy.call(this); // Llama al constructor de la superclase

    this.changeSpeed = function(pipeEntities) {
        game.pipeVelocity = -5;
        for (var i = 0; i < pipeEntities.length; i++) {         
            pipeEntities[i].body.vel.x = game.pipeVelocity; // Cambia la velocidad de cada tubería
        }
    }
}
IncreaseSpeedStrategy.prototype = Object.create(SpeedChangeStrategy.prototype);
IncreaseSpeedStrategy.prototype.constructor = IncreaseSpeedStrategy;


// Observer class

var Observer = function() {
    this.update = function() {
        throw new Error("Method 'update' must be implemented.");
    }
}

// Make BirdEntity observable
game.BirdEntity.prototype.observers = [];

game.BirdEntity.prototype.addObserver = function(observer) {
    this.observers.push(observer);
}

game.BirdEntity.prototype.removeObserver = function(observer) {
    var index = this.observers.indexOf(observer);
    if (index > -1) {
        this.observers.splice(index, 1);
    }
}

game.BirdEntity.prototype.notifyObservers = function() {
    for (var i = 0; i < this.observers.length; i++) {
        this.observers[i].update();
    }
}

// Actualizo el método onCollision de BirdEntity
game.BirdEntity.prototype.onCollision = function(response) {
    var obj = response.b;
    if (obj.type === 'pipe' || obj.type === 'ground') {
        me.device.vibrate(500); 
        this.collided = true;
    }
    if (obj.type === 'hit') {
        me.game.world.removeChildNow(obj);
        game.data.steps++;
        me.audio.play('hit');
    }
    if (obj.type === 'mariposaAzul') {
        // Cambia la estrategia a aumentar velocidad
        pipeSpeedObserver.setStrategy(new IncreaseSpeedStrategy()); 
        this.notifyObservers(game.pipeEntities);
    }
    if (obj.type === 'mariposaRoja') {
        // Cambia la estrategia a disminuir velocidad
        pipeSpeedObserver.setStrategy(new DecreaseSpeedStrategy());
        this.notifyObservers(game.pipeEntities);
    }
    if (obj.type === 'mariposaBlanca') {
        // Cambia la estrategia a disminuir velocidad
        pipeSpeedObserver.setStrategy(new ResetSpeedStrategy());
        this.notifyObservers(game.pipeEntities);
    }
}
game.BirdEntity.prototype.notifyObservers = function(pipeEntities) {
    for (var i = 0; i < this.observers.length; i++) {
        this.observers[i].update(pipeEntities);
    }
   
   if(observer.strategy) {
    observer.strategy.changeSpeed(game.pipeEntities);
   }
    
}
// Creo un observer que cambie la velocidad del pipe.
var PipeSpeedObserver = function() {
    this.strategy = null;

    this.setStrategy = function(strategy) {
        this.strategy = strategy;
    }
 this.update = function(pipeEntities) {
        if (this.strategy === null) {
            throw new Error("Estrategia no establecida");
        }
        this.strategy.changeSpeed(pipeEntities);
        console.log('Cambiando la velocidad de pipe entities'); // Agrega este mensaje
    }
   
}       
var observer = new PipeSpeedObserver();
var pipeSpeedObserver = new PipeSpeedObserver();
pipeSpeedObserver.setStrategy(new DecreaseSpeedStrategy()); 
pipeSpeedObserver.setStrategy(new IncreaseSpeedStrategy()); 
game.BirdEntity.prototype.addObserver(pipeSpeedObserver);




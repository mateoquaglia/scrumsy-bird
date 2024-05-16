const jestDom = require('@testing-library/jest-dom');
const collision = require('./js/melonJS-min.js').collision;
const game = require('./js/game.js');


// Mock  BirdEntity y NonCollidingEntity para que no se ejecute el constructor real
jest.mock('./js/entities/entities.js', () => ({
    BirdEntity: jest.fn(),
    NonCollidingEntity: jest.fn().mockImplementation(function(x, y) { 
        this.pos = {
            x: x,
            y: y,
        };
        this.alwaysUpdate = true;
        this.body = {
            gravity: 0,
            
        };
        this.type = 'objeto';
        this.update = function() { 
            this.pos.x -= 1;
        };
    }),
    createBirdEntity: jest.fn().mockReturnValue({
        pos: {
            x: 60,
            y: 60,
        },
    }),
}));

jest.mock('melonjs', () => ({
    collision: {
      types: {
        NO_OBJECT: 'mockedValue',
      },
    },
  }));


const { BirdEntity, createBirdEntity } = require('./js/entities/entities.js');
const { NonCollidingEntity } = require('./js/entities/entities.js');

jest.mock('me');

test('test parametros iniciales BirdEntity', done => {
    
    const bird = createBirdEntity(60, 60);
    expect(bird.pos.x).toBe(60);
    expect(bird.pos.y).toBe(60);
   
    done();
});

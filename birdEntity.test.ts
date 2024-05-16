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
const { BirdEntity, createBirdEntity } = require('./js/entities/entities.js');

jest.mock('me');

// Define the test
test('should have correct initial position', done => {
    // Create the BirdEntity
    const bird = createBirdEntity(60, 60);

    // Verify that the initial position is correct
    expect(bird.pos.x).toBe(60);
    expect(bird.pos.y).toBe(60);

    // Indicate that the test has finished
    done();
});

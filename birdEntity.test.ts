const jestDom = require('@testing-library/jest-dom');
const collision = require('./js/melonJS-min.js').collision;
const game = require('./js/game.js');

// Mock the BirdEntity class in the game module
jest.mock('./js/entities/entities.js', () => ({
    BirdEntity: jest.fn(),
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

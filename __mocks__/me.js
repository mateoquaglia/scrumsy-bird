///////////////////////////////////////////////////////
const mockImage = () => ({
    addEventListener: jest.fn(),
    src: '',
    onload: null,
    onerror: null,
});

const me = {
    game: {
        viewport: {
            fadeOut: jest.fn(),
            height: 500, // adjust as needed
        },
        world: {
            addChild: jest.fn(),
        },
    },
    Tween: {
        Easing: {
            Exponential: {
                InOut: jest.fn(),
            },
        },
    },
    state: {
        GAME_OVER: 'game_over', // adjust as needed
        change: jest.fn(),
    },
    Entity: {
        extend: jest.fn(),
    },
    loader: {
        getImage: jest.fn().mockReturnValue(mockImage()),///////////////////////////////////////////////////
    },
    Renderable: {
        extend: jest.fn(),
    },
};

module.exports = me;
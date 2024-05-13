import '@testing-library/jest-dom';
import { collision } from '../js/melonJS-min.js';
import { NonCollidingEntity } from '../js/entities/entities.js';
//tratar de implementarlo con mocks
describe('NonCollidingEntity tests', () => {
    it('actualizar la pos correctamente', () => {
        
        const entity = new NonCollidingEntity(10, 20);
        expect(entity.pos.x).toBe(10);
        expect(entity.pos.y).toBe(20);
        expect(entity.alwaysUpdate).toBe(true);
        expect(entity.body.gravity).toBe(0);
        expect(entity.type).toBe('objeto');
        expect(entity.body.collisionType).toBe(collision.types.NO_OBJECT);
    });

    it('should update position correctly', () => {
        
        const entity = new NonCollidingEntity(10, 20);
        entity.update(1000); 
        expect(entity.pos.x).toBeLessThan(10);
    });

    
});

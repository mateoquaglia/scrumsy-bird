import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // Ajusta según sea necesario
        errors: ['rate<0.1'],
    },
};

export default function () {
    // Grupo para probar la carga de recursos
    group('Load Resources', function () {
        let res = http.get('https://jsonplaceholder.typicode.com/photos/1');
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time is below 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
        sleep(1);
    });

    // Grupo para simular una acción de inicio de juego
    group('Start Game', function () {
        let res = http.get('https://jsonplaceholder.typicode.com/posts/1');
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time is below 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
        sleep(1);
    });

    // Grupo para simular la interacción del jugador (movimiento del pájaro)
    group('Player Interaction', function () {
        let res = http.post('https://jsonplaceholder.typicode.com/posts', {
            title: 'foo',
            body: 'bar',
            userId: 1,
        });
        check(res, {
            'status is 201': (r) => r.status === 201,
            'response time is below 300ms': (r) => r.timings.duration < 300,
        }) || errorRate.add(1);
        sleep(1);
    });
}

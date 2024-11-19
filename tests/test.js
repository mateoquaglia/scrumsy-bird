import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// Define custom metrics
const errorRate = new Rate('errors');

export let options = {
    stages: [
        { duration: '30s', target: 20 },  // ramp up to 20 users
        { duration: '1m', target: 20 },   // stay at 20 users for 1 minute
        { duration: '30s', target: 0 },   // ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests must complete below 500ms
        errors: ['rate<0.1'],              // error rate should be less than 10%
    },
};

export default function () {
    group('Home Page', function () {
        let res = http.get('https://test-api.example.com');
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time is below 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
        sleep(1);
    });

    group('Login Page', function () {
        let res = http.get('https://test-api.example.com/login');
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time is below 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
        sleep(1);
    });

    group('Submit Form', function () {
        let res = http.post('https://test-api.example.com/form', { name: 'test', email: 'test@example.com' });
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time is below 300ms': (r) => r.timings.duration < 300,
        }) || errorRate.add(1);
        sleep(1);
    });
}

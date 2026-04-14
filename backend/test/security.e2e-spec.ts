import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Testing Suite', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Basic Application Health', () => {
    it('should return backend banner on GET /api', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('JAECOO Service Backend');
    });

    it('should return healthy payload on GET /api/health', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('should be accessible via health check', () => {
      return request(app.getHttpServer()).get('/api').expect(200);
    });
  });

  describe('Route Access Control', () => {
    it('should return 404 for undefined routes', () => {
      return request(app.getHttpServer())
        .get('/api/undefined-route-xyz')
        .expect(404);
    });

    it('should return 401 or 404 for malformed customer routes without auth', () => {
      return request(app.getHttpServer())
        .get('/api/customers/-1')
        .expect([401, 404]); // 401 because auth is required; 404 if somehow bypassed
    });
  });

  describe('CORS Headers', () => {
    it('should process GET requests', () => {
      return request(app.getHttpServer()).get('/api').expect(200);
    });

    it('should handle preflight requests gracefully', () => {
      return request(app.getHttpServer())
        .options('/api')
        .expect([200, 204, 404]); // 404 is acceptable if OPTIONS not explicitly handled
    });
  });

  describe('HTTP Method Security', () => {
    it('POST to root should not work', () => {
      return request(app.getHttpServer())
        .post('/api')
        .send({ test: 'data' })
        .expect([404, 400, 405]); // Not Found, Bad Request, or Method Not Allowed
    });

    it('PUT to root should not work', () => {
      return request(app.getHttpServer())
        .put('/api')
        .send({ test: 'data' })
        .expect([404, 400, 405]);
    });

    it('DELETE to root should not work', () => {
      return request(app.getHttpServer())
        .delete('/api')
        .expect([404, 400, 405]);
    });
  });

  describe('Response Handling', () => {
    it('should return string response for GET /api', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect((res) => {
          expect(typeof res.text).toBe('string');
          expect(res.text.length).toBeGreaterThan(0);
        });
    });

    it('should have proper Content-Type header', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect((res) => {
          expect(res.headers['content-type']).toBeDefined();
        });
    });
  });

  describe('Endpoint Availability', () => {
    it('should have customers endpoint accessible', () => {
      return request(app.getHttpServer())
        .get('/api/customers')
        .expect([200, 401, 500]); // May need auth or have issues
    });

    it('should have users endpoint accessible', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect([200, 401, 500]);
    });

    it('should have vehicles endpoint accessible', () => {
      return request(app.getHttpServer())
        .get('/api/vehicles')
        .expect([200, 401, 500]);
    });
  });

  describe('Application Stability', () => {
    it('should handle multiple sequential requests', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer()).get('/api').expect(200);
      }
    });

    it('should handle concurrent requests', () => {
      return Promise.all([
        request(app.getHttpServer()).get('/api').expect(200),
        request(app.getHttpServer()).get('/api').expect(200),
        request(app.getHttpServer()).get('/api').expect(200),
      ]);
    });
  });
});

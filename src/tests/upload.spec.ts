import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import * as geminiService from '../services/geminiService';
import { registerMeasure } from '../controllers/measureController';

jest.mock('../services/geminiService'); 

const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

app.use(express.json());
app.post('/upload', upload.single('image'), registerMeasure);

describe('registerMeasure', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should return status 409 if measure already exists for the month', async () => {
    jest.spyOn(prisma.measure, 'findFirst').mockResolvedValue({
      measure_datetime: new Date('2024-08-15'),
    } as any);

    const response = await request(app)
      .post('/upload')
      .attach('image', Buffer.from('test'), 'test-image.png')
      .field('measure_type', 'WATER')
      .field('customer_code', '123')
      .field('measure_datetime', '2024-08-15T00:00:00Z');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error_code: 'DOUBLE_REPORT',
      error_description: ['Leitura do mês já realizada'],
    });
  });

  it('should return 200 if measure is registered successfully', async () => {
    jest.spyOn(prisma.measure, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.measure, 'create').mockResolvedValue({
      measure_uuid: '7e7dac2f-80fc-450f-9e0f-d3aaedbfae84',
    } as any);

    (geminiService.uploadImage as jest.Mock).mockResolvedValue({ uri: 'http://example.com/image.png' });
    (geminiService.extractMeasureImage as jest.Mock).mockResolvedValue('123456');

    const response = await request(app)
      .post('/upload')
      .attach('image', Buffer.from('test'), 'test-image.png')
      .field('measure_type', 'WATER')
      .field('customer_code', '123')
      .field('measure_datetime', '2024-07-15T00:00:00Z');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      image_url: 'http://example.com/image.png',
      measure_value: '123456',
      measure_uuid: '7e7dac2f-80fc-450f-9e0f-d3aaedbfae84',
    });
  });
});

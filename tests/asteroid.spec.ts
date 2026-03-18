import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

test.describe('🌌 NASA Asteroid API - Validações de Conexão e Estrutura', () => {

  test('1 - Deve retornar status 200 ao consultar asteroides de hoje', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    console.log('--- 🌌 Relatório de Hoje ---');
    console.log(`Total de asteroides monitorados: ${data.element_count}`);
  });

  test('2 - Deve conter os campos obrigatórios na resposta da API', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    // Valida estrutura raiz
    expect(data).toHaveProperty('element_count');
    expect(data).toHaveProperty('near_earth_objects');
    expect(data).toHaveProperty('links');

    // Valida que element_count é um número positivo
    expect(typeof data.element_count).toBe('number');
    expect(data.element_count).toBeGreaterThanOrEqual(0);

    console.log(`✅ Estrutura da resposta validada com sucesso`);
    console.log(`📦 element_count: ${data.element_count}`);
  });

  test('3 - Deve retornar erro 403 com chave de API inválida', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/feed?api_key=CHAVE_INVALIDA_TESTE`);

    expect(response.status()).toBe(403);
    console.log('✅ API rejeitou corretamente uma chave inválida (403 Forbidden)');
  });

  test('4 - Deve validar campos de cada asteroide individualmente', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    const dates = Object.keys(data.near_earth_objects);
    expect(dates.length).toBeGreaterThan(0);

    const asteroidsToday = data.near_earth_objects[dates[0]];
    expect(asteroidsToday.length).toBeGreaterThan(0);

    // Valida estrutura de cada asteroide
    asteroidsToday.forEach((asteroid: any, index: number) => {
      expect(asteroid, `Asteroide #${index} deve ter 'id'`).toHaveProperty('id');
      expect(asteroid, `Asteroide #${index} deve ter 'name'`).toHaveProperty('name');
      expect(asteroid, `Asteroide #${index} deve ter flag de perigo`).toHaveProperty('is_potentially_hazardous_asteroid');
      expect(asteroid, `Asteroide #${index} deve ter velocidade`).toHaveProperty('close_approach_data');
      expect(asteroid, `Asteroide #${index} deve ter diâmetro estimado`).toHaveProperty('estimated_diameter');

      expect(typeof asteroid.is_potentially_hazardous_asteroid).toBe('boolean');
      expect(Array.isArray(asteroid.close_approach_data)).toBeTruthy();
    });

    console.log(`✅ ${asteroidsToday.length} asteroides validados com sucesso`);
  });

  test('5 - Deve buscar asteroide específico por ID', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    // Primeiro, pega um ID real da lista do feed
    const feedResponse = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const feedData = await feedResponse.json();

    const dates = Object.keys(feedData.near_earth_objects);
    const firstAsteroid = feedData.near_earth_objects[dates[0]][0];
    const asteroidId = firstAsteroid.id;

    // Agora busca esse asteroide diretamente
    const detailResponse = await request.get(`${BASE_URL}/neo/${asteroidId}?api_key=${apiKey}`);

    expect(detailResponse.status()).toBe(200);

    const detail = await detailResponse.json();
    expect(detail.id).toBe(asteroidId);
    expect(detail).toHaveProperty('orbital_data');
    expect(detail).toHaveProperty('close_approach_data');

    console.log(`🔭 Detalhes do asteroide "${detail.name}" (ID: ${asteroidId}) validados com sucesso`);
  });

});
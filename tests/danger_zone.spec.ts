import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

test.describe('☢️ NASA Asteroid API - Zona de Perigo', () => {

  test('6 - Deve classificar corretamente asteroides perigosos e seguros', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const dates = Object.keys(data.near_earth_objects);
    const asteroidsToday = data.near_earth_objects[dates[0]];

    console.log(`\n--- 🛰️ Investigando ${asteroidsToday.length} objetos hoje ---`);

    let dangerous = 0;
    let safe = 0;

    asteroidsToday.forEach((asteroid: any) => {
      const name = asteroid.name;
      const isDangerous = asteroid.is_potentially_hazardous_asteroid;

      // Garante que o campo é estritamente booleano
      expect(typeof isDangerous).toBe('boolean');

      if (isDangerous) {
        dangerous++;
        console.log(`⚠️  ALERTA: ${name} é potencialmente perigoso!`);
      } else {
        safe++;
        console.log(`✅ Seguro: ${name} não oferece risco.`);
      }
    });

    console.log(`\n📊 Resumo do dia:`);
    console.log(`   ⚠️  Perigosos : ${dangerous}`);
    console.log(`   ✅  Seguros   : ${safe}`);
    console.log(`   📦  Total     : ${asteroidsToday.length}`);

    // Garante que recebemos dados para analisar
    expect(asteroidsToday.length).toBeGreaterThan(0);
    expect(dangerous + safe).toBe(asteroidsToday.length);
  });

  test('7 - Deve validar velocidade de aproximação dos asteroides', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    const dates = Object.keys(data.near_earth_objects);
    const asteroidsToday = data.near_earth_objects[dates[0]];

    asteroidsToday.forEach((asteroid: any) => {
      const approachData = asteroid.close_approach_data;

      // Cada asteroide deve ter pelo menos um dado de aproximação
      expect(approachData.length).toBeGreaterThan(0);

      const approach = approachData[0];

      // Valida campos de velocidade
      expect(approach).toHaveProperty('relative_velocity');
      expect(approach.relative_velocity).toHaveProperty('kilometers_per_hour');

      const speedKmh = parseFloat(approach.relative_velocity.kilometers_per_hour);

      // Velocidade deve ser um número positivo e realista (entre 0 e 300.000 km/h)
      expect(speedKmh).toBeGreaterThan(0);
      expect(speedKmh).toBeLessThan(300000);

      console.log(`🚀 ${asteroid.name}: ${speedKmh.toFixed(0)} km/h`);
    });
  });

  test('8 - Deve validar distância de aproximação à Terra', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    const dates = Object.keys(data.near_earth_objects);
    const asteroidsToday = data.near_earth_objects[dates[0]];

    asteroidsToday.forEach((asteroid: any) => {
      const approach = asteroid.close_approach_data[0];

      expect(approach).toHaveProperty('miss_distance');
      expect(approach.miss_distance).toHaveProperty('kilometers');
      expect(approach.miss_distance).toHaveProperty('lunar'); // distância em Luas

      const distKm = parseFloat(approach.miss_distance.kilometers);
      const distLunar = parseFloat(approach.miss_distance.lunar);

      // Distância deve ser positiva
      expect(distKm).toBeGreaterThan(0);
      expect(distLunar).toBeGreaterThan(0);

      const risco = distLunar < 1 ? '🔴 MUITO PRÓXIMO' : distLunar < 10 ? '🟡 Atenção' : '🟢 Seguro';
      console.log(`📏 ${asteroid.name}: ${distLunar.toFixed(2)} Luas de distância ${risco}`);
    });
  });

  test('9 - Deve validar tamanho estimado dos asteroides', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    const dates = Object.keys(data.near_earth_objects);
    const asteroidsToday = data.near_earth_objects[dates[0]];

    asteroidsToday.forEach((asteroid: any) => {
      const diameter = asteroid.estimated_diameter;

      // Valida estrutura de diâmetro
      expect(diameter).toHaveProperty('kilometers');
      expect(diameter.kilometers).toHaveProperty('estimated_diameter_min');
      expect(diameter.kilometers).toHaveProperty('estimated_diameter_max');

      const minKm = diameter.kilometers.estimated_diameter_min;
      const maxKm = diameter.kilometers.estimated_diameter_max;

      // O mínimo deve ser menor ou igual ao máximo
      expect(minKm).toBeLessThanOrEqual(maxKm);
      expect(minKm).toBeGreaterThan(0);

      const tamanho = maxKm > 1 ? '🪨 Grande' : maxKm > 0.1 ? '⚫ Médio' : '• Pequeno';
      console.log(`📐 ${asteroid.name}: ${(minKm * 1000).toFixed(0)}m – ${(maxKm * 1000).toFixed(0)}m ${tamanho}`);
    });
  });

  test('10 - Deve verificar período de datas retornado pela API (7 dias)', async ({ request }) => {
    const apiKey = process.env.NASA_API_KEY;

    const response = await request.get(`${BASE_URL}/feed?api_key=${apiKey}`);
    const data = await response.json();

    const dates = Object.keys(data.near_earth_objects);

    // A API retorna dados para um período de até 7 dias
    expect(dates.length).toBeGreaterThanOrEqual(1);
    expect(dates.length).toBeLessThanOrEqual(8);

    console.log(`\n📅 Período coberto pela API: ${dates.length} dias`);
    console.log(`   De: ${dates[0]}`);
    console.log(`   Até: ${dates[dates.length - 1]}`);

    let totalAsteroids = 0;
    dates.forEach(date => {
      const count = data.near_earth_objects[date].length;
      totalAsteroids += count;
      console.log(`   ${date}: ${count} asteroides`);
    });

    expect(totalAsteroids).toBe(data.element_count);
    console.log(`\n✅ Total confirmado: ${totalAsteroids} asteroides`);
  });

});
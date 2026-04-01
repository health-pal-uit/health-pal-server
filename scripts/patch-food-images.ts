#!/usr/bin/env ts-node

// npm run patch-food-images

import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

type MatchMode = 'exact' | 'prefix' | 'contains';

function getArgValue(flag: string): string | undefined {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return undefined;
  }
  return args[index + 1];
}

function resolveDbConfigFromEnv(): DbConfig {
  const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
  const useCloudDb = dbTarget === 'cloud';

  const localDb: DbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'health-pal-db',
  };

  if (!useCloudDb) {
    return localDb;
  }

  return {
    host: process.env.CLOUD_DB_HOST || localDb.host,
    port: +(process.env.CLOUD_DB_PORT || localDb.port),
    user: process.env.CLOUD_DB_USERNAME || localDb.user,
    password: process.env.CLOUD_DB_PASSWORD || localDb.password,
    database: process.env.CLOUD_DB_DATABASE || localDb.database,
  };
}

function sanitizeStorageFileName(baseName: string, ext: string): string {
  return (
    baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase() + ext.toLowerCase()
  );
}

function parseNamePattern(rawName: string): { mode: MatchMode; needle: string } | null {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('x_') && trimmed.endsWith('_x') && trimmed.length > 4) {
    const needle = trimmed.slice(2, -2).trim();
    if (!needle) {
      return null;
    }
    return { mode: 'contains', needle };
  }

  if (trimmed.endsWith('_x') && trimmed.length > 2) {
    const needle = trimmed.slice(0, -2).trim();
    if (!needle) {
      return null;
    }
    return { mode: 'prefix', needle };
  }

  return { mode: 'exact', needle: trimmed };
}

async function countMatches(
  client: Client,
  tableName: 'ingredients' | 'meals',
  pattern: string,
  mode: MatchMode,
) {
  if (mode === 'exact') {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${tableName} WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL`,
      [pattern],
    );
    return parseInt(result.rows[0].count, 10);
  }

  if (mode === 'prefix') {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${tableName} WHERE name ILIKE ($1 || '%') AND deleted_at IS NULL`,
      [pattern],
    );
    return parseInt(result.rows[0].count, 10);
  }

  const result = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${tableName} WHERE name ILIKE ('%' || $1 || '%') AND deleted_at IS NULL`,
    [pattern],
  );
  return parseInt(result.rows[0].count, 10);
}

async function updateMatches(
  client: Client,
  tableName: 'ingredients' | 'meals',
  imageUrl: string,
  pattern: string,
  mode: MatchMode,
) {
  if (mode === 'exact') {
    const result = await client.query(
      `UPDATE ${tableName} SET image_url = $1 WHERE LOWER(name) = LOWER($2) AND deleted_at IS NULL`,
      [imageUrl, pattern],
    );
    return result.rowCount ?? 0;
  }

  if (mode === 'prefix') {
    const result = await client.query(
      `UPDATE ${tableName} SET image_url = $1 WHERE name ILIKE ($2 || '%') AND deleted_at IS NULL`,
      [imageUrl, pattern],
    );
    return result.rowCount ?? 0;
  }

  const result = await client.query(
    `UPDATE ${tableName} SET image_url = $1 WHERE name ILIKE ('%' || $2 || '%') AND deleted_at IS NULL`,
    [imageUrl, pattern],
  );
  return result.rowCount ?? 0;
}

function collectImageFiles(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  const result: string[] = [];

  for (const entry of files) {
    const absolutePath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectImageFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
      result.push(absolutePath);
    }
  }

  return result;
}

async function uploadAndGetPublicUrl(
  supabaseUrl: string,
  supabaseKey: string,
  bucketName: string,
  storageFileName: string,
  localFilePath: string,
) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const fileBuffer = fs.readFileSync(localFilePath);
  const extension = path.extname(storageFileName).toLowerCase();

  let contentType = 'image/jpeg';
  if (extension === '.png') contentType = 'image/png';
  if (extension === '.webp') contentType = 'image/webp';
  if (extension === '.gif') contentType = 'image/gif';

  const { error } = await supabase.storage.from(bucketName).upload(storageFileName, fileBuffer, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Upload failed for ${storageFileName}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storageFileName);
  return data.publicUrl;
}

async function main() {
  const folderArg = getArgValue('--dir') || getArgValue('-d');
  const defaultFolder = path.resolve(process.cwd(), 'food_photos');

  const imagesFolder = folderArg ? path.resolve(folderArg) : defaultFolder;
  if (!fs.existsSync(imagesFolder) || !fs.statSync(imagesFolder).isDirectory()) {
    console.error(`Image folder not found: ${imagesFolder}`);
    console.error('Put your images in ./food_photos or pass --dir "C:/path/to/images"');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment');
    process.exit(1);
  }

  const ingredientBucket = process.env.INGREDIENT_IMG_BUCKET_NAME || 'ingredient-imgs';
  const mealBucket = process.env.MEAL_IMG_BUCKET_NAME || 'meal-imgs';

  const dbConfig = resolveDbConfigFromEnv();
  const client = new Client(dbConfig);

  await client.connect();
  console.log(`Connected DB target: ${process.env.DB_TARGET || 'local'}`);
  console.log(`Using images folder: ${imagesFolder}`);

  const imageFiles = collectImageFiles(imagesFolder);
  if (imageFiles.length === 0) {
    console.log('No image files found in folder');
    await client.end();
    return;
  }

  let updatedIngredients = 0;
  let updatedMeals = 0;
  let skipped = 0;

  for (const imagePath of imageFiles) {
    const ext = path.extname(imagePath);
    const rawName = path.basename(imagePath, ext);
    const parsedPattern = parseNamePattern(rawName);

    if (!parsedPattern) {
      skipped++;
      console.log(`Skipped (invalid filename pattern): ${rawName}`);
      continue;
    }

    const { mode, needle } = parsedPattern;

    const ingredientCount = await countMatches(client, 'ingredients', needle, mode);
    const mealCount = await countMatches(client, 'meals', needle, mode);

    if (ingredientCount === 0 && mealCount === 0) {
      skipped++;
      console.log(`Skipped (no ${mode} match): ${rawName}`);
      continue;
    }

    const storageFileName = sanitizeStorageFileName(rawName, ext);

    if (ingredientCount > 0) {
      const ingredientUrl = await uploadAndGetPublicUrl(
        supabaseUrl,
        supabaseKey,
        ingredientBucket,
        storageFileName,
        imagePath,
      );

      const affected = await updateMatches(client, 'ingredients', ingredientUrl, needle, mode);
      updatedIngredients += affected;
      console.log(`Ingredient patched (${mode}): ${rawName} -> ${affected} row(s)`);
    }

    if (mealCount > 0) {
      const mealUrl = await uploadAndGetPublicUrl(
        supabaseUrl,
        supabaseKey,
        mealBucket,
        storageFileName,
        imagePath,
      );

      const affected = await updateMatches(client, 'meals', mealUrl, needle, mode);
      updatedMeals += affected;
      console.log(`Meal patched (${mode}): ${rawName} -> ${affected} row(s)`);
    }
  }

  await client.end();

  console.log('----------------------------------------');
  console.log(`Total files scanned: ${imageFiles.length}`);
  console.log(`Ingredients updated: ${updatedIngredients}`);
  console.log(`Meals updated: ${updatedMeals}`);
  console.log(`Files skipped: ${skipped}`);
}

main().catch((error) => {
  console.error('Patch food images failed:', error);
  process.exit(1);
});

\copy meals(name, kcal_per_100gr, fat_per_100gr, fiber_per_100gr, protein_per_100gr, carbs_per_100gr, user_id, rating, notes, tags, is_verified, image_url)
FROM '../data/meals_dataset.csv' WITH (FORMAT csv, HEADER true);

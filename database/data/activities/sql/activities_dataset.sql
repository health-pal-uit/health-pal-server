\copy activities(id, name, met_values, supports_rep, supports_hour, category, created_at)
FROM '../activities_dataset.csv'
WITH (FORMAT csv, HEADER true);
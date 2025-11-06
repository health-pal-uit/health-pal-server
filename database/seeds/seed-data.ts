import { faker } from "@faker-js/faker";
import { Activity } from "src/activities/entities/activity.entity";
import { Challenge } from "src/challenges/entities/challenge.entity";
import { DietType } from "src/diet_types/entities/diet_type.entity";
import { Medal } from "src/medals/entities/medal.entity";
import { PremiumPackage } from "src/premium_packages/entities/premium_package.entity";
import { Role } from "src/roles/entities/role.entity";
import { EntityManager } from "typeorm";
import { ChallengesMedal } from "src/challenges_medals/entities/challenges_medal.entity";
import * as fs from 'fs';
import * as path from 'path';
import { Ingredient } from "src/ingredients/entities/ingredient.entity";
import { Meal } from "src/meals/entities/meal.entity";
import { User } from "src/users/entities/user.entity";
import { Comment } from "src/comments/entities/comment.entity";

// ===== CSV HELPER FUNCTIONS =====
function parseCSV(filePath: string): any[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    
    // Parse rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row: any = {};
            headers.forEach((header, index) => {
                const value = values[index].trim();
                // Convert to appropriate type
                if (value === '' || value === 'NULL') {
                    row[header] = null;
                } else if (value === 'TRUE' || value === 'true') {
                    row[header] = true;
                } else if (value === 'FALSE' || value === 'false') {
                    row[header] = false;
                } else if (!isNaN(Number(value)) && value !== '') {
                    row[header] = Number(value);
                } else if (value.startsWith('{') && value.endsWith('}')) {
                    // Handle PostgreSQL array format {item1,item2}
                    row[header] = value.slice(1, -1).split(',').filter(Boolean);
                } else {
                    row[header] = value;
                }
            });
            data.push(row);
        }
    }
    
    return data;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Remove duplicate imports below
import { ChallengeDifficulty } from "src/helpers/enums/challenge-difficulty.enum";
import { MedalTier } from "src/helpers/enums/medal-tier.enum";
import { FitnessProfile } from "src/fitness_profiles/entities/fitness_profile.entity";
import { FitnessGoal } from "src/fitness_goals/entities/fitness_goal.entity";
import { ActivityLevel } from "src/helpers/enums/activity-level.enum";
import { FitnessGoalType } from "src/helpers/enums/fitness-goal-type.enum";
import { ChatSession } from "src/chat_sessions/entities/chat_session.entity";
import { ChatParticipant } from "src/chat_participants/entities/chat_participant.entity";
import { FoodType } from "src/helpers/enums/food-type.enum";
import { IngreMeal } from "src/ingre_meals/entities/ingre_meal.entity";
import { DailyLog } from "src/daily_logs/entities/daily_log.entity";
import { DailyIngre } from "src/daily_ingres/entities/daily_ingre.entity";
import { DailyMeal } from "src/daily_meals/entities/daily_meal.entity";
import { ActivityRecord } from "src/activity_records/entities/activity_record.entity";
import { RecordType } from "src/helpers/enums/record-type.enum";
import { Post } from "src/posts/entities/post.entity";
import { AttachType } from "src/helpers/enums/attach-type.enum";
import { Like } from "src/likes/entities/like.entity";
import { FavIngre } from "src/fav_ingres/entities/fav_ingre.entity";
import { FavMeal } from "src/fav_meals/entities/fav_meal.entity";
import { ChallengesUser } from "src/challenges_users/entities/challenges_user.entity";
import { MedalsUser } from "src/medals_users/entities/medals_user.entity";

export async function seedData(manager: EntityManager) {
    faker.seed(40);

    // static table
    const roles = await seedRoles(manager);
    const diet_types = await seedDietTypes(manager);
    const premium_packages = await seedPremiumPackages(manager);
    const activities = await seedActivities(manager);
    const {challenges, medals} = await seedChallengesAndMedals(manager);

    // user + profiles/goals
    const users = await seedUsers(manager, {count: 20, roles, premium_packages});

    await seedFitnessProfilesAndGoals(manager, {users, diet_types});

    // chat
    const {sessions} = await seedChatData(manager, {users});

    // nutrition contents
    const {ingredients, meals} = await seedNutritionContents(manager, {users});

    await seedIngreMeals(manager);

    // contributions
 //   await seedContributions(manager, {users, ingredients, meals});
    // notifications
 //   await seedNotifications(manager, {users});
    // devices
 //   await seedDevices(manager, {users});

    // posts
    const posts = await seedPosts(manager, {users, challenges, medals, meals, ingredients});
    await seedComments(manager, {users, posts});
    await seedLikes(manager, {users, posts});

    // logs
    const daily_logs = await seedDailyLogs(manager, {users, ingredients, meals, activities});
   // await seedActivityRecords(manager, {daily_logs, activities});


    // fav & achievements
    await seedFavorites(manager, {users, ingredients, meals});
    await seedChallengesUsersAndMedalsUsers(manager, {users, challenges, medals});
}

async function seedRoles(manager: EntityManager) {
    const data = ['user', 'admin'].map((name) => ({ name }));
    
    await manager.getRepository(Role).upsert(data, ['name']);

    return await manager.getRepository(Role).find();

    // const role = new Role();
    // role.name = 'user';
    // await manager.save(role);

    // const adminRole = new Role();
    // adminRole.name = 'admin';
    // await manager.save(adminRole);
    // return {userRole: role, adminRole};
}

async function seedDietTypes(manager: EntityManager) {
    const data = [
        { name: 'Balanced', protein_percentage: 0.3, fat_percentage: 0.25, carbs_percentage: 0.45 },
        { name: 'High-Protein', protein_percentage: 0.4, fat_percentage: 0.25, carbs_percentage: 0.35 },
    ];

    await manager.getRepository(DietType).upsert(data, ['name']);
    return await manager.getRepository(DietType).find();
}
async function seedPremiumPackages(manager: EntityManager) {
    const data = [{ name: 'Free', price: 0 }, { name: 'Lite', price: 4.99 }, { name: 'Pro', price: 9.99 }];
    await manager.getRepository(PremiumPackage).upsert(data, ['name']);
    return await manager.getRepository(PremiumPackage).find();
    // const premiumPackages : PremiumPackage[] = [];
    // const packageNames = ['Free', 'Lite', 'Pro'];
    // for (const name of packageNames) {
    //     const pkg = new PremiumPackage();
    //     pkg.name = name;
    //     await manager.save(pkg);
    //     premiumPackages.push(pkg);
    // }
    // return premiumPackages;
}

async function seedActivities(manager: EntityManager) {
    // Load activities from CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'activities', 'activities_dataset.csv');
    const csvData = parseCSV(csvPath);
    
    // Map CSV data to Activity entity format
    const data = csvData.map(row => ({
        id: row.id || undefined, // UUID from CSV or let DB generate
        name: row.name,
        met_values: row.met_values,
        supports_rep: row.supports_rep || false,
        supports_hour: row.supports_hour || false,
        category: row.category || [],
    }));
    
    // Use upsert to avoid duplicates
    await manager.getRepository(Activity).upsert(data, ['id']);
    return await manager.getRepository(Activity).find();
}

async function seedChallengesAndMedals(manager: EntityManager) {
    const challengesData = [
        { name: '7-Day Water', difficulty: ChallengeDifficulty.EASY },
        { name: '10K Steps', difficulty: ChallengeDifficulty.MEDIUM },
    ];
    const medalsData = [
        { name: 'Hydration Bronze', tier:  MedalTier.BRONZE },
        { name: 'Steps Silver', tier: MedalTier.SILVER },
    ];
    await manager.getRepository(Challenge).upsert(challengesData, ['name']);
    await manager.getRepository(Medal).upsert(medalsData, ['name']);

    const challenges = await manager.getRepository(Challenge).find();
    const medals = await manager.getRepository(Medal).find();

    // test 1-1 mapping
    for (let i = 0; i < Math.min(challenges.length, medals.length); i++) {
        const challenge = challenges[i];
        const medal = medals[i];
        await manager.getRepository(ChallengesMedal).upsert({
            challenge: challenge,
            medal: medal
        }, ['challenges_id', 'medal_id']);
    }
    return { challenges, medals };
}

async function seedUsers(manager: EntityManager, opts: {count: number, roles: Role[], premium_packages: PremiumPackage[]}) {
    const rows: Partial<User>[] = Array.from({ length: opts.count }).map(() => ({
        username: faker.internet.username().toLowerCase(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        fullname: faker.person.fullName(),
        gender: faker.datatype.boolean(),
        birth_date: faker.date.birthdate({ min: 18, max: 45, mode: 'age' }),
        role: faker.helpers.arrayElement(opts.roles),
        package: faker.helpers.arrayElement(opts.premium_packages),
        avatar_url: faker.image.avatarGitHub(),
    }));

    await manager.getRepository(User).upsert(rows, ['email']);
    return await manager.getRepository(User).find();
}

async function seedFitnessProfilesAndGoals(manager: EntityManager, opts: {users: User[], diet_types: DietType[]}) {
    for (const u of opts.users) {
        const weight = faker.number.float({ min: 45, max: 85, multipleOf: 0.1 });
        const heightM = faker.number.float({ min: 1.5, max: 1.85, multipleOf: 0.01 });
        const bmi = +(weight / (heightM * heightM)).toFixed(1);
        const bmr = Math.round(10 * weight + 625 * heightM * 100 - 5 * faker.number.int({ min: 18, max: 45 }) + (u.gender ? 5 : -161));
        const tdee = Math.round(bmr * faker.helpers.arrayElement([1.2, 1.375, 1.55, 1.725, 1.9]));

        const activity_level = Object.values(ActivityLevel)[faker.number.int({ min: 0, max: Object.values(ActivityLevel).length - 1 })];
        const goal_type = Object.values(FitnessGoalType)[faker.number.int({ min: 0, max: Object.values(FitnessGoalType).length - 1 })];

        await manager.getRepository(FitnessProfile).upsert({
        user: u,
        weight_kg: weight,
        height_m: heightM,
        activity_level,
        diet_type: faker.helpers.arrayElement(opts.diet_types),
        bmi,
        bmr,
        tdee_kcal: tdee
        }, ['user']);
        await manager.getRepository(FitnessGoal).upsert({
        user: u,
        target_kcal: tdee - 300,
        target_protein_gr: Math.round(weight * 1.6),
        target_fat_gr: 60,
        target_carbs_gr: 220,
        target_fiber_gr: 25,
        goal_type,
        water_drank_l: 0,
        }, ['user']);
    }
}

async function seedChatData(manager: EntityManager, opts: {users: User[]}) {
    const sessions: Partial<ChatSession>[] = [
        { title: 'General', is_group: true },
        { title: 'Nutrition Q&A', is_group: false },
    ];
    const saved = await manager.getRepository(ChatSession).save(sessions);

    // add participants
    for (const s of saved) {
        const members = faker.helpers.arrayElements(opts.users, faker.number.int({ min: 2, max: 5 }));
        for (const m of members) {
        await manager.getRepository(ChatParticipant).upsert({
            chat_session: s, user: m, is_admin: false, joined_at: new Date()
        }, ['chat_session', 'user']);
        }
    }
    return { sessions: saved };
}

async function seedNutritionContents(manager: EntityManager, opts: {users: User[]}) {
    const ingreTags = Object.values(FoodType)[faker.number.int({ min: 0, max: Object.values(FoodType).length - 1 })];
    const mealTags = Object.values(FoodType)[faker.number.int({ min: 0, max: Object.values(FoodType).length - 1 })];

    // Load ingredients from CSV
    const ingredientsPath = path.join(__dirname, '..', 'data', 'food', 'ingredients_dataset.csv');
    const ingredientsCSV = parseCSV(ingredientsPath);
    
    // Map CSV data to Ingredient entities (take first 100 for reasonable seed size)
    const ingredientsData: Partial<Ingredient>[] = ingredientsCSV.slice(0, 100).map(row => ({
        name: row.name,
        kcal_per_100gr: row.kcal_per_100gr,
        protein_per_100gr: row.protein_per_100gr,
        fat_per_100gr: row.fat_per_100gr,
        carbs_per_100gr: row.carbs_per_100gr,
        fiber_per_100gr: row.fiber_per_100gr,
        user: row.user_id ? undefined : faker.helpers.arrayElement(opts.users), // Assign random user if no user_id in CSV
        notes: row.notes || null,
        tags: row.tags || [ingreTags],
        is_verified: row.is_verified !== undefined ? row.is_verified : true,
        image_url: row.image_url || null,
    }));
    
    const ingredients = await manager.getRepository(Ingredient).save(ingredientsData);
    
    // Load meals from CSV
    const mealsPath = path.join(__dirname, '..', 'data', 'food', 'meals_dataset.csv');
    const mealsCSV = parseCSV(mealsPath);
    
    // Map CSV data to Meal entities (take first 100 for reasonable seed size)
    const mealsData: Partial<Meal>[] = mealsCSV.slice(0, 100).map(row => ({
        name: row.name,
        kcal_per_100gr: row.kcal_per_100gr,
        protein_per_100gr: row.protein_per_100gr,
        fat_per_100gr: row.fat_per_100gr,
        carbs_per_100gr: row.carbs_per_100gr,
        fiber_per_100gr: row.fiber_per_100gr,
        user: row.user_id ? undefined : faker.helpers.arrayElement(opts.users), // Assign random user if no user_id in CSV
        made_from_ingredients: false, // Update this later if needed
        rating: row.rating || faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }),
        notes: row.notes || null,
        tags: row.tags || [mealTags],
        is_verified: row.is_verified !== undefined ? row.is_verified : true,
        image_url: row.image_url || null,
    }));
    
    const savedMeals = await manager.getRepository(Meal).save(mealsData);

    return { ingredients, meals: savedMeals };
}

async function seedIngreMeals(manager: EntityManager) {
    const ingreTags = Object.values(FoodType)[faker.number.int({ min: 0, max: Object.values(FoodType).length - 1 })];
    const mealTags = Object.values(FoodType)[faker.number.int({ min: 0, max: Object.values(FoodType).length - 1 })];

    const ingrs: Partial<Ingredient>[] = Array.from({ length: 30 }).map(() => ({
        name: faker.commerce.productName(),
        kcal_per_100gr: faker.number.float({ min: 20, max: 600, multipleOf: 1 }),
        protein_per_100gr: faker.number.float({ min: 0, max: 40, multipleOf: 0.1 }),
        fat_per_100gr: faker.number.float({ min: 0, max: 50, multipleOf: 0.1 }),
        carbs_per_100gr: faker.number.float({ min: 0, max: 80, multipleOf: 0.1 }),
        fiber_per_100gr: faker.number.float({ min: 0, max: 15, multipleOf: 0.1 }),
        tags: [ingreTags],
        is_verified: faker.datatype.boolean(),
        image_url: faker.image.urlPicsumPhotos()
    }));
    const ingredients = await manager.getRepository(Ingredient).save(ingrs);

    const meals: Partial<Meal>[] = Array.from({ length: 20 }).map(() => ({
        name: faker.commerce.product(),
        kcal_per_100gr: faker.number.float({ min: 50, max: 700 }),
        protein_per_100gr: faker.number.float({ min: 0, max: 50, multipleOf: 0.1 }),
        fat_per_100gr: faker.number.float({ min: 0, max: 60, multipleOf: 0.1 }),
        carbs_per_100gr: faker.number.float({ min: 0, max: 90, multipleOf: 0.1 }),
        made_from_ingredients: faker.datatype.boolean(),
        rating: faker.number.float({ min: 2, max: 5, multipleOf: 0.1 }),
        tags: [mealTags],
        is_verified: faker.datatype.boolean(),
        image_url: faker.image.urlPicsumPhotos()
    }));
    const savedMeals = await manager.getRepository(Meal).save(meals);

    for (const meal of savedMeals) {
        const parts = faker.helpers.arrayElements(ingredients, faker.number.int({ min: 1, max: 5 }));
        for (const ingre of parts) {
            await manager.getRepository(IngreMeal).upsert({
                meal: meal,
                ingredient: ingre,
                quantity_kg: faker.number.float({ min: 0.1,max: 1, multipleOf: 0.1 })
            }, ['meal', 'ingredient']
            )
        }
    }
}

async function seedDailyLogs(manager: EntityManager, opts: {users: User[], ingredients: Ingredient[], meals: Meal[], activities: Activity[]}) {
    for (const u of opts.users) {
        const log = await manager.getRepository(DailyLog).save({
        user: u, date: faker.date.recent({ days: 5 }), updated_at: new Date()
        });

        // daily_ingres
        const ingrs = faker.helpers.arrayElements(opts.ingredients, faker.number.int({ min: 1, max: 4 }));
        for (const ing of ingrs) {
        const qty = faker.number.float({ min: 0.05, max: 0.25, multipleOf: 0.01 });
        await manager.getRepository(DailyIngre).save({
            daily: log, ingre: ing, quantity_kg: qty,
            total_kcal: +(ing.kcal_per_100gr * (qty * 10)).toFixed(1),
            total_protein_gr: +((ing.protein_per_100gr ?? 0) * qty).toFixed(1),
            total_fat_gr: +((ing.fat_per_100gr ?? 0) * qty).toFixed(1),
            total_fiber_gr: +((ing.fiber_per_100gr ?? 0) * qty).toFixed(1),
            total_carbs_gr: +((ing.carbs_per_100gr ?? 0) * qty).toFixed(1),
            meal_types: faker.helpers.arrayElement(['breakfast','lunch','dinner','snack']),
            logged_at: new Date()
        });
        }

        // daily_meals
        const meals = faker.helpers.arrayElements(opts.meals, faker.number.int({ min: 0, max: 2 }));
        for (const m of meals) {
        const qty = faker.number.float({ min: 0.2, max: 0.6, multipleOf: 0.05 });
        await manager.getRepository(DailyMeal).save({
            daily: log, meal: m, quantity_kg: qty,
            total_kcal: +(m.kcal_per_100gr * (qty * 10)).toFixed(1),
            total_protein_gr: +((m.protein_per_100gr ?? 0) * qty).toFixed(1),
            total_fat_gr: +((m.fat_per_100gr ?? 0) * qty).toFixed(1),
            total_fiber_gr: +((m.fiber_per_100gr ?? 0) * qty).toFixed(1),
            total_carbs_gr: +((m.carbs_per_100gr ?? 0) * qty).toFixed(1),
            meal_types: faker.helpers.arrayElement(['breakfast','lunch','dinner','snack']),
            logged_at: new Date()
        });
        }

        // activity_records (snapshots)
        const acts = faker.helpers.arrayElements(opts.activities, faker.number.int({ min: 0, max: 2 }));
        for (const a of acts) {
            const record: Partial<ActivityRecord> = {
                activity: a,
                daily_log: log,
                challenge: null,  // Must be null when daily_log is set
                user_owned: true,  // Required field
                hours: faker.number.float({ min: 0.3, max: 1.5, multipleOf: 0.1 }),
                reps: undefined,  // Either reps OR hours (not both) - use undefined for optional fields
                load_kg: undefined,
                distance_km: faker.datatype.boolean() ? faker.number.float({ min: 1, max: 6, multipleOf: 0.1 }) : undefined,
                user_weight_kg: faker.number.float({ min: 45, max: 85, multipleOf: 0.1 }),
                rhr: faker.number.int({ min: 55, max: 75 }),
                ahr: faker.number.int({ min: 90, max: 150 }),
                type: RecordType.DAILY,  // Use enum instead of string
                intensity_level: faker.number.int({ min: 1, max: 5 })
            };
            await manager.getRepository(ActivityRecord).save(record);
        }
     }
}

async function seedPosts(manager: EntityManager, opts: {users: User[], challenges: Challenge[], medals: Medal[], meals: Meal[], ingredients: Ingredient[]}) {
    const posts: Partial<Post>[] = Array.from({ length: 30 }).map(() => {
        // Randomly decide post type
        const attachType = faker.helpers.arrayElement([
            AttachType.NONE, 
            AttachType.MEAL, 
            AttachType.INGREDIENT, 
            AttachType.CHALLENGE, 
            AttachType.MEDAL
        ]);
        
        const post: Partial<Post> = {
            user: faker.helpers.arrayElement(opts.users),
            content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })), // content is always text
            attach_type: attachType,
            is_approved: faker.datatype.boolean({ probability: 0.8 }), // 80% approved
            created_at: faker.date.recent({ days: 10 }),
        };

        // Set the appropriate attachment based on type
        switch (attachType) {
            case AttachType.MEAL:
                post.attach_meal = faker.helpers.arrayElement(opts.meals);
                post.attach_challenge = null;
                post.attach_medal = null;
                post.attach_ingredient = null;
                break;
            case AttachType.INGREDIENT:
                post.attach_ingredient = faker.helpers.arrayElement(opts.ingredients);
                post.attach_challenge = null;
                post.attach_medal = null;
                post.attach_meal = null;
                break;
            case AttachType.CHALLENGE:
                post.attach_challenge = faker.helpers.arrayElement(opts.challenges);
                post.attach_medal = null;
                post.attach_meal = null;
                post.attach_ingredient = null;
                break;
            case AttachType.MEDAL:
                post.attach_medal = faker.helpers.arrayElement(opts.medals);
                post.attach_challenge = null;
                post.attach_meal = null;
                post.attach_ingredient = null;
                break;
            default: // AttachType.NONE
                post.attach_challenge = null;
                post.attach_medal = null;
                post.attach_meal = null;
                post.attach_ingredient = null;
        }

        return post;
    });

    return await manager.getRepository(Post).save(posts);
}


async function seedComments(manager: EntityManager, opts: {users: User[], posts: Post[]}) {
    const comments: Partial<Comment>[] = [];
    for (const post of opts.posts) {
        const numComments = faker.number.int({ min: 0, max: 5 });
        for (let i = 0; i < numComments; i++) {
            comments.push({
                post: post,
                user: faker.helpers.arrayElement(opts.users),
                content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
                created_at: faker.date.recent({ days: 10 }),
            });
        }
    }
    await manager.getRepository(Comment).save(comments);
}

async function seedLikes(manager: EntityManager, opts: {users: User[], posts: Post[]}) {
    for (const post of opts.posts) {
        const likers = faker.helpers.arrayElements(opts.users, faker.number.int({ min: 0, max: opts.users.length }));
        for (const user of likers) {
            await manager.getRepository(Like).upsert({
                post: post,
                user: user,
            }, ['post', 'user']);
        }
    }   
}

async function seedFavorites(manager: EntityManager, opts: {users: User[], ingredients: Ingredient[], meals: Meal[]}) {
    for (const u of opts.users) {
        const favIngrs = faker.helpers.arrayElements(opts.ingredients, faker.number.int({ min: 0, max: 10 }));
        for (const ingre of favIngrs) {
            await manager.getRepository(FavIngre).upsert({
                user: u,
                ingredient: ingre,
            }, ['user', 'ingredient']);
        }

    }
    for (const u of opts.users) {
        const favMeals = faker.helpers.arrayElements(opts.meals, faker.number.int({ min: 0, max: 10 }));
        for (const meal of favMeals) {
            await manager.getRepository(FavMeal).upsert({
                user: u,
                meal: meal,
            }, ['user', 'meal']);
        }
    }
}


async function seedChallengesUsersAndMedalsUsers(manager: EntityManager, opts: {users: User[], challenges: Challenge[], medals: Medal[]}) {
    for (const u of opts.users) {
        const joinedChallenges = faker.helpers.arrayElements(opts.challenges, faker.number.int({ min: 0, max: opts.challenges.length }));
        for (const ch of joinedChallenges) {
            await manager.getRepository(ChallengesUser).upsert({
                user: u,
                challenge: ch,
            }, ['user', 'challenge']);
        }
    }
    for (const u of opts.users) {
        const earnedMedals = faker.helpers.arrayElements(opts.medals, faker.number.int({ min: 0, max: opts.medals.length }));   
        for (const md of earnedMedals) {
            await manager.getRepository(MedalsUser).upsert({
                user: u,
                medal: md,
            }, ['user', 'medal']);
        }
    }
}
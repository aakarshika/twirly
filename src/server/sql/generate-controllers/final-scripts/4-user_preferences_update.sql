-- Update script for all 10 users
DO $$
DECLARE
    -- Define array of user IDs
    v_user_ids UUID[] := ARRAY[
'bd668022-7999-4b44-91b3-7033a8a24157',
'd106f657-3eb6-494c-bd53-d2577fad787d',
'a9cd1a33-58b0-40e4-9065-17046a9d2cf0',
'bef0b348-a7aa-4216-b3c5-b511773cfa63',
'241e253d-131d-40a8-b576-aaae2086add6',
'33aab4ad-ec8b-4ba2-a40b-c05cecfc189b',
'd08be63a-b011-4848-86c0-64b89afea709',
'e52e4637-548d-4e79-8622-a67e58c9cdd7',
'4b32e053-2c2f-4c0e-ba6f-9ccbb4aea6c0',
'0a40dd20-8694-44c1-b803-ce8991c36750'
    ];
    
    -- Array of display names (example data)
    v_display_names TEXT[] := ARRAY[
        'Alex Thompson', 'Jamie Rodriguez', 'Sam Chen', 'Morgan Davis',
        'Taylor Wilson', 'Jordan Miller', 'Casey White', 'Riley Johnson',
        'Avery Martinez', 'Quinn Peterson'
    ];
    
    -- Array of bios (example data)
    v_bios TEXT[] := ARRAY[
        'Tech enthusiast and coffee lover',
        'Avid traveler and foodie',
        'Fitness coach and nutrition expert',
        'Aspiring author and bookworm',
        'Photography hobbyist and nature lover',
        'Music producer and vinyl collector',
        'UX designer and minimalist',
        'Gaming streamer and PC builder',
        'Sustainable living advocate',
        'Data scientist and AI researcher'
    ];
    
    -- Array of theme preferences
    v_themes TEXT[] := ARRAY['light', 'dark', 'light', 'dark', 'light', 
                          'dark', 'light', 'dark', 'light', 'dark'];
    
    -- Define possible categories
    v_categories INT[] := ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    -- Loop variables
    i INT;
    v_current_user_id UUID;
    v_random_num INT;
    v_category_count INT;
    
BEGIN
    -- Loop through each user
    FOR i IN 1..10 LOOP
        v_current_user_id := v_user_ids[i];
        
        -- 1. Update user_preferences
        UPDATE user_preferences
        SET 
            display_name = v_display_names[i],
            bio = v_bios[i],
            theme_preference = v_themes[i],
            language_preference = CASE WHEN random() < 0.2 THEN 'es' ELSE 'en' END,
            is_onboarding_complete = TRUE,
            updated_at = CURRENT_TIMESTAMP + (i || ' hours')::INTERVAL -- stagger timestamps
        WHERE user_preferences.user_id = v_current_user_id;
        
        -- 2. Update user_notification_settings
        UPDATE user_notification_settings
        SET 
            email_notifications = random() < 0.8, -- 80% chance of true
            push_notifications = random() < 0.7,  -- 70% chance of true
            marketing_emails = random() < 0.3,    -- 30% chance of true
            vote_notifications = random() < 0.6,  -- 60% chance of true
            comment_notifications = random() < 0.7, -- 70% chance of true
            updated_at = CURRENT_TIMESTAMP + (i || ' hours')::INTERVAL
        WHERE user_notification_settings.user_id = v_current_user_id;
        
        -- 3. Update user_category_preferences
        -- First delete existing preferences for this user
        DELETE FROM user_category_preferences 
        WHERE user_category_preferences.user_id = v_current_user_id;
        
        -- Determine how many categories this user will have (2-5)
        v_category_count := 2 + floor(random() * 4)::INT;
        
        -- Insert new random category preferences
        FOR j IN 1..v_category_count LOOP
            v_random_num := 1 + floor(random() * 10)::INT; -- Random category ID between 1-10
            
            -- Check if we've already inserted this category
            IF NOT EXISTS (
                SELECT 1 FROM user_category_preferences 
                WHERE user_category_preferences.user_id = v_current_user_id 
                AND user_category_preferences.category_id = v_categories[v_random_num]
            ) THEN
                INSERT INTO user_category_preferences (
                    user_id, 
                    category_id, 
                    is_favorite, 
                    created_at
                )
                VALUES (
                    v_current_user_id,
                    v_categories[v_random_num],
                    random() < 0.4, -- 40% chance of being a favorite
                    CURRENT_TIMESTAMP + (i || ' hours')::INTERVAL
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;
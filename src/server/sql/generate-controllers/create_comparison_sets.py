#!/usr/bin/env python3
import json
import random
from datetime import datetime, timedelta
import os
from data import category_aspects, positive_templates, neutral_templates, negative_templates, aspect_phrases, comparison_set_templates

# Load the items data
with open('items.json', 'r') as f:
    items_data = json.load(f)

# Load user IDs
with open('userids.txt', 'r') as f:
    user_ids = [line.strip() for line in f]

def get_random_past_date():
    """Generate a random datetime within the past 3 months"""
    now = datetime.now()
    three_months_ago = now - timedelta(days=90)
    random_days = random.randint(0, 90)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    random_seconds = random.randint(0, 59)
    
    random_date = three_months_ago + timedelta(
        days=random_days,
        hours=random_hours,
        minutes=random_minutes,
        seconds=random_seconds
    )
    return random_date.strftime("%Y-%m-%d %H:%M:%S")

def create_comparison_sets():
    """Create comparison sets for similar products"""
    comparison_sets = []
    set_id = 1
    
    # Group items by category
    items_by_category = {}
    for item in items_data:
        category_id = item['category_id']
        if category_id not in items_by_category:
            items_by_category[category_id] = []
        items_by_category[category_id].append(item)
    
    # Create comparison sets for each category
    for category_id, items in items_by_category.items():
        # Create multiple sets per category if we have enough items
        num_sets = len(items) // 4
        for i in range(num_sets):
            start_idx = i * 4
            set_items = items[start_idx:start_idx + 4]
            
            # Get category aspects
            category_aspects_list = category_aspects.get(category_id, [])
            
            # Get a random template for this category
            templates = comparison_set_templates.get(category_id, [])
            if templates:
                template = random.choice(templates)
            else:
                template = {"name": f"Category {category_id} Comparison Set {i+1}", 
                          "description": f"Compare these items from category {category_id}"}
            
            # Create a comparison set
            comparison_set = {
                "id": set_id,
                "name": template["name"],
                "description": template["description"],
                "user_id": random.choice(user_ids),
                "category_id": category_id,
                "items": [{"id": item['id'], "name": item['name']} for item in set_items],
                "aspects": category_aspects_list,
                "created_at": get_random_past_date()
            }
            comparison_sets.append(comparison_set)
            set_id += 1
    
    return comparison_sets

def generate_review_text(aspects, ratings, product_name):
    """Generate review text based on aspects and their ratings using templates"""
    # Calculate average rating
    avg_rating = sum(ratings) / len(ratings)
    
    # Select template based on average rating
    if avg_rating >= 4:
        template = random.choice(positive_templates)
    elif avg_rating <= 2:
        template = random.choice(negative_templates)
    else:
        template = random.choice(neutral_templates)
    
    # Prepare aspect phrases
    positive_aspects = []
    negative_aspects = []
    minor_complaint = None
    minor_positive = None
    
    for aspect, rating in zip(aspects, ratings):
        aspect_name = aspect['name']
        if aspect_name in aspect_phrases:
            if rating >= 4:
                phrase = random.choice(aspect_phrases[aspect_name]['positive'])
                positive_aspects.append(phrase)
            elif rating <= 2:
                phrase = random.choice(aspect_phrases[aspect_name]['negative'])
                negative_aspects.append(phrase)
    
    # Fill in template placeholders
    review_text = template.format(
        product_name=product_name,
        positive_aspect_1=positive_aspects[0] if positive_aspects else "It works well",
        positive_aspect_2=positive_aspects[1] if len(positive_aspects) > 1 else "It's reliable",
        negative_aspect_1=negative_aspects[0] if negative_aspects else "It could be better",
        negative_aspect_2=negative_aspects[1] if len(negative_aspects) > 1 else "It has some issues",
        minor_complaint=minor_complaint or "but it's not perfect",
        minor_positive=minor_positive or "it's functional"
    )
    
    return review_text

def generate_sql_script(comparison_sets):
    """Generate SQL script for comparison sets, aspects, reviews, and votes"""
    sql_script = []
    review_id = 1
    metric_id = 1
    vote_id = 1
    
    # Begin transaction
    sql_script.append("BEGIN;")
    
    # Collect all values for each table
    comparison_set_values = []
    comparison_set_item_values = []
    comparison_set_aspect_values = []
    review_values = []
    review_metric_values = []
    vote_values = []
    
    for set_data in comparison_sets:
        # Escape string values for comparison sets
        name = set_data['name'].replace("'", "''")
        description = set_data['description'].replace("'", "''")
        
        comparison_set_values.append(
            f"({set_data['id']}, '{name}', '{description}', '{set_data['user_id']}', TIMESTAMP '{set_data['created_at']}')"
        )
        
        # Collect comparison set items
        for item in set_data['items']:
            created_at = get_random_past_date()
            comparison_set_item_values.append(
                f"({set_data['id']}, {item['id']}, TIMESTAMP '{created_at}')"
            )
        
        # Get aspects for this category
        aspects = set_data['aspects']
        
        # Collect comparison set aspects
        for aspect in aspects:
            metric_name = aspect['name'].replace("'", "''")
            description = aspect['description'].replace("'", "''")
            created_at = get_random_past_date()
            comparison_set_aspect_values.append(
                f"({set_data['id']}, '{metric_name}', '{description}', TIMESTAMP '{created_at}')"
            )
        
        # Generate reviews for each item
        set_users = random.sample(user_ids, random.randint(3, 4))
        
        for item in set_data['items']:
            for user_id in set_users:
                # Generate only one review per user per item
                ratings = [random.uniform(1, 5) for _ in aspects]
                review_text = generate_review_text(aspects, ratings, item['name'])
                review_text = review_text.replace("'", "''")
                created_at = get_random_past_date()
                
                review_values.append(
                    f"({review_id}, '{user_id}', {item['id']}, '{review_text}', {random.randint(0, 50)}, TIMESTAMP '{created_at}', TIMESTAMP '{created_at}')"
                )
                
                # Collect review metrics with the correct set_id
                for aspect, rating in zip(aspects, ratings):
                    metric_name = aspect['name'].replace("'", "''")
                    review_metric_values.append(
                        f"({metric_id}, {review_id}, {set_data['id']}, '{metric_name}', {rating:.1f}, TIMESTAMP '{created_at}')"
                    )
                    metric_id += 1
                
                review_id += 1
        
        # Generate votes for this comparison set
        # Each set gets 5-10 random votes from different users
        num_votes = random.randint(5, 10)
        voting_users = random.sample(user_ids, num_votes)
        
        for user_id in voting_users:
            # Each user votes for one random item in the set
            voted_item = random.choice(set_data['items'])
            created_at = get_random_past_date()
            
            vote_values.append(
                f"({vote_id}, '{user_id}', {voted_item['id']}, {set_data['id']}, TIMESTAMP '{created_at}')"
            )
            vote_id += 1
    
    # Generate single INSERT statements for each table
    if comparison_set_values:
        sql_script.append(f"""
INSERT INTO comparison_sets (id, name, description, user_id, created_at)
VALUES {',\n '.join(comparison_set_values)};
""")
    
    if comparison_set_item_values:
        sql_script.append(f"""
INSERT INTO comparison_set_items (set_id, item_id, created_at)
VALUES {',\n '.join(comparison_set_item_values)};
""")
    
    if comparison_set_aspect_values:
        sql_script.append(f"""
INSERT INTO comparison_set_aspects (set_id, metric_name, description, created_at)
VALUES {',\n '.join(comparison_set_aspect_values)};
""")
    
    if review_values:
        sql_script.append(f"""
INSERT INTO reviews (id, user_id, item_id, text, likes, created_at, updated_at)
VALUES {',\n '.join(review_values)};
""")
    
    if review_metric_values:
        sql_script.append(f"""
INSERT INTO review_metrics (id, review_id, set_id, metric_name, value, created_at)
VALUES {',\n '.join(review_metric_values)};
""")
    
    if vote_values:
        sql_script.append(f"""
INSERT INTO votes (id, user_id, item_id, set_id, created_at)
VALUES {',\n '.join(vote_values)};
""")
    
    # End transaction
    sql_script.append("COMMIT;")
    
    return "\n".join(sql_script)

def main():
    # Create comparison sets
    comparison_sets = create_comparison_sets()
    
    # Generate SQL script
    sql_script = generate_sql_script(comparison_sets)
    
    # Write to file
    with open('final-scripts/7-comparison_sets.sql', 'w') as f:
        f.write(sql_script)
    
    print("SQL script generated successfully!")

if __name__ == "__main__":
    main() 
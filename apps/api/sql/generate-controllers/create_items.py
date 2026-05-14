#!/usr/bin/env python3
import json
import random
from datetime import datetime, timedelta
from data import category_items

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

# Load user IDs
with open('userids.txt', 'r') as f:
    user_ids = [line.strip() for line in f]

def create_items_json():
    """Create items.json file with all items"""
    items_data = []
    item_id = 1
    
    # Iterate through each category and its items
    for category_id, items in category_items.items():
        for item in items:
            items_data.append({
                'id': item_id,
                'category_id': category_id,
                'name': item['name'],
                'user_id': random.choice(user_ids),
                'description': item['description'],
                'image_url': f'https://picsum.photos/id/{item_id}/200',
                'created_at': get_random_past_date()
            })
            item_id += 1
    
    # Write to JSON file
    with open('items.json', 'w') as f:
        json.dump(items_data, f, indent=2)
    
    return items_data

def generate_sql_script(items_data):
    """Generate SQL script for items"""
    sql_script = []
    
    # Begin transaction
    sql_script.append("BEGIN;")
    
    # Collect all values for items
    item_values = []
    
    for item in items_data:
        # Escape string values
        name = item['name'].replace("'", "''")
        description = item['description'].replace("'", "''")
        
        item_values.append(
            f"({item['id']}, '{item['user_id']}', {item['category_id']}, '{name}', '{description}', '{item['image_url']}', '{item['created_at']}')"
        )
    
    # Generate single INSERT statement for items
    if item_values:
        sql_script.append(f"""
INSERT INTO items (id, user_id, category_id, name, description, image_url, created_at)
VALUES {',\n '.join(item_values)};
""")
    
    # End transaction
    sql_script.append("COMMIT;")
    
    return "\n".join(sql_script)

def main():
    # First create items.json
    items_data = create_items_json()
    
    # Then generate SQL script
    sql_script = generate_sql_script(items_data)
    
    # Write to file
    with open('final-scripts/4-items_insert.sql', 'w') as f:
        f.write(sql_script)
    
    print("Items JSON and SQL script generated successfully!")

if __name__ == "__main__":
    main() 
#!/usr/bin/env python3
import json
from datetime import datetime

# Category data with IDs matching our items and aspects
categories = [
    {"id": 1, "name": "Tech Titans", "description": "Cutting-edge technology and gadgets"},
    {"id": 2, "name": "Kitchen Wizards", "description": "Culinary tools and kitchen essentials"},
    {"id": 3, "name": "Fashion Forward", "description": "Style and fashion essentials"},
    {"id": 4, "name": "Fitness Fanatics", "description": "Workout gear and fitness equipment"},
    {"id": 5, "name": "Home Sweet Home", "description": "Smart home and household items"},
    {"id": 6, "name": "Gaming Gurus", "description": "Gaming equipment and accessories"},
    {"id": 7, "name": "Audio Aficionados", "description": "Sound systems and audio gear"},
    {"id": 8, "name": "Photography Pros", "description": "Cameras and photography equipment"},
    {"id": 9, "name": "Outdoor Enthusiasts", "description": "Camping and outdoor gear"},
    {"id": 10, "name": "Coffee Connoisseurs", "description": "Coffee makers and brewing tools"},
    {"id": 11, "name": "Superhero Showdown", "description": "Compare your favorite superheroes"},
    {"id": 12, "name": "Pizza Wars", "description": "Battle of the best pizza styles"},
    {"id": 13, "name": "Streaming Services", "description": "Compare streaming platforms"},
    {"id": 14, "name": "Fast Food Frenzy", "description": "Battle of fast food chains"},
    {"id": 15, "name": "Social Media Stars", "description": "Compare social media platforms"},
    {"id": 16, "name": "Holiday Havoc", "description": "Compare your favorite holidays"},
    {"id": 17, "name": "Breakfast Battle", "description": "Battle of breakfast foods"},
    {"id": 18, "name": "Movie Genres", "description": "Compare movie categories"},
    {"id": 19, "name": "Weather Warriors", "description": "Compare weather conditions"},
    {"id": 20, "name": "Pet Personalities", "description": "Compare different pets"},
    {"id": 21, "name": "Ice Cream Showdown", "description": "Battle of ice cream flavors"},
    {"id": 22, "name": "TV Show Types", "description": "Compare TV show genres"},
    {"id": 23, "name": "Vacation Vibes", "description": "Compare vacation styles"},
    {"id": 24, "name": "Music Genres", "description": "Compare music styles"},
    {"id": 25, "name": "Coffee Types", "description": "Compare coffee styles"},
    {"id": 26, "name": "Board Games", "description": "Compare tabletop games"},
    {"id": 27, "name": "Fruit Fight", "description": "Battle of fruits"},
    {"id": 28, "name": "Transportation", "description": "Compare transport methods"},
    {"id": 29, "name": "Dessert Delights", "description": "Compare sweet treats"},
    {"id": 30, "name": "Sports", "description": "Compare different sports"}
]

def generate_sql_script():
    """Generate SQL script for categories"""
    sql_script = []
    
    # Begin transaction
    sql_script.append("BEGIN;")
    
    # Collect all values for categories
    category_values = []
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    for category in categories:
        # Escape single quotes in strings
        name = category['name'].replace("'", "''")
        description = category['description'].replace("'", "''")
        
        category_values.append(
            f"({category['id']}, '{name}', '{description}', TIMESTAMP '{current_time}')"
        )
    
    # Generate single INSERT statement for categories
    if category_values:
        sql_script.append(f"""
INSERT INTO categories (id, name, description, created_at)
VALUES {',\n '.join(category_values)};
""")
    
    # End transaction
    sql_script.append("COMMIT;")
    
    return "\n".join(sql_script)

def main():
    # Generate SQL script
    sql_script = generate_sql_script()
    
    # Write to file
    with open('final-scripts/3-categories_insert.sql', 'w') as f:
        f.write(sql_script)
    
    print("SQL script generated successfully!")

if __name__ == "__main__":
    main() 
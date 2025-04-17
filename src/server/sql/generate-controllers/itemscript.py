#!/usr/bin/env python3
import json
import random
from datetime import datetime, timedelta

# Load the product data from products.json
with open('products.json', 'r') as f:
    product_data = json.load(f)

# User IDs from your list
user_ids = [
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
]

# Map original categories to our new category IDs
category_mapping = {
    "Smartphones": 1,           # Electronics
    "Laptops": 1,               # Electronics
    "Audio Equipment": 1,       # Electronics
    "Kitchen Appliances": 2,    # Home & Kitchen
    "Furniture": 2,             # Home & Kitchen
    "Home Decor": 2,            # Home & Kitchen
    "Mens Clothing": 3,         # Fashion
    "Womens Clothing": 3,       # Fashion
    "Accessories": 3,           # Fashion
    "Fitness Equipment": 4,     # Sports & Outdoors
    "Outdoor Gear": 4,          # Sports & Outdoors
    "Team Sports": 4,           # Sports & Outdoors
    "Skincare": 5,              # Beauty
    "Haircare": 5,              # Beauty
    "Makeup": 5,                # Beauty
    "Board Games": 6,           # Toys & Games
    "Video Games": 6,           # Toys & Games
    "Educational Toys": 6,      # Toys & Games
    "Fiction Books": 7,         # Books & Media
    "Non-Fiction Books": 7,     # Books & Media
    "Movies & Music": 7,        # Books & Media
    "Car Accessories": 8,       # Automotive
    "Maintenance Products": 8,  # Automotive
    "Performance Parts": 8,     # Automotive
    "Dog Products": 9,          # Pets
    "Cat Products": 9,          # Pets
    "Small Pet Supplies": 9,    # Pets
    "Office Furniture": 10,     # Office
    "Writing Supplies": 10,     # Office
    "Technology & Electronics": 10, # Office
    "Vitamins & Supplements": 11, # Health & Wellness
    "Fitness Accessories": 11,  # Health & Wellness
    "Wellness Equipment": 11,   # Health & Wellness
    "Gourmet Food": 12,         # Food & Beverages
    "Beverages": 12,            # Food & Beverages
    "Specialty Foods": 12,      # Food & Beverages
    "Fine Jewelry": 13,         # Jewelry & Watches
    "Fashion Jewelry": 13,      # Jewelry & Watches
    "Luxury Watches": 13,       # Jewelry & Watches
    "Gardening Tools": 14,      # Garden & Outdoor
    "Outdoor Furniture": 14,    # Garden & Outdoor
    "Plants & Seeds": 14,       # Garden & Outdoor
    "Baby Essentials": 15,      # Baby & Kids
    "Kids' Toys": 15,           # Baby & Kids
    "Childrens Clothing": 15    # Baby & Kids
}

# Comparison types based on category
comparison_types = {
    1: ['spec_comparison', 'tech_comparison', 'feature_comparison', 'value_comparison'],
    2: ['feature_comparison', 'design_comparison', 'quality_comparison', 'utility_comparison'],
    3: ['style_comparison', 'material_comparison', 'comfort_comparison', 'fashion_comparison'],
    4: ['performance_comparison', 'durability_comparison', 'feature_comparison', 'material_comparison'],
    5: ['ingredient_comparison', 'effect_comparison', 'value_comparison', 'quality_comparison'],
    6: ['gameplay_comparison', 'fun_comparison', 'educational_comparison', 'replay_comparison'],
    7: ['content_comparison', 'quality_comparison', 'length_comparison', 'price_comparison'],
    8: ['feature_comparison', 'durability_comparison', 'performance_comparison', 'compatibility_comparison'],
    9: ['quality_comparison', 'comfort_comparison', 'material_comparison', 'size_comparison'],
    10: ['ergonomic_comparison', 'feature_comparison', 'durability_comparison', 'design_comparison'],
    11: ['effectiveness_comparison', 'ingredient_comparison', 'value_comparison', 'quality_comparison'],
    12: ['taste_comparison', 'nutritional_comparison', 'quality_comparison', 'value_comparison'],
    13: ['quality_comparison', 'design_comparison', 'material_comparison', 'prestige_comparison'],
    14: ['durability_comparison', 'feature_comparison', 'design_comparison', 'value_comparison'],
    15: ['safety_comparison', 'educational_comparison', 'quality_comparison', 'durability_comparison'],
    16: ['quality_comparison', 'versatility_comparison', 'value_comparison', 'durability_comparison'],
    17: ['durability_comparison', 'feature_comparison', 'comfort_comparison', 'design_comparison'],
    18: ['feature_comparison', 'tech_comparison', 'compatibility_comparison', 'ease_comparison'],
    19: ['rarity_comparison', 'condition_comparison', 'value_comparison', 'authenticity_comparison'],
    20: ['eco_comparison', 'durability_comparison', 'sustainability_comparison', 'quality_comparison']
}

# Generate SQL statements
sql_output = "-- Auto-generated product insert script\n"
sql_output += "-- Generated on: {}\n\n".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
sql_output += "BEGIN;\n\n"
sql_output += "-- Insert products from JSON data\n"
sql_output += "INSERT INTO items (id, name, description, image_url, category_id, user_id, price, comparison_type, created_at, updated_at)\nVALUES\n"

product_values = []
product_id = 1

# Process all product categories and items
for category in product_data:
    category_name = category['name']
    
    for product in category['products']:
        # Map to appropriate category ID
        category_id = category_mapping.get(category_name, 1)  # Default to Electronics if not found
        
        # Get a random user ID
        user_id = random.choice(user_ids)
        
        # Get a random comparison type for this category
        comparison_type = random.choice(comparison_types.get(category_id, ['feature_comparison']))
        
        # Random date within the last 30 days
        days_ago = random.randint(1, 30)
        created_date = datetime.now() - timedelta(days=days_ago)
        
        # Format the product data
        product_value = f"({product_id}, '{product['pname'].replace("'", "''")}', '{product['desc'].replace("'", "''")}', '{product['img']}', {category_id}, '{user_id}', {product['price']}, '{comparison_type}', TIMESTAMP '{created_date.strftime('%Y-%m-%d %H:%M:%S')}', TIMESTAMP '{created_date.strftime('%Y-%m-%d %H:%M:%S')}')"
        
        product_values.append(product_value)
        product_id += 1

# Join all the product values
sql_output += ",\n".join(product_values)
sql_output += ";\n\n"

# Update the sequence
sql_output += f"-- Update the sequence to start from the next number after our highest ID\n"
sql_output += f"SELECT setval('items_id_seq', {product_id - 1}, true);\n\n"

sql_output += "COMMIT;\n"

# Write to a file
with open('product_insert.sql', 'w') as f:
    f.write(sql_output)

print(f"Generated SQL insert script for {product_id - 1} products.")
print("Output saved to 'product_insert.sql'")
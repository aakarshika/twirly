#!/usr/bin/env python3
import json
import random
from datetime import datetime, timedelta
import os

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

# Category mapping (same as in previous script)
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

# Define review aspects for each category
category_aspects = {
    # Electronics (1)
    1: [
        {"name": "performance", "display_name": "Performance", "description": "Processing speed, responsiveness, and overall capability"},
        {"name": "build_quality", "display_name": "Build Quality", "description": "Materials, durability, and overall construction"},
        {"name": "features", "display_name": "Features", "description": "Available functions, capabilities, and special attributes"},
        {"name": "value", "display_name": "Value for Money", "description": "Overall worth considering the price point"},
        {"name": "user_experience", "display_name": "User Experience", "description": "Ease of use, interface design, and user satisfaction"}
    ],
    
    # Home & Kitchen (2)
    2: [
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs its intended purpose"},
        {"name": "durability", "display_name": "Durability", "description": "How well it withstands regular use over time"},
        {"name": "design", "display_name": "Design", "description": "Appearance, aesthetics, and visual appeal"},
        {"name": "ease_of_use", "display_name": "Ease of Use", "description": "Simplicity and intuitive operation"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Additional categories 3-20 as defined in the previous script
    # ... (include all category aspects from the previous script)
    
    # Fashion (3)
    3: [
        {"name": "quality", "display_name": "Quality", "description": "Material quality and construction"},
        {"name": "comfort", "display_name": "Comfort", "description": "How comfortable it is to wear"},
        {"name": "style", "display_name": "Style", "description": "Fashion appeal and design aesthetics"},
        {"name": "fit", "display_name": "Fit", "description": "How well it conforms to body type and sizing expectations"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Sports & Outdoors (4)
    4: [
        {"name": "performance", "display_name": "Performance", "description": "How well it functions during activity"},
        {"name": "durability", "display_name": "Durability", "description": "Resistance to wear and damage during use"},
        {"name": "comfort", "display_name": "Comfort", "description": "Physical comfort during use"},
        {"name": "versatility", "display_name": "Versatility", "description": "Range of conditions and uses it accommodates"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Beauty (5)
    5: [
        {"name": "effectiveness", "display_name": "Effectiveness", "description": "How well it achieves desired results"},
        {"name": "gentleness", "display_name": "Gentleness", "description": "How well it suits sensitive skin/hair"},
        {"name": "scent", "display_name": "Scent", "description": "Pleasantness and subtlety of fragrance"},
        {"name": "texture", "display_name": "Texture", "description": "Consistency and feel during application"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Toys & Games (6)
    6: [
        {"name": "fun_factor", "display_name": "Fun Factor", "description": "Level of enjoyment and entertainment"},
        {"name": "replayability", "display_name": "Replayability", "description": "How engaging it remains over repeated use"},
        {"name": "quality", "display_name": "Quality", "description": "Material quality and construction"},
        {"name": "educational_value", "display_name": "Educational Value", "description": "Learning opportunities provided"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Books & Media (7)
    7: [
        {"name": "content_quality", "display_name": "Content Quality", "description": "Quality of writing, information, or entertainment"},
        {"name": "engagement", "display_name": "Engagement", "description": "How captivating and absorbing the content is"},
        {"name": "originality", "display_name": "Originality", "description": "Uniqueness and innovation in the content"},
        {"name": "production_quality", "display_name": "Production Quality", "description": "Physical book quality or media production values"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Automotive (8)
    8: [
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs its intended purpose"},
        {"name": "installation_ease", "display_name": "Installation Ease", "description": "Simplicity of installation process"},
        {"name": "durability", "display_name": "Durability", "description": "Resistance to wear and damage during use"},
        {"name": "compatibility", "display_name": "Compatibility", "description": "How well it works with different vehicle models"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Pets (9)
    9: [
        {"name": "pet_satisfaction", "display_name": "Pet Satisfaction", "description": "How much pets enjoy or benefit from the product"},
        {"name": "durability", "display_name": "Durability", "description": "Resistance to pet damage and wear"},
        {"name": "ease_of_cleaning", "display_name": "Ease of Cleaning", "description": "How simple it is to clean and maintain"},
        {"name": "safety", "display_name": "Safety", "description": "Absence of hazards or harmful materials"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Office (10)
    10: [
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs its intended purpose"},
        {"name": "comfort", "display_name": "Comfort", "description": "Physical comfort during extended use"},
        {"name": "build_quality", "display_name": "Build Quality", "description": "Materials, durability, and overall construction"},
        {"name": "organization", "display_name": "Organization", "description": "How well it helps maintain workspace order"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Health & Wellness (11)
    11: [
        {"name": "effectiveness", "display_name": "Effectiveness", "description": "How well it achieves health benefits"},
        {"name": "ease_of_use", "display_name": "Ease of Use", "description": "Simplicity and intuitive operation"},
        {"name": "comfort", "display_name": "Comfort", "description": "Physical comfort during use"},
        {"name": "quality", "display_name": "Quality", "description": "Material quality and construction"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Food & Beverages (12)
    12: [
        {"name": "taste", "display_name": "Taste", "description": "Flavor quality and appeal"},
        {"name": "freshness", "display_name": "Freshness", "description": "Quality and condition upon arrival"},
        {"name": "ingredients", "display_name": "Ingredients", "description": "Quality and sourcing of components"},
        {"name": "variety", "display_name": "Variety", "description": "Range of options and selections"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Jewelry & Watches (13)
    13: [
        {"name": "craftsmanship", "display_name": "Craftsmanship", "description": "Quality of construction and finishing"},
        {"name": "appearance", "display_name": "Appearance", "description": "Visual appeal and aesthetics"},
        {"name": "durability", "display_name": "Durability", "description": "Resistance to wear and damage"},
        {"name": "comfort", "display_name": "Comfort", "description": "How comfortable it is to wear"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Garden & Outdoor (14)
    14: [
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs its intended purpose"},
        {"name": "durability", "display_name": "Durability", "description": "Resistance to weather and outdoor conditions"},
        {"name": "ease_of_use", "display_name": "Ease of Use", "description": "Simplicity and intuitive operation"},
        {"name": "appearance", "display_name": "Appearance", "description": "Visual appeal in outdoor settings"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Baby & Kids (15)
    15: [
        {"name": "safety", "display_name": "Safety", "description": "Free from hazards and suitable for children"},
        {"name": "durability", "display_name": "Durability", "description": "Ability to withstand rough handling"},
        {"name": "ease_of_use", "display_name": "Ease of Use", "description": "Simplicity for both parents and children"},
        {"name": "developmental_appropriateness", "display_name": "Developmental Appropriateness", "description": "Suitability for age and developmental stage"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Art & Craft Supplies (16)
    16: [
        {"name": "quality", "display_name": "Quality", "description": "Material quality and performance"},
        {"name": "versatility", "display_name": "Versatility", "description": "Range of projects and techniques possible"},
        {"name": "ease_of_use", "display_name": "Ease of Use", "description": "Accessibility for different skill levels"},
        {"name": "color_accuracy", "display_name": "Color Accuracy", "description": "True and consistent coloration"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Travel & Luggage (17)
    17: [
        {"name": "durability", "display_name": "Durability", "description": "Resistance to travel wear and handling"},
        {"name": "capacity", "display_name": "Capacity", "description": "Storage space and organization"},
        {"name": "mobility", "display_name": "Mobility", "description": "Ease of transport and maneuverability"},
        {"name": "design", "display_name": "Design", "description": "Appearance and thoughtful features"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Smart Home (18)
    18: [
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs its intended purpose"},
        {"name": "ease_of_setup", "display_name": "Ease of Setup", "description": "Simplicity of installation and configuration"},
        {"name": "connectivity", "display_name": "Connectivity", "description": "Reliability of wireless connections"},
        {"name": "integration", "display_name": "Integration", "description": "Compatibility with other smart systems"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Vintage & Collectibles (19)
    19: [
        {"name": "authenticity", "display_name": "Authenticity", "description": "Genuineness and provenance"},
        {"name": "condition", "display_name": "Condition", "description": "Physical state and preservation"},
        {"name": "rarity", "display_name": "Rarity", "description": "Scarcity and uniqueness"},
        {"name": "historical_significance", "display_name": "Historical Significance", "description": "Importance within its collecting category"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ],
    
    # Sustainable Products (20)
    20: [
        {"name": "eco_friendliness", "display_name": "Eco-Friendliness", "description": "Environmental impact and sustainability"},
        {"name": "functionality", "display_name": "Functionality", "description": "How well it performs compared to conventional alternatives"},
        {"name": "durability", "display_name": "Durability", "description": "Longevity and resistance to wear"},
        {"name": "ethical_production", "display_name": "Ethical Production", "description": "Fair labor and responsible sourcing"},
        {"name": "value", "display_name": "Value for Money", "description": "Worth relative to the price"}
    ]
}

# Define review templates with placeholders for product name and aspect ratings
positive_templates = [
    "Absolutely love my {product_name}! {positive_aspect_1} and {positive_aspect_2}. {minor_complaint} but overall it's a fantastic product.",
    "The {product_name} exceeded my expectations! {positive_aspect_1} which I really appreciate. {positive_aspect_2} as well. Would definitely recommend!",
    "I've been using the {product_name} for a month now and I'm impressed. {positive_aspect_1} and it's {positive_aspect_2}. Great value for the price.",
    "Five stars for the {product_name}! {positive_aspect_1} and it's incredibly {positive_aspect_2}. {minor_complaint}, but that's a minor issue.",
    "This {product_name} is exactly what I was looking for. {positive_aspect_1} and {positive_aspect_2}. Couldn't be happier with my purchase!",
    "I'm thrilled with my {product_name}. {positive_aspect_1} and {positive_aspect_2}. It's been a fantastic addition to my collection."
]

neutral_templates = [
    "The {product_name} is decent. {positive_aspect_1}, but {negative_aspect_1}. It's good for the price, but don't expect premium quality.",
    "Mixed feelings about the {product_name}. On one hand, {positive_aspect_1}. On the other, {negative_aspect_1}. It works, but not perfect.",
    "The {product_name} is okay. {positive_aspect_1} which is nice, but {negative_aspect_1}. I'd give it 3.5 stars if I could.",
    "Average product. The {product_name} has {positive_aspect_1}, but unfortunately {negative_aspect_1}. Might work better for others.",
    "The {product_name} meets basic expectations. {positive_aspect_1}, however {negative_aspect_1}. It's a middle-of-the-road option."
]

negative_templates = [
    "Disappointed with the {product_name}. {negative_aspect_1} and {negative_aspect_2}. The only positive is {minor_positive}.",
    "Cannot recommend the {product_name}. {negative_aspect_1} and {negative_aspect_2}. Save your money and look elsewhere.",
    "The {product_name} fell short of expectations. {negative_aspect_1} and it's {negative_aspect_2}. Not worth the price tag.",
    "Regret purchasing the {product_name}. {negative_aspect_1} and {negative_aspect_2}. Would return if I could.",
    "Had high hopes for the {product_name}, but it was a letdown. {negative_aspect_1} and {negative_aspect_2}. Very frustrated with this purchase."
]

# Aspect phrases by sentiment 
aspect_phrases = {
    "performance": {
        "positive": [
            "The performance is outstanding",
            "It runs incredibly fast",
            "Performance exceeds expectations",
            "It handles complex tasks with ease"
        ],
        "negative": [
            "The performance is disappointing",
            "It runs frustratingly slow",
            "Performance falls short of expectations",
            "It struggles with even basic tasks"
        ]
    },
    "build_quality": {
        "positive": [
            "The build quality is excellent",
            "It feels very premium and sturdy",
            "Construction is solid and durable",
            "The materials used are top-notch"
        ],
        "negative": [
            "The build quality is poor",
            "It feels cheap and flimsy",
            "Construction seems fragile",
            "The materials used feel low-quality"
        ]
    },
    "features": {
        "positive": [
            "It has all the features I need",
            "The feature set is impressive",
            "It comes with useful additional features",
            "The special features really stand out"
        ],
        "negative": [
            "It's missing essential features",
            "The feature set is disappointing",
            "It lacks many features found in competitors",
            "The advertised features don't work well"
        ]
    },
    "value": {
        "positive": [
            "It offers excellent value for money",
            "The price point is perfect for what you get",
            "It's worth every penny",
            "You get a lot for what you pay"
        ],
        "negative": [
            "It's overpriced for what you get",
            "The value for money is poor",
            "It's not worth the price tag",
            "You can find better options at this price point"
        ]
    },
    "user_experience": {
        "positive": [
            "It's very intuitive to use",
            "The user experience is seamless",
            "It's designed with the user in mind",
            "The interface is clean and user-friendly"
        ],
        "negative": [
            "It's frustrating to use",
            "The user experience is clunky",
            "It feels like it wasn't tested with actual users",
            "The interface is confusing and unintuitive"
        ]
    },
    "functionality": {
        "positive": [
            "It functions perfectly for its purpose",
            "It works exactly as described",
            "The functionality is comprehensive",
            "It handles all tasks smoothly"
        ],
        "negative": [
            "It doesn't function as advertised",
            "It fails at its basic purpose",
            "The functionality is limited",
            "It struggles with essential tasks"
        ]
    },
    "durability": {
        "positive": [
            "It's built to last",
            "It holds up well to daily use",
            "The durability is impressive",
            "It's withstood several months of heavy use"
        ],
        "negative": [
            "It broke after minimal use",
            "It doesn't hold up to daily wear",
            "The durability is concerning",
            "It's already showing signs of wear"
        ]
    },
    "design": {
        "positive": [
            "The design is beautiful and functional",
            "It has a sleek, modern design",
            "The aesthetic design is stunning",
            "The thoughtful design details make a difference"
        ],
        "negative": [
            "The design is unattractive and impractical",
            "It has an outdated look",
            "The design feels cheap",
            "The design overlooks practical considerations"
        ]
    },
    "ease_of_use": {
        "positive": [
            "It's incredibly easy to use",
            "The controls are intuitive",
            "Even beginners can use it without trouble",
            "The learning curve is minimal"
        ],
        "negative": [
            "It's unnecessarily complicated",
            "The controls are confusing",
            "You need technical knowledge to use it properly",
            "The learning curve is steep"
        ]
    },
    # Additional aspect phrases for other metrics
    "comfort": {
        "positive": [
            "It's extremely comfortable",
            "I can use/wear it for hours without discomfort",
            "The comfort level is exceptional",
            "It provides great support and comfort"
        ],
        "negative": [
            "It's uncomfortable to use/wear",
            "I can't use/wear it for long periods",
            "The comfort level is disappointing",
            "It causes discomfort after short use"
        ]
    },
    "quality": {
        "positive": [
            "The quality is exceptional",
            "It's made with high-quality materials",
            "The craftsmanship is excellent",
            "The quality control is evident"
        ],
        "negative": [
            "The quality is substandard",
            "It's made with low-quality materials",
            "The craftsmanship is poor",
            "There are obvious quality control issues"
        ]
    },
    # Add more aspect phrases for remaining metrics
    # ...
}

# Generate phrases for common aspects across categories if not already defined
common_aspects = ["value", "quality", "durability", "functionality"]
for aspect in common_aspects:
    if aspect not in aspect_phrases:
        aspect_phrases[aspect] = {
            "positive": [
                f"The {aspect} is excellent",
                f"It has great {aspect}",
                f"The {aspect} exceeds expectations",
                f"I'm impressed by the {aspect}"
            ],
            "negative": [
                f"The {aspect} is disappointing",
                f"It has poor {aspect}",
                f"The {aspect} falls short",
                f"I'm frustrated by the {aspect}"
            ]
        }

# Function to get random positive and negative aspect phrases based on category
def get_aspect_phrases(category_id, rating):
    aspects = category_aspects.get(category_id, category_aspects[1])  # Default to Electronics if not found
    aspect_names = [aspect["name"] for aspect in aspects]
    
    sentiment = "positive" if rating >= 3.5 else "negative"
    
    available_phrases = []
    for aspect_name in aspect_names:
        if aspect_name in aspect_phrases:
            available_phrases.extend(aspect_phrases[aspect_name][sentiment])
        else:
            # Generate generic phrases for aspects without specific phrases
            if sentiment == "positive":
                available_phrases.extend([
                    f"The {aspect_name} is excellent",
                    f"It has great {aspect_name}",
                    f"The {aspect_name} exceeds expectations"
                ])
            else:
                available_phrases.extend([
                    f"The {aspect_name} is disappointing",
                    f"It has poor {aspect_name}",
                    f"The {aspect_name} falls short"
                ])
    
    # Shuffle and pick phrases
    random.shuffle(available_phrases)
    return available_phrases[:3]  # Return 3 random phrases

# Function to escape quotes for PostgreSQL
def escape_quotes(text):
    if text is None:
        return ''
    return str(text).replace("'", "''")

# Generate SQL for reviews and metrics
def generate_review_sql():
    # Start SQL script
    sql_output = "-- Auto-generated review and metrics insert script\n"
    sql_output += "-- Generated on: {}\n\n".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    sql_output += "BEGIN;\n\n"
    
    review_id = 1
    review_metric_id = 1
    
    # Process all product categories and items
    item_id = 1
    for category in product_data:
        category_name = category['name']
        
        for product in category['products']:
            # Map to appropriate category ID
            category_id = category_mapping.get(category_name, 1)  # Default to Electronics if not found
            
            # Determine how many reviews for this product (1-5)
            num_reviews = random.randint(1, 5)
            
            for i in range(num_reviews):
                # Choose a random user (not the product owner)
                user_id = random.choice(user_ids)
                
                # Generate random rating (1-5 stars, weighted toward positive)
                weights = [0.05, 0.1, 0.2, 0.3, 0.35]  # More likely to be 4-5 stars
                rating = random.choices([1, 2, 3, 4, 5], weights=weights)[0]
                
                # Choose appropriate template based on rating
                if rating >= 4:
                    template = random.choice(positive_templates)
                elif rating >= 3:
                    template = random.choice(neutral_templates)
                else:
                    template = random.choice(negative_templates)
                
                # Get aspect phrases
                phrases = get_aspect_phrases(category_id, rating)
                
                # Create review text with proper quote escaping
                review_text = template.format(
                    product_name=escape_quotes(product['pname']),
                    positive_aspect_1=escape_quotes(phrases[0] if rating >= 3 else phrases[1]),
                    positive_aspect_2=escape_quotes(phrases[1] if rating >= 3 else phrases[2]),
                    negative_aspect_1=escape_quotes(phrases[1] if rating < 3 else f"I wish it {random.choice(['had better', 'improved', 'offered better'])} {random.choice(['durability', 'features', 'performance', 'value'])}"),
                    negative_aspect_2=escape_quotes(phrases[2] if rating < 3 else f"it could use some improvements"),
                    minor_complaint=escape_quotes(f"I wish it {random.choice(['had better', 'improved', 'offered better'])} {random.choice(['durability', 'features', 'performance', 'value'])}") if rating >= 3 else "",
                    minor_positive=escape_quotes(f"it's {random.choice(['decent', 'okay', 'acceptable'])} for {random.choice(['basic use', 'beginners', 'occasional use', 'the price'])}") if rating < 3 else ""
                )
                
                # Random date within the last 60 days
                days_ago = random.randint(1, 60)
                created_date = datetime.now() - timedelta(days=days_ago)
                formatted_date = created_date.strftime("%Y-%m-%d %H:%M:%S")
                
                # Add review SQL
                # sql_output += "-- Insert reviews\n"
                sql_output += "INSERT INTO reviews (id, user_id, item_id, text, likes, created_at, updated_at)\nVALUES\n"
                
                sql_output += f"({review_id}, '{user_id}', {item_id}, '{escape_quotes(review_text)}', {random.randint(0, 20)}, TIMESTAMP '{formatted_date}', TIMESTAMP '{formatted_date}')"
                
                # Generate metrics for this review
                aspects = category_aspects.get(category_id, category_aspects[1])
                
                metric_values = []
                for aspect in aspects:
                    # Generate a rating that's consistent with overall review score
                    # If review is positive, metrics are mostly positive with some variation
                    if rating >= 4:
                        metric_rating = round(min(5, max(1, random.normalvariate(rating, 0.5))), 1)
                    elif rating <= 2:
                        metric_rating = round(min(5, max(1, random.normalvariate(rating, 0.5))), 1)
                    else:
                        metric_rating = round(min(5, max(1, random.normalvariate(rating, 0.7))), 1)
                    
                    metric_values.append((aspect["name"], metric_rating))
                
                # Add review metrics SQL
                m_sql_output = ""
                m_sql_output += ";\n\n-- Insert review metrics\n"
                m_sql_output += "INSERT INTO review_metrics (id, review_id, metric_name, value, created_at)\nVALUES\n"
                if review_id == 1:
                    first_metric = True
                else:
                    first_metric = False
                
                for metric_name, metric_value in metric_values:
                    if not first_metric:
                        m_sql_output += ",\n"
                    else:
                        first_metric = False
                    
                    m_sql_output += f"({review_metric_id}, {review_id}, '{escape_quotes(metric_name)}', {metric_value}, TIMESTAMP '{formatted_date}')"
                    review_metric_id += 1
                
                # Add semicolon after the last metric for this review
                if i == num_reviews - 1 and product == category['products'][-1] and category == product_data[-1]:
                    sql_output += m_sql_output + ";"
                else:
                    sql_output += m_sql_output + ";\n"
                
                review_id += 1
            
            item_id += 1
    
    # Update sequences
    sql_output += ";\n\n-- Update sequences\n"
    sql_output += f"SELECT setval('reviews_id_seq', {review_id - 1}, true);\n"
    sql_output += f"SELECT setval('review_metrics_id_seq', {review_metric_id - 1}, true);\n\n"
    
    # Update item_metrics with aggregated review data
    sql_output += "-- Update item metrics with review data\n"
    sql_output += "UPDATE item_metrics im\n"
    sql_output += "SET reviews = subquery.review_count,\n"
    sql_output += "    rating = subquery.avg_rating\n"
    sql_output += "FROM (\n"
    sql_output += "    SELECT item_id, COUNT(*) as review_count, ROUND(AVG(CASE WHEN text LIKE '%five stars%' THEN 5 WHEN text LIKE '%four stars%' THEN 4 WHEN text LIKE '%three stars%' THEN 3 WHEN text LIKE '%two stars%' THEN 2 ELSE CASE WHEN length(text) > 300 THEN 4 WHEN length(text) > 200 THEN 3.5 ELSE 3 END END), 1) as avg_rating\n"
    sql_output += "    FROM reviews\n"
    sql_output += "    GROUP BY item_id\n"
    sql_output += ") as subquery\n"
    sql_output += "WHERE im.item_id = subquery.item_id;\n\n"
    
    sql_output += "COMMIT;\n"
    
    return sql_output

# Generate and save SQL
sql_script = generate_review_sql()
with open('review_insert.sql', 'w') as f:
    f.write(sql_script)

print("Generated SQL insert script for reviews and review metrics.")
print("Output saved to 'review_insert.sql'")
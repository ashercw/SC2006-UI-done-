import spacy 
from word2number import w2n 
from typing import Optional, List, Dict 
 
# Load spaCy model 
nlp = spacy.load("en_core_web_sm") 
 
SERVING_SIZE_MAP = { 
    "tender": 40,          # 1 chicken tender ~40g 
    "cup": 240,            # 1 cup liquid ~240g 
    "slice": 30,           # 1 slice of bread ~30g 
    "can": 350,            # 1 can of soda ~350g 
    "bottle": 500,         # 1 bottle (small) ~500g 
    "piece": 50,           # Average small piece (e.g., fruit) ~50g 
    "tablespoon": 15,      # 1 tablespoon ~15g 
    "teaspoon": 5,         # 1 teaspoon ~5g 
    "oz": 28.35,           # 1 oz ~28.35g 
    "pack": 150,           # 1 pack (e.g., snack) ~150g 
    "bar": 50,             # 1 granola bar ~50g 
    "serving": 100,        # Default serving ~100g 
    "plate": 100           # 1 plate ~300g 
} 
 
 
def get_quantity(token) -> Optional[float]: 
    if token.pos_ == 'NUM': 
        try: 
            return float(w2n.word_to_num(token.text)) 
        except ValueError: 
            return float(token.text) 
    elif token.pos_ == 'DET': 
        return 1.0 if token.text.lower() in {"a", "an"} else 2.0 if token.text.lower() == "some" else None 
    return None 
 
def process_food_tokens(tokens: List[spacy.tokens.token.Token], quantity: Optional[float]) -> Dict[str, Optional[float]]: 
    measurement_type = "" 
    food_name = "" 
    quantity = quantity or 1.0  # Default to 1 if no quantity provided 
 
    for token in tokens: 
        token_text = token.text.lower() 
        if token_text in SERVING_SIZE_MAP and token_text != "grams": 
            measurement_type = token_text 
        elif token_text == "grams": 
            measurement_type = "grams" 
        elif token.pos_ == 'NOUN' or token.pos_ == 'ADJ': 
            food_name += token.text + " " 
 
    food_name = food_name.strip() 
 
    # Use quantity directly if "grams" is specified; otherwise, apply SERVING_SIZE_MAP 
    if measurement_type == "grams": 
        estimated_grams = quantity 
    elif measurement_type in SERVING_SIZE_MAP: 
        estimated_grams = SERVING_SIZE_MAP[measurement_type] * quantity 
    else: 
        estimated_grams = quantity * 100 
 
    return { 
        "food_name": food_name, 
        "quantity": estimated_grams, 
        "measurement_type": measurement_type 
    } 
 
def tokenize_by_quantity(input_text: str) -> List[Dict[str, Optional[float]]]: 
    clean_text = input_text.lower().replace("today i ate", "").replace("i ate", "").replace("i had", "").strip() 
    doc = nlp(clean_text) 
    foods = [] 
    current_quantity = None 
    current_tokens = [] 
 
    for token in doc: 
        if token.pos_ == 'NUM': 
            current_quantity = get_quantity(token) 
        elif token.text.lower() == "grams" and current_quantity is not None: 
            current_tokens.append(token) 
            foods.append(process_food_tokens(current_tokens, current_quantity)) 
            current_tokens = [] 
            current_quantity = None 
        elif token.pos_ in {'NOUN', 'ADJ'}: 
            current_tokens.append(token) 
        elif token.is_punct or token.dep_ == 'cc': 
            if current_tokens: 
                foods.append(process_food_tokens(current_tokens, current_quantity)) 
            current_tokens = [] 
            current_quantity = None 
 
    if current_tokens: 
        foods.append(process_food_tokens(current_tokens, current_quantity)) 
 
    return foods 
 
def process_tokens_to_foods(tokenized_foods: List[Dict[str, Optional[float]]]) -> List[Dict[str, Optional[float]]]: 
    return tokenized_foods
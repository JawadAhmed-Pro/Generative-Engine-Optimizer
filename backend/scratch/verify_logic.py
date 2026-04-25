import re

def score_direct_answer_density(sentences):
    direct_answer_count = 0
    for sentence in sentences:
        words = sentence.strip().split()
        if len(words) < 4:
            continue
        question_starters = {"what", "why", "how", "when", "where", "who", "is", "are", "do", "does"}
        filler_starters = {"however", "moreover", "furthermore", "in", "the", "this", "that"}
        first_word = words[0].lower()
        if first_word not in question_starters and first_word not in filler_starters:
            direct_answer_count += 1

    ratio = direct_answer_count / len(sentences) if sentences else 0
    if ratio >= 0.6: return 100
    elif ratio >= 0.4: return 70
    elif ratio >= 0.2: return 40
    else: return 10

def score_answer_readiness(text):
    sentences = re.split(r'(?<=[.?!])\s+', text.strip())
    qa_pairs = 0
    for i in range(len(sentences) - 1):
        current = sentences[i].strip()
        next_sent = sentences[i + 1].strip()
        next_word_count = len(next_sent.split())
        is_question = current.endswith('?')
        is_valid_answer = 10 <= next_word_count <= 40
        if is_question and is_valid_answer:
            qa_pairs += 1
    if qa_pairs >= 5: return 100
    elif qa_pairs >= 3: return 75
    elif qa_pairs >= 1: return 40
    else: return 0

def score_htag_hierarchy(h1_count, h2_count, h3_count):
    score = 0
    if h1_count == 1:       score += 40
    elif h1_count > 1:      score += 10
    if h2_count >= 2:       score += 40
    if h3_count >= 1:       score += 20
    return min(score, 100)

# Test content
test_text = "What is GEO? Generative Engine Optimization is a new technique to improve visibility in AI responses. How does it work? It works by optimizing content structure and adding clear declarative statements to the text."
sentences = re.split(r'(?<=[.?!])\s+', test_text.strip())

print(f"Direct Answer Density: {score_direct_answer_density(sentences)}")
print(f"Answer Readiness (Q&A Pairs): {score_answer_readiness(test_text)}")
print(f"H-Tag Hierarchy (1 H1, 2 H2, 1 H3): {score_htag_hierarchy(1, 2, 1)}")
print(f"H-Tag Hierarchy (0 H1, 1 H2, 0 H3): {score_htag_hierarchy(0, 1, 0)}")

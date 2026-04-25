import sys
import os
import re

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scoring.rule_based import RuleBasedScorer
from geo_optimizer import GEOOptimizer

print("Script started...")

test_content = """
<h1>The Future of AI Optimization</h1>
<p>AI optimization is the process of improving content for generative engines. It is essential for modern SEO.</p>

<h2>What is GEO?</h2>
<p>Generative Engine Optimization (GEO) involves adjusting website architecture and content to improve visibility in AI responses. It is a new field of digital marketing.</p>

<h2>Why does it matter?</h2>
<p>Search engines are evolving into answer engines. If your content is not optimized for AI, you will lose significant traffic to competitors who are already using these techniques.</p>

<h3>How to optimize?</h3>
<p>You should focus on information density and direct answers. Most AI engines prefer clear, declarative statements that can be easily parsed into their knowledge graphs.</p>

<p>How do I start with GEO? You can start by restructuring your headings and adding schema markup to your most important landing pages immediately.</p>
"""

metadata = {
    'headings': {
        'h1': ['The Future of AI Optimization'],
        'h2': ['What is GEO?', 'Why does it matter?'],
        'h3': ['How to optimize?']
    }
}

def test_scoring():
    scorer = RuleBasedScorer()
    optimizer = GEOOptimizer()
    
    print("--- RuleBasedScorer Analysis ---")
    results = scorer.analyze(test_content, metadata)
    print(f"Structure Score: {results['structure']['score']}")
    print(f"Structure Details: {results['structure']['details']}")
    print(f"Keyword Score: {results['keywords']['score']}")
    print(f"Keyword Details: {results['keywords']['details']}")
    print(f"Readability Score: {results['readability']['score']}")
    print(f"Readability Details: {results['readability']['details']}")
    
    print("\n--- GEOOptimizer Structural Score ---")
    opt_results = optimizer.get_structural_score(test_content)
    print(f"Overall Score: {opt_results['score']}")
    print(f"Breakdown: {opt_results['breakdown']}")

if __name__ == "__main__":
    test_scoring()

import asyncio
import sys
import os

# Set CWD to backend
os.chdir(r'c:\Users\ja358\GEO\GEO\backend')
sys.path.append(os.getcwd())

from scoring.llm_scorer import LLMScorer
from config import settings

async def test_scorer():
    print(f"GEMINI_API_KEY: {'[SET]' if settings.GEMINI_API_KEY else '[NOT SET]'}")
    print(f"GROQ_API_KEY: {'[SET]' if settings.GROQ_API_KEY else '[NOT SET]'}")
    
    if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
        print("🛑 No API keys found. Cannot proceed with LLM analysis.")
        return

    scorer = LLMScorer()
    
    content = """
# Review of Deep Learning Algorithms for Image Classification

Deep learning algorithms have revolutionized the field of image classification, enabling computers to accurately identify and categorize images.

## Key Takeaways
* Deep learning algorithms have achieved state-of-the-art performance in image classification tasks
* Convolutional Neural Networks (CNNs) are a popular choice for image classification

## Convolutional Neural Networks (CNNs)
CNNs are a type of deep learning algorithm that are commonly used for image classification tasks.
Algorithm Accuracy: CNN 95.5%, Traditional Machine Learning 80%.
"""
    
    metadata = {
        'title': 'Review of Deep Learning Algorithms for Image Classification',
        'content_type': 'general',
        'target_keyword': 'Deep Learning Image Classification'
    }
    
    print("\n🚀 Running analysis...")
    result = await scorer.analyze(content, metadata)
    
    import json
    print("\n✅ Analysis Results:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(test_scorer())

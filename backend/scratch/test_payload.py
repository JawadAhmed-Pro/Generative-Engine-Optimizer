import asyncio
from geo_optimizer import geo_optimizer

async def test_rag_payload():
    content = """
    Generative Engine Optimization (GEO) is the next evolution of SEO. It focuses on making content visible to AI search engines. 
    According to a 2024 study by Gartner, 40% of traditional search traffic will shift to AI engines by 2026. 
    This is a massive shift. To prepare, marketers must use structured data, hard grounding with statistics, and inverted pyramid structures.
    Deep learning algorithms, particularly transformers, power these engines. They look for specific syntax.
    """
    
    print("Testing Split-Payload Generation...")
    result = await geo_optimizer.generate_rag_payload(content, target_keyword="Generative Engine Optimization strategies")
    print("\n--- RAG Payload Result ---")
    print(result)

if __name__ == "__main__":
    asyncio.run(test_rag_payload())

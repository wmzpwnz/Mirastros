"""Test Dream Interpretation Service"""

import asyncio
from app.services.dream import DreamService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.core.database import get_db


async def test_dream_interpretation():
    """Test dream interpretation"""
    print("🌙 Testing Dream Interpretation Service\n")
    
    # Initialize services
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    dream_service = DreamService(llm_service=llm_service, rag_service=rag_service)
    
    # Load AI model
    print("Loading AI model...")
    await llm_service.load_model()
    print("✅ AI model loaded\n")
    
    # Test dream description
    dream_description = """
    I was flying over a vast ocean under a full moon. The water was calm and reflected 
    the moonlight like a mirror. Suddenly, I saw a golden bird flying beside me, 
    guiding me towards a distant island. On the island, there was a beautiful temple 
    with white columns. As I approached, I felt a deep sense of peace and wonder. 
    Inside the temple, I found a book with golden pages, but when I tried to read it, 
    I woke up.
    """
    
    print("Dream Description:")
    print(dream_description)
    print("\n" + "="*80 + "\n")
    
    # Get database session
    async for db in get_db():
        try:
            # Interpret dream
            print("Interpreting dream...\n")
            
            user_context = {
                "zodiac_sign": "Pisces",
                "birth_date": "1990-03-15"
            }
            
            result = await dream_service.interpret_dream(
                db=db,
                dream_description=dream_description,
                user_context=user_context,
                user_id=None  # Don't store in database for test
            )
            
            # Display results
            print("✨ DREAM INTERPRETATION RESULTS ✨\n")
            
            print("📖 Identified Symbols:")
            for symbol in result["symbols"]:
                print(f"  • {symbol['symbol'].title()}: {symbol['meaning']}")
            print()
            
            print("🎭 Themes:")
            for theme in result["themes"]:
                print(f"  • {theme.title()}")
            print()
            
            print("💭 Emotions:")
            for emotion in result["emotions"]:
                print(f"  • {emotion.title()}")
            print()
            
            print("🔮 Interpretation:")
            print(result["interpretation"])
            print()
            
            print("⏰ Timestamp:", result["timestamp"])
            
        finally:
            await db.close()
            break


async def test_dream_dictionary():
    """Test dream dictionary"""
    print("\n" + "="*80 + "\n")
    print("📚 Testing Dream Dictionary\n")
    
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    dream_service = DreamService(llm_service=llm_service, rag_service=rag_service)
    
    # Get all symbols
    symbols = dream_service.get_dream_dictionary()
    print(f"Total symbols in dictionary: {len(symbols)}\n")
    
    # Show first 5 symbols
    print("Sample symbols:")
    for symbol in symbols[:5]:
        print(f"  • {symbol['symbol'].title()} ({symbol['category']})")
        print(f"    {symbol['meaning']}")
        print()
    
    # Test search
    print("Searching for 'water'...")
    results = dream_service.search_dream_symbols("water")
    print(f"Found {len(results)} results:")
    for result in results:
        print(f"  • {result['symbol'].title()}: {result['meaning']}")
    print()


async def main():
    """Run all tests"""
    try:
        await test_dream_interpretation()
        await test_dream_dictionary()
        print("\n✅ All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

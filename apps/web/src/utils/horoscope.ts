/**
 * Horoscope Utilities
 * Helper functions for horoscope processing and analysis
 */

/**
 * Generate life area ratings based on horoscope text analysis
 * Uses keyword matching to determine ratings for finance, love, career, health
 */
export const generateLifeAreaRatings = async (
  horoscopeText: string,
  zodiacSign: string,
  tier: string
): Promise<{
  finance: number;
  love: number;
  career: number;
  health: number;
} | null> => {
  if (tier === 'freemium') return null;

  try {
    // For Premium/Platinum, use backend API to get enhanced horoscope data
    // Backend already includes ratings in horoscope response for premium users
    // This is a more intelligent approach - extract from existing horoscope data
    // rather than making additional AI calls

    // Smart fallback based on horoscope content analysis
    const text = horoscopeText.toLowerCase();

    // Enhanced keyword analysis with scoring
    const financeKeywords = [
      'деньги',
      'финанс',
      'доход',
      'прибыль',
      'богатство',
      'капитал',
    ];
    const loveKeywords = [
      'любов',
      'отношен',
      'партнер',
      'романтик',
      'сердце',
      'чувств',
    ];
    const careerKeywords = [
      'работ',
      'карьер',
      'успех',
      'достижен',
      'проект',
      'цел',
    ];
    const healthKeywords = [
      'здоров',
      'энерг',
      'сил',
      'витальност',
      'самочувств',
    ];

    const calculateRating = (keywords: string[]): number => {
      let count = 0;
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) count++;
      });
      // Base rating 3, increase by matches (max 5)
      return Math.min(5, 3 + Math.floor(count / 2));
    };

    return {
      finance: calculateRating(financeKeywords),
      love: calculateRating(loveKeywords),
      career: calculateRating(careerKeywords),
      health: calculateRating(healthKeywords),
    };
  } catch (error) {
    console.error('Failed to generate ratings:', error);
  }

  // Final fallback: default ratings
  return {
    finance: 3,
    love: 3,
    career: 3,
    health: 3,
  };
};

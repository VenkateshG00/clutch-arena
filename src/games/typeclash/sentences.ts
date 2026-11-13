export interface Sentence {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const sentences: Sentence[] = [
  // Easy - no special characters, common words
  { text: "the quick brown fox jumps over the lazy dog", difficulty: 'easy' },
  { text: "practice makes perfect in every game you play", difficulty: 'easy' },
  { text: "keep your eyes on the screen and type fast", difficulty: 'easy' },
  { text: "victory belongs to those who never give up", difficulty: 'easy' },
  { text: "gaming is more fun when you play with friends", difficulty: 'easy' },
  { text: "the best players train hard every single day", difficulty: 'easy' },
  { text: "focus on accuracy first then build up speed", difficulty: 'easy' },
  { text: "a true champion rises after every defeat", difficulty: 'easy' },
  { text: "type each word carefully and watch your score grow", difficulty: 'easy' },
  { text: "the arena awaits those brave enough to enter", difficulty: 'easy' },
  { text: "speed and precision are the keys to victory", difficulty: 'easy' },
  { text: "never stop improving your skills on the battlefield", difficulty: 'easy' },

  // Medium - longer sentences, less common words
  { text: "the leaderboard updates in real time so every second counts", difficulty: 'medium' },
  { text: "climbing the ranks requires dedication and consistent practice", difficulty: 'medium' },
  { text: "competitive gaming demands both quick reflexes and strategic thinking", difficulty: 'medium' },
  { text: "your keyboard is your weapon and each keystroke is a battle cry", difficulty: 'medium' },
  { text: "mastering the fundamentals will give you an unshakeable foundation", difficulty: 'medium' },
  { text: "the difference between good and great is relentless determination", difficulty: 'medium' },
  { text: "every millisecond saved brings you closer to the top of the rankings", difficulty: 'medium' },
  { text: "champions are not born overnight they are forged through persistence", difficulty: 'medium' },
  { text: "the clutch moment separates legends from ordinary players", difficulty: 'medium' },
  { text: "analyze your mistakes and transform them into stepping stones", difficulty: 'medium' },
  { text: "rhythm and flow are essential for maintaining peak typing performance", difficulty: 'medium' },

  // Hard - special characters, numbers, mixed case
  { text: "Player_1 scored 2,450 points in the Grand Finals!", difficulty: 'hard' },
  { text: "The match starts at 8:30 PM (EST) - don't be late!", difficulty: 'hard' },
  { text: "GG! Team Alpha won 3-2 in an incredible best-of-5 series.", difficulty: 'hard' },
  { text: "Use WASD + Shift to sprint; press E to interact & Q to use items.", difficulty: 'hard' },
  { text: "The update (v2.4.1) fixed 17 bugs and added 3 new maps.", difficulty: 'hard' },
  { text: "\"Clutch or kick!\" - the classic phrase every gamer knows & loves.", difficulty: 'hard' },
  { text: "Server ping: 24ms | FPS: 144 | Resolution: 1920x1080 @ 60Hz", difficulty: 'hard' },
  { text: "Top 5% of players earn the Diamond rank; only 0.1% reach Elite!", difficulty: 'hard' },
  { text: "Config: sensitivity = 2.5, DPI = 800, polling rate = 1000Hz.", difficulty: 'hard' },
  { text: "The $10,000 prize pool is split 50/30/20 among the top 3 teams.", difficulty: 'hard' },
]

export function getShuffledSentences(): Sentence[] {
  const shuffled = [...sentences]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getSentencesByDifficulty(difficulty?: number): Sentence[] {
  if (!difficulty || difficulty <= 1) {
    return sentences.filter((s) => s.difficulty === 'easy')
  }
  if (difficulty <= 2) {
    return sentences.filter((s) => s.difficulty !== 'hard')
  }
  return [...sentences]
}

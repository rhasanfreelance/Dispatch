type RankableTweet = {
  createdAt: Date;
  authorId: string;
  likeCount: number;
  commentCount: number;
};

const GRAVITY = 1.6;
const LIKE_WEIGHT = 1;
const COMMENT_WEIGHT = 2.2;
const FOLLOWING_BOOST = 1.8;
const FRESH_POST_WINDOW_MS = 20 * 60 * 1000;
const FRESH_POST_BOOST = 1.3;

export function scoreTweet(
  tweet: RankableTweet,
  opts: { followingIds: Set<string>; now?: number }
) {
  const now = opts.now ?? Date.now();
  const ageHours = Math.max(0, (now - tweet.createdAt.getTime()) / 3_600_000);

  const engagement = LIKE_WEIGHT * tweet.likeCount + COMMENT_WEIGHT * tweet.commentCount;
  const engagementScore = Math.log10(engagement + 1) + 1;

  const timeDecay = 1 / Math.pow(ageHours + 2, GRAVITY);

  let score = engagementScore * timeDecay;

  if (opts.followingIds.has(tweet.authorId)) {
    score *= FOLLOWING_BOOST;
  }

  if (now - tweet.createdAt.getTime() < FRESH_POST_WINDOW_MS) {
    score *= FRESH_POST_BOOST;
  }

  return score;
}

export function rankTweets<T extends RankableTweet>(
  tweets: T[],
  opts: { followingIds: Set<string> }
): T[] {
  const now = Date.now();

  return [...tweets]
    .map((tweet) => ({ tweet, score: scoreTweet(tweet, { followingIds: opts.followingIds, now }) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.tweet);
}

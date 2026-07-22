import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const bios = [
  "Building cool things with Next.js.",
  "Coffee. Code. Repeat.",
  "Frontend developer.",
  "Backend engineer.",
  "Loves TypeScript.",
  "Open source enthusiast.",
  "Photographer & traveler.",
  "UI/UX Designer.",
  "Just another developer.",
  "Learning something every day.",
  "Football fan ⚽",
  "Cricket all day 🏏",
  "Always shipping.",
  "React enjoyer.",
  "Minimalist.",
  "Tech + Coffee.",
  "Nature lover.",
  "Dream. Build. Repeat.",
];

const bangladeshiNames = [
  "zarif",
  "Tanvir",
  "Sabbir",
  "Hasib",
  "Nafis",
  "Mahmud",
  "Rakib",
  "Sakib",
  "Tamim",
  "Nayeem",
  "Nusrat",
  "Mim",
  "Sadia",
  "Tasnim",
  "Ayesha",
  "Farzana",
  "Shanto",
  "Zarif",
  "Fahim",
  "Rifat",
];

async function main() {
  console.log("🌱 Clearing database...");

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleared");

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [];

  for (let i = 0; i < 75; i++) {
    let firstName: string;

    if (Math.random() < 0.35) {
      firstName =
        bangladeshiNames[Math.floor(Math.random() * bangladeshiNames.length)];
    } else {
      firstName = faker.person.firstName();
    }

    const lastName = faker.person.lastName();

    const username = (
      firstName +
      lastName +
      faker.number.int({ min: 1, max: 999 })
    )
      .replace(/\s+/g, "")
      .toLowerCase();

    const user = await prisma.user.create({
      data: {
        username,
        displayName: `${firstName} ${lastName}`,
        email: `${username}@dispatch.dev`,
        passwordHash,
        bio: faker.helpers.arrayElement(bios),
        avatarSeed: username,
        createdAt: faker.date.past({
          years: 1,
        }),
      },
    });

    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // =================== TWEETS ===================

  const tweetStarters = [
    "Finally finished",
    "Working on",
    "Just shipped",
    "Anyone using",
    "Can't believe",
    "Spent all day fixing",
    "Trying out",
    "Currently building",
    "Today's goal:",
    "Hot take:",
    "Random thought:",
    "Coffee +",
    "Weekend project:",
    "Just learned",
    "Feeling excited about",
  ];

  const tweetSubjects = [
    "Next.js 14",
    "Prisma",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "a portfolio project",
    "my startup",
    "dark mode",
    "authentication",
    "responsive design",
    "this bug",
    "PostgreSQL",
    "AI",
    "a new feature",
    "deployment",
    "Vercel",
    "Docker",
    "Node.js",
  ];

  const tweetEndings = [
    "today.",
    "and it actually works.",
    "after 6 hours 😂",
    "what do you think?",
    "loving it so far.",
    "this was harder than expected.",
    "can't wait to launch.",
    "wish me luck.",
    "feels amazing.",
    "never doing that again.",
    "small wins matter.",
    "life is good.",
    "time for coffee ☕",
    "back to work.",
  ];

  const tweets = [];

  for (let i = 0; i < 500; i++) {
    const author = users[Math.floor(Math.random() * users.length)];

    const content =
      `${faker.helpers.arrayElement(tweetStarters)} ` +
      `${faker.helpers.arrayElement(tweetSubjects)} ` +
      `${faker.helpers.arrayElement(tweetEndings)}`;

    const tweet = await prisma.tweet.create({
      data: {
        authorId: author.id,
        content,
        createdAt: faker.date.recent({
          days: 180,
        }),
      },
    });

    tweets.push(tweet);
  }

  console.log(`✅ Created ${tweets.length} dispatches`);

  // ================= COMMENTS =================

  let totalComments = 0;

  for (const tweet of tweets) {
    const commentCount = faker.number.int({
      min: 0,
      max: 8,
    });

    for (let i = 0; i < commentCount; i++) {
      const author = users[Math.floor(Math.random() * users.length)];

      await prisma.comment.create({
        data: {
          authorId: author.id,
          tweetId: tweet.id,
          content: faker.helpers.arrayElement(commentTemplates),
          createdAt: faker.date.between({
            from: tweet.createdAt,
            to: new Date(),
          }),
        },
      });

      totalComments++;
    }
  }

  console.log(`✅ Created ${totalComments} comments`);

  // ================= LIKES =================

  let totalLikes = 0;

  for (const tweet of tweets) {
    const shuffledUsers = faker.helpers.shuffle([...users]);

    const likeCount = faker.number.int({
      min: 0,
      max: Math.min(30, users.length),
    });

    for (const user of shuffledUsers.slice(0, likeCount)) {
      await prisma.like.create({
        data: {
          tweetId: tweet.id,
          userId: user.id,
        },
      });

      totalLikes++;
    }
  }

  console.log(`✅ Created ${totalLikes} likes`);

  // ================= FOLLOWS =================

  let totalFollows = 0;

  for (const user of users) {
    const others = users.filter((u) => u.id !== user.id);

    const shuffled = faker.helpers.shuffle(others);

    const followCount = faker.number.int({
      min: 5,
      max: 20,
    });

    for (const target of shuffled.slice(0, followCount)) {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: target.id,
        },
      });

      totalFollows++;
    }
  }

  console.log(`✅ Created ${totalFollows} follows`);

  console.log("");
  console.log("Example account:");
  console.log("mhzarif16");
  console.log("Password: password123");
}

const commentTemplates = [
  "Totally agree!",
  "Nice work 👏",
  "This helped a lot.",
  "Couldn't agree more.",
  "Interesting point.",
  "That's awesome!",
  "Looks great 🔥",
  "Keep it up!",
  "Exactly what I was thinking.",
  "Thanks for sharing.",
  "Love this!",
  "Well said.",
  "This made my day 😂",
  "Haha true.",
  "Respect 💯",
  "I needed this today.",
  "Where can I learn more?",
  "Can you explain this?",
  "Same here.",
  "This deserves more attention.",
  "Amazing project!",
  "Nice UI!",
  "This is underrated.",
  "Good luck!",
  "That's impressive.",
];

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

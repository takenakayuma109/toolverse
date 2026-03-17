import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@toolverse.app" },
    update: {},
    create: {
      email: "admin@toolverse.app",
      name: "Toolverse Admin",
      role: "ADMIN",
      hashedPassword,
      emailVerified: new Date(),
      locale: "en",
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // 2. Create creator profile for admin
  const creatorProfile = await prisma.creatorProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      displayName: "Toolverse Official",
      bio: "The official Toolverse team — building the future of web-based tools and AI-powered workflows.",
      website: "https://toolverse.app",
      tier: "VERIFIED",
    },
  });

  console.log(`Created creator profile: ${creatorProfile.displayName}`);

  // 3. Create sample tools
  const tools = await Promise.all([
    prisma.tool.upsert({
      where: { slug: "smartwrite-ai" },
      update: {},
      create: {
        name: "SmartWrite AI",
        slug: "smartwrite-ai",
        description:
          "AI-powered writing assistant that helps you draft, edit, and polish content in seconds.",
        longDescription:
          "SmartWrite AI leverages large language models to help you write better, faster. Whether you need blog posts, emails, documentation, or creative writing, SmartWrite adapts to your tone and style. Features include grammar correction, tone adjustment, content expansion, and summarization.",
        icon: "https://toolverse.app/icons/smartwrite-ai.png",
        category: "ai",
        pricingType: "freemium",
        price: 9.99,
        currency: "USD",
        period: "monthly",
        rating: 4.7,
        reviewCount: 342,
        userCount: 12850,
        isOfficial: true,
        isFeatured: true,
        isTrending: true,
        creatorId: adminUser.id,
        tags: ["writing", "ai", "content", "editor", "productivity"],
        screenshots: [
          "https://toolverse.app/screenshots/smartwrite-1.png",
          "https://toolverse.app/screenshots/smartwrite-2.png",
        ],
        status: "PUBLISHED",
        visibility: "PUBLIC",
        serviceUrl: "https://smartwrite.toolverse.app",
        authMethod: "API_KEY",
      },
    }),

    prisma.tool.upsert({
      where: { slug: "devflow-ci" },
      update: {},
      create: {
        name: "DevFlow CI",
        slug: "devflow-ci",
        description:
          "Streamlined CI/CD pipeline manager with real-time build logs and deployment tracking.",
        longDescription:
          "DevFlow CI is a lightweight continuous integration and deployment tool built for modern development teams. Connect your Git repositories, define pipelines with a simple YAML config, and get instant feedback on every push. Supports Docker, Kubernetes, and serverless deployments out of the box.",
        icon: "https://toolverse.app/icons/devflow-ci.png",
        category: "development",
        pricingType: "subscription",
        price: 19.0,
        currency: "USD",
        period: "monthly",
        rating: 4.5,
        reviewCount: 187,
        userCount: 5430,
        isOfficial: false,
        isFeatured: true,
        isTrending: false,
        creatorId: adminUser.id,
        tags: ["ci-cd", "devops", "deployment", "automation", "git"],
        screenshots: [
          "https://toolverse.app/screenshots/devflow-1.png",
          "https://toolverse.app/screenshots/devflow-2.png",
        ],
        status: "PUBLISHED",
        visibility: "PUBLIC",
        serviceUrl: "https://devflow.toolverse.app",
        authMethod: "OAUTH2",
      },
    }),

    prisma.tool.upsert({
      where: { slug: "taskpilot" },
      update: {},
      create: {
        name: "TaskPilot",
        slug: "taskpilot",
        description:
          "Kanban-style project management with AI-powered task prioritization and time estimates.",
        longDescription:
          "TaskPilot brings smart project management to your browser. Drag-and-drop Kanban boards, automatic task prioritization using machine learning, and built-in time tracking help your team stay focused. Integrates with Slack, GitHub, and Google Calendar for seamless workflows.",
        icon: "https://toolverse.app/icons/taskpilot.png",
        category: "productivity",
        pricingType: "freemium",
        price: 7.99,
        currency: "USD",
        period: "monthly",
        rating: 4.3,
        reviewCount: 256,
        userCount: 9200,
        isOfficial: false,
        isFeatured: false,
        isTrending: true,
        creatorId: adminUser.id,
        tags: ["project-management", "kanban", "tasks", "team", "productivity"],
        screenshots: [
          "https://toolverse.app/screenshots/taskpilot-1.png",
          "https://toolverse.app/screenshots/taskpilot-2.png",
          "https://toolverse.app/screenshots/taskpilot-3.png",
        ],
        status: "PUBLISHED",
        visibility: "PUBLIC",
        serviceUrl: "https://taskpilot.toolverse.app",
        authMethod: "JWT",
      },
    }),

    prisma.tool.upsert({
      where: { slug: "chartlens-analytics" },
      update: {},
      create: {
        name: "ChartLens Analytics",
        slug: "chartlens-analytics",
        description:
          "Beautiful, real-time analytics dashboards with zero-config data connectors.",
        longDescription:
          "ChartLens Analytics transforms raw data into stunning, interactive dashboards. Connect to PostgreSQL, MySQL, BigQuery, or upload CSV files — ChartLens auto-detects schemas and suggests visualizations. Share dashboards with your team or embed them in your app with a single script tag.",
        icon: "https://toolverse.app/icons/chartlens.png",
        category: "analytics",
        pricingType: "free",
        rating: 4.1,
        reviewCount: 98,
        userCount: 3750,
        isOfficial: true,
        isFeatured: false,
        isTrending: false,
        creatorId: adminUser.id,
        tags: ["analytics", "charts", "dashboard", "data", "visualization"],
        screenshots: [
          "https://toolverse.app/screenshots/chartlens-1.png",
          "https://toolverse.app/screenshots/chartlens-2.png",
        ],
        status: "PUBLISHED",
        visibility: "PUBLIC",
        serviceUrl: "https://chartlens.toolverse.app",
        authMethod: "NONE",
      },
    }),
  ]);

  console.log(`Created ${tools.length} sample tools`);

  // 4. Create billing plans
  const freePlan = await prisma.billingPlan.upsert({
    where: { id: "plan_free" },
    update: {},
    create: {
      id: "plan_free",
      name: "Free",
      price: 0,
      currency: "USD",
      period: "monthly",
      features: JSON.parse(
        JSON.stringify([
          "Up to 5 installed tools",
          "Basic analytics",
          "Community support",
          "Public tool access",
        ])
      ),
      isActive: true,
    },
  });

  const proPlan = await prisma.billingPlan.upsert({
    where: { id: "plan_pro" },
    update: {},
    create: {
      id: "plan_pro",
      name: "Pro",
      price: 14.99,
      currency: "USD",
      period: "monthly",
      features: JSON.parse(
        JSON.stringify([
          "Unlimited installed tools",
          "Advanced analytics & insights",
          "Priority support",
          "Private tool access",
          "Custom project workspaces",
          "API access",
        ])
      ),
      isActive: true,
    },
  });

  console.log(`Created billing plans: ${freePlan.name}, ${proPlan.name}`);

  // 5. Seed PlatformConfig (markup rate)
  await prisma.platformConfig.upsert({
    where: { key: "markup_rate" },
    update: {},
    create: { key: "markup_rate", value: "0.2" },
  });

  console.log("Created platform config: markup_rate = 0.2 (20%)");

  // 6. Seed ApiProviderConfig (LLM provider pricing)
  const providerConfigs = [
    { provider: "openai", model: "gpt-4o", inputPricePerM: 2.5, outputPricePerM: 10.0 },
    { provider: "openai", model: "gpt-4o-mini", inputPricePerM: 0.15, outputPricePerM: 0.6 },
    { provider: "anthropic", model: "claude-sonnet-4-20250514", inputPricePerM: 3.0, outputPricePerM: 15.0 },
    { provider: "anthropic", model: "claude-haiku-4-5-20251001", inputPricePerM: 0.8, outputPricePerM: 4.0 },
    { provider: "google", model: "gemini-1.5-pro", inputPricePerM: 1.25, outputPricePerM: 5.0 },
    { provider: "google", model: "gemini-1.5-flash", inputPricePerM: 0.075, outputPricePerM: 0.3 },
  ];

  for (const config of providerConfigs) {
    await prisma.apiProviderConfig.upsert({
      where: { provider_model: { provider: config.provider, model: config.model } },
      update: { inputPricePerM: config.inputPricePerM, outputPricePerM: config.outputPricePerM },
      create: config,
    });
  }

  console.log(`Created ${providerConfigs.length} API provider configs`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

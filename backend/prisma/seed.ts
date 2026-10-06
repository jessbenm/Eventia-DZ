import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

config();

const prisma = new PrismaClient();

const ORAN_EVENTS = [
  {
    title: "Festival Raï d'Oran 2025",
    description: "Le plus grand festival raï d'Algérie revient à Oran ! Une nuit inoubliable avec les plus grands artistes de la scène raï et chaabi. Ambiance électrisante au stade Ahmed Zabana.",
    date: new Date("2025-08-15"),
    time: "20:00",
    endTime: "02:00",
    duration: "6 heures",
    location: "Stade Ahmed Zabana, Oran",
    city: "Oran",
    capacity: 5000,
    price: 3500,
    mainImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop&auto=format",
    ],
    tags: ["Raï", "Musique", "Festival"],
    featured: true,
    rating: 4.9,
    reviewsCount: 1247,
    program: [
      { time: "20:00", title: "Ouverture", speaker: "DJ Oranais" },
      { time: "21:30", title: "Concert Raï", speaker: "Artistes invités" },
      { time: "00:00", title: "Finale", speaker: "Tous les artistes" },
    ],
  },
  {
    title: "Conférence Tech Oran Innovation",
    description: "Découvrez les dernières innovations technologiques à Oran. Startups, IA, fintech et entrepreneuriat au centre de congrès Mohamed Benahmed.",
    date: new Date("2025-07-20"),
    time: "09:00",
    endTime: "18:00",
    duration: "9 heures",
    location: "Centre de Congrès Mohamed Benahmed, Oran",
    city: "Oran",
    capacity: 800,
    price: 8000,
    mainImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop&auto=format"],
    tags: ["Tech", "Innovation", "Startup"],
    featured: true,
    rating: 4.7,
    reviewsCount: 523,
    program: [
      { time: "09:00", title: "Accueil", speaker: "Organisateurs" },
      { time: "10:00", title: "Keynote IA", speaker: "Experts locaux" },
      { time: "14:00", title: "Pitch Startup", speaker: "Entrepreneurs" },
    ],
  },
  {
    title: "Gala de Danse Traditionnelle Oranaise",
    description: "Une soirée exceptionnelle célébrant la danse traditionnelle oranaise au Théâtre Régional d'Oran. Costumes authentiques et musique live.",
    date: new Date("2025-06-28"),
    time: "20:00",
    endTime: "22:30",
    duration: "2h30",
    location: "Théâtre Régional d'Oran",
    city: "Oran",
    capacity: 1200,
    price: 2500,
    mainImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=400&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop&auto=format"],
    tags: ["Culture", "Danse", "Tradition"],
    featured: false,
    rating: 4.8,
    reviewsCount: 312,
    program: [
      { time: "20:00", title: "Ouverture", speaker: "Orchestre" },
      { time: "21:00", title: "Spectacle principal", speaker: "Troupe Oranaise" },
    ],
  },
  {
    title: "Festival Gastronomique du Port d'Oran",
    description: "Savourez la cuisine oranaise au Vieux Port. Poisson frais, chorba, makroud et spécialités méditerranéennes avec les meilleurs chefs locaux.",
    date: new Date("2025-09-05"),
    time: "11:00",
    endTime: "22:00",
    duration: "11 heures",
    location: "Vieux Port d'Oran, Front de Mer",
    city: "Oran",
    capacity: 3000,
    price: 1500,
    mainImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&auto=format"],
    tags: ["Gastronomie", "Cuisine", "Port"],
    featured: true,
    rating: 4.6,
    reviewsCount: 890,
    program: [
      { time: "11:00", title: "Ouverture des stands", speaker: "Chefs locaux" },
      { time: "14:00", title: "Démonstration culinaire", speaker: "Maîtres cuisiniers" },
    ],
  },
  {
    title: "Startup Weekend Oran",
    description: "54 heures pour créer votre startup à Oran. Rejoignez développeurs, designers et entrepreneurs au Technopole d'Oran.",
    date: new Date("2025-10-10"),
    time: "17:00",
    endTime: "21:00",
    duration: "54 heures",
    location: "Technopole d'Oran, Es Senia",
    city: "Oran",
    capacity: 300,
    price: 4500,
    mainImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop&auto=format"],
    tags: ["Startup", "Business", "Innovation"],
    featured: false,
    rating: 4.5,
    reviewsCount: 178,
    program: [
      { time: "17:00", title: "Pitches d'idées", speaker: "Participants" },
      { time: "Dim 17:00", title: "Pitch final", speaker: "Jury" },
    ],
  },
  {
    title: "Nuit des Arts — Musée d'Art Moderne d'Oran",
    description: "Découvrez le patrimoine artistique oranais lors d'une nocturne exceptionnelle au MAMO. Expositions, performances et visites guidées.",
    date: new Date("2025-07-05"),
    time: "20:00",
    endTime: "00:00",
    duration: "4 heures",
    location: "Musée d'Art Moderne d'Oran (MAMO)",
    city: "Oran",
    capacity: 500,
    price: 1200,
    mainImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1499626399213-c01af9f7c2d4?w=600&h=400&fit=crop&auto=format"],
    tags: ["Art", "Culture", "Musée"],
    featured: false,
    rating: 4.9,
    reviewsCount: 445,
    program: [
      { time: "20:00", title: "Visite libre", speaker: "Staff" },
      { time: "22:00", title: "Performance artistique", speaker: "Artistes locaux" },
    ],
  },
];

async function main() {
  console.log("🌱 Seed EVENTIA — Oran, Algérie...");

  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 12);
  const userPassword = await bcrypt.hash(process.env.USER_PASSWORD || "User123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@eventia.dz",
      passwordHash: adminPassword,
      firstName: "Nahid",
      lastName: "Admin",
      phone: "+213 555 123 456",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: process.env.USER_EMAIL || "sophie.martin@email.dz",
      passwordHash: userPassword,
      firstName: "Amira",
      lastName: "Benali",
      phone: "+213 555 987 654",
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    },
  });

  for (const evt of ORAN_EVENTS) {
    await prisma.event.create({
      data: {
        ...evt,
        remainingSeats: evt.capacity - Math.floor(Math.random() * 200),
        status: "PUBLISHED",
        organizerId: admin.id,
        category: "Événement",
      },
    });
  }

  console.log("✅ Admin:", admin.email, "/ Admin123!");
  console.log("✅ User:", user.email, "/ User123!");
  console.log(`✅ ${ORAN_EVENTS.length} événements à Oran créés`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

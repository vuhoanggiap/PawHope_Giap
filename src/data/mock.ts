export type PetSpecies = "DOG" | "CAT";
export type PetGender = "MALE" | "FEMALE";

export interface MockPet {
  id: number;
  name: string;
  species: PetSpecies;
  breed: string;
  ageYears: number;
  gender: PetGender;
  description: string;
  healthNotes: string;
  imageUrl: string;
  status: "AVAILABLE_FOR_ADOPTION";
}

export interface MockStory {
  id: number;
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  imageUrl: string;
  tag: "RESCUE" | "ADOPTED" | "COMMUNITY";
}

export interface MockArticle {
  id: number;
  slug: string;
  title: string;
  category: "Dog Care" | "Cat Care" | "Adoption Tips" | "Health";
  excerpt: string;
  body: string;
  imageUrl: string;
  readMinutes: number;
}

export interface MockGuideline {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  priority: number;
}

export const organization = {
  name: "PawsHopeNet",
  tagline: "Rescue & Adopt",
  hotline: "+84 988 015 445",
  email: "contact@pawshope.net",
  address: "Hanoi, Vietnam",
  mission:
    "Born from unconditional love, we focus on three pillars: emergency rescue, medical care, and finding forever homes.",
  facebook: "https://facebook.com/pawshope",
  stats: {
    rescues: 1500,
    adoptions: 850,
    inCare: 920,
  },
};

export const mockPets: MockPet[] = [
  {
    id: 1,
    name: "Avocado",
    species: "DOG",
    breed: "Mixed breed",
    ageYears: 2,
    gender: "FEMALE",
    description: "Gentle, people-loving, fully vaccinated and spayed.",
    healthNotes: "Vaccinated · Spayed · Heartworm negative",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 2,
    name: "Mochi",
    species: "CAT",
    breed: "Domestic shorthair",
    ageYears: 1,
    gender: "MALE",
    description: "Playful and curious. Gets along well with other cats.",
    healthNotes: "Vaccinated · Neutered",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 3,
    name: "Milo",
    species: "DOG",
    breed: "Corgi mix",
    ageYears: 3,
    gender: "MALE",
    description: "Energetic walker, great with kids, crate trained.",
    healthNotes: "Vaccinated · Neutered · Microchipped",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 4,
    name: "Luna",
    species: "CAT",
    breed: "Tabby",
    ageYears: 4,
    gender: "FEMALE",
    description: "Calm indoor cat, prefers a quiet home.",
    healthNotes: "Vaccinated · Spayed · FIV/FeLV negative",
    imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 5,
    name: "Buddy",
    species: "DOG",
    breed: "Golden Retriever mix",
    ageYears: 5,
    gender: "MALE",
    description: "Loyal companion, knows basic commands, leash trained.",
    healthNotes: "Vaccinated · Neutered",
    imageUrl: "https://images.unsplash.com/photo-1558787533-7ed468da1fd0?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 6,
    name: "Pearl",
    species: "CAT",
    breed: "Siamese mix",
    ageYears: 2,
    gender: "FEMALE",
    description: "Vocal and affectionate. Best as the only pet.",
    healthNotes: "Vaccinated · Spayed",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 7,
    name: "Rocky",
    species: "DOG",
    breed: "Terrier mix",
    ageYears: 1,
    gender: "MALE",
    description: "Young and eager to learn. Needs an active family.",
    healthNotes: "Vaccinated · Pending neuter",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
  {
    id: 8,
    name: "Coco",
    species: "CAT",
    breed: "Black domestic",
    ageYears: 3,
    gender: "FEMALE",
    description: "Sweet lap cat, litter box trained, indoor only.",
    healthNotes: "Vaccinated · Spayed",
    imageUrl: "https://images.unsplash.com/photo-1511048931-1ee9d7741a9a?w=600",
    status: "AVAILABLE_FOR_ADOPTION",
  },
];

export const mockStories: MockStory[] = [
  {
    id: 1,
    slug: "coffee-winter-rescue",
    title: "Coffee's journey back from a cold winter night",
    date: "Apr 15, 2026",
    summary:
      "Coffee was found severely emaciated. After three months of intensive care, she is ready for a new chapter.",
    body: "Volunteers found Coffee near an industrial zone during a cold snap. She weighed less than half of a healthy adult cat. Our vet team stabilized her, treated infections, and placed her in a foster home where she learned to trust humans again.\n\nToday Coffee is playful, purrs loudly, and loves sunny windowsills. She is looking for a patient adopter who can continue her recovery journey.",
    imageUrl: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=800",
    tag: "RESCUE",
  },
  {
    id: 2,
    slug: "mochi-new-home",
    title: "Mochi finds a forever home in Da Lat",
    date: "Apr 10, 2026",
    summary:
      "A heartfelt update from the family who adopted Mochi after nearly a year at the shelter.",
    body: "When the Tran family first met Mochi, he hid under a blanket for the entire visit. One year later, he sleeps on their bed and greets every guest at the door.\n\nAdoption is not always instant magic — sometimes it is quiet patience. Mochi's story reminds us why home visits and follow-ups matter.",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    tag: "ADOPTED",
  },
  {
    id: 3,
    slug: "warm-coats-campaign",
    title: "Warm Coats for Pups — community knit-a-thon",
    date: "Apr 5, 2026",
    summary:
      "Over 200 handmade sweaters were donated by volunteers for dogs at the sanctuary.",
    body: "When temperatures dropped unexpectedly, our community responded within 48 hours. Knitters across the city sent boxes of sweaters sized for puppies to senior dogs.\n\nEvery coat came with a handwritten note. Events like this keep our animals comfortable and remind the team that rescue is a shared responsibility.",
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
    tag: "COMMUNITY",
  },
];

export const mockArticles: MockArticle[] = [
  {
    id: 1,
    slug: "first-week-with-adopted-dog",
    title: "The first week with your newly adopted dog",
    category: "Adoption Tips",
    excerpt: "Set routines, safe spaces, and realistic expectations for a smooth transition.",
    body: "Bring your dog home during a quiet weekend. Prepare a crate or gated area, keep walks short, and introduce family members one at a time.\n\nAvoid overwhelming social visits in week one. Consistent feeding times and gentle training build trust faster than constant stimulation.",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    readMinutes: 6,
  },
  {
    id: 2,
    slug: "indoor-enrichment-for-cats",
    title: "Indoor enrichment ideas for happy cats",
    category: "Cat Care",
    excerpt: "Vertical space, puzzle feeders, and play sessions that prevent boredom.",
    body: "Cats need hunting simulations even indoors. Rotate toys weekly, use window perches, and schedule two short play sessions daily.\n\nScratching posts should be taller than a full stretch. Multiple litter boxes in multi-cat homes reduce stress significantly.",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    readMinutes: 5,
  },
  {
    id: 3,
    slug: "vaccination-basics",
    title: "Vaccination schedule basics for rescues",
    category: "Health",
    excerpt: "Core vaccines, boosters, and what to ask your vet after adoption.",
    body: "Puppies and kittens need a series of shots before full immunity. Adult rescues may require titer tests or booster updates.\n\nKeep vaccination records in a folder and share them with your vet at the first check-up within 72 hours of adoption.",
    imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800",
    readMinutes: 7,
  },
  {
    id: 4,
    slug: "reading-dog-body-language",
    title: "Reading dog body language during meet-and-greets",
    category: "Dog Care",
    excerpt: "Signs of stress, curiosity, and readiness to bond at the shelter.",
    body: "A wagging tail alone does not mean a dog is relaxed. Look for soft eyes, loose shoulders, and voluntary approach.\n\nYawning, lip licking, and turning away signal discomfort. Give dogs time and let them initiate contact.",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    readMinutes: 4,
  },
];

export const adoptionGuidelines: MockGuideline[] = [
  {
    id: 1,
    title: "Stable living situation",
    content: "Adopters should have a secure home and landlord approval if renting.",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
    priority: 1,
  },
  {
    id: 2,
    title: "Commitment to medical care",
    content: "You agree to vaccinations, parasite prevention, and annual vet visits.",
    imageUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600",
    priority: 2,
  },
  {
    id: 3,
    title: "Home visit & trial period",
    content: "We may schedule a home check and a 7-day adjustment period when needed.",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600",
    priority: 3,
  },
  {
    id: 4,
    title: "No breeding or resale",
    content: "Adopted animals must be spayed/neutered when age-appropriate and never sold.",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600",
    priority: 4,
  },
];

export const storyTagLabel: Record<MockStory["tag"], string> = {
  RESCUE: "Rescue",
  ADOPTED: "Forever Home",
  COMMUNITY: "Community",
};

export function speciesLabel(species: PetSpecies) {
  return species === "DOG" ? "Dog" : "Cat";
}

export function genderLabel(gender: PetGender) {
  return gender === "MALE" ? "Male" : "Female";
}

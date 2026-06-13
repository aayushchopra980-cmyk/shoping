const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

const movies = [
  {
    id: 1,
    title: "Interstellar",
    description: "A space crew battles gravity to save humanity.",
    genre: "Sci-Fi",
    year: 2014,
    rating: "8.6",
    thumbnail: "https://picsum.photos/300/200?1",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: true
  },
  {
    id: 2,
    title: "Galaxy Adventure",
    description: "Explore new worlds in this high-energy sci-fi journey.",
    genre: "Adventure",
    year: 2022,
    rating: "7.8",
    thumbnail: "https://picsum.photos/300/200?2",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: true
  },
  {
    id: 3,
    title: "Future Planet",
    description: "A bold mission to discover life beyond Earth.",
    genre: "Sci-Fi",
    year: 2021,
    rating: "8.0",
    thumbnail: "https://picsum.photos/300/200?3",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: true
  },
  {
    id: 4,
    title: "Midnight Chase",
    description: "A thriller that moves at breakneck speed.",
    genre: "Thriller",
    year: 2023,
    rating: "7.4",
    thumbnail: "https://picsum.photos/300/200?4",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 5,
    title: "Neon City",
    description: "A cyberpunk story of rebels and neon lights.",
    genre: "Action",
    year: 2020,
    rating: "7.6",
    thumbnail: "https://picsum.photos/300/200?5",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  },
  {
    id: 6,
    title: "Deep Ocean",
    description: "A documentary dive into the ocean’s hidden wonders.",
    genre: "Documentary",
    year: 2024,
    rating: "8.2",
    thumbnail: "https://picsum.photos/300/200?6",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 7,
    title: "Skyward",
    description: "A pilot’s journey above the clouds.",
    genre: "Drama",
    year: 2022,
    rating: "7.9",
    thumbnail: "https://picsum.photos/300/200?7",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: false
  },
  {
    id: 8,
    title: "Quantum Leap",
    description: "A scientist unlocks the secrets of time travel.",
    genre: "Sci-Fi",
    year: 2025,
    rating: "8.3",
    thumbnail: "https://picsum.photos/300/200?8",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  },
  {
    id: 9,
    title: "Horizon Run",
    description: "A daring escape across the desert.",
    genre: "Action",
    year: 2021,
    rating: "7.5",
    thumbnail: "https://picsum.photos/300/200?9",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 10,
    title: "Echoes",
    description: "An emotional drama about family and memory.",
    genre: "Drama",
    year: 2023,
    rating: "8.1",
    thumbnail: "https://picsum.photos/300/200?10",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: false
  },
  {
    id: 11,
    title: "Rogue Galaxy",
    description: "A band of outlaws take on the galaxy.",
    genre: "Adventure",
    year: 2024,
    rating: "8.0",
    thumbnail: "https://picsum.photos/300/200?11",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  },
  {
    id: 12,
    title: "Solar Winds",
    description: "A race through cosmic storms.",
    genre: "Action",
    year: 2023,
    rating: "7.7",
    thumbnail: "https://picsum.photos/300/200?12",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 13,
    title: "Shadow Code",
    description: "A hacker uncovers a global conspiracy.",
    genre: "Thriller",
    year: 2024,
    rating: "7.9",
    thumbnail: "https://picsum.photos/300/200?13",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: true
  },
  {
    id: 14,
    title: "Aurora",
    description: "A love story unfolds under the northern lights.",
    genre: "Romance",
    year: 2022,
    rating: "7.8",
    thumbnail: "https://picsum.photos/300/200?14",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  },
  {
    id: 15,
    title: "Iron Fortress",
    description: "A war robot protects its last city.",
    genre: "Sci-Fi",
    year: 2023,
    rating: "8.0",
    thumbnail: "https://picsum.photos/300/200?15",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 16,
    title: "Wild Track",
    description: "A wildlife tracker navigates the untamed frontier.",
    genre: "Adventure",
    year: 2021,
    rating: "7.6",
    thumbnail: "https://picsum.photos/300/200?16",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: false
  },
  {
    id: 17,
    title: "Crystal Cove",
    description: "Mystery and magic collide in a seaside town.",
    genre: "Fantasy",
    year: 2024,
    rating: "7.9",
    thumbnail: "https://picsum.photos/300/200?17",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  },
  {
    id: 18,
    title: "Retro Drive",
    description: "A nostalgic road trip through neon-lit highways.",
    genre: "Drama",
    year: 2020,
    rating: "7.4",
    thumbnail: "https://picsum.photos/300/200?18",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    isTrending: false
  },
  {
    id: 19,
    title: "Nightfall",
    description: "A detective races the clock before dawn.",
    genre: "Mystery",
    year: 2023,
    rating: "8.2",
    thumbnail: "https://picsum.photos/300/200?19",
    video: "https://www.w3schools.com/html/movie.mp4",
    isTrending: true
  },
  {
    id: 20,
    title: "Echo Planet",
    description: "An alien world echoes the secrets of its past.",
    genre: "Sci-Fi",
    year: 2025,
    rating: "8.4",
    thumbnail: "https://picsum.photos/300/200?20",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    isTrending: false
  }
];

app.get("/movies",(req,res)=>{
res.json(movies);
});

app.listen(3000,()=>{
console.log("Server running on http://localhost:3000");
});
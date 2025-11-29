
import User from '../models/User.js';


export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [Users, totalCount] = await Promise.all([
      User.find()
        .populate('user_id', '-password -__v')
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    res.status(200).json({ 
      Users,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers', error: err.message });
  }
};

export const getAllNews = async (req, res) => {
    try {
      // Dummy data for news articles
//       const newsArticles = [
//     {
//         id: 'a1',
//         title: 'Sculpted Silhouettes: Fall 2025 Trends',
//         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmjS8ywMSOb3KUk39Ta5Ro3xb9yM6P8TLbdw&s',
//         tags: ['Runway', 'Fall 2025', 'Silhouettes'],
//         excerpt: 'Designers are experimenting with bold contours and architectural tailoring for a refined yet experimental fall palette.',
//         author: 'A. Monroe',
//         date: 'Oct 10, 2025',
//     },
//     {
//         id: 'a2',
//         title: 'Sustainable Fabrics Making Waves',
//         image: 'https://cdn.mos.cms.futurecdn.net/dNW6cGyEpY6sYDVAPsMdfc-1200-80.jpg',
//         tags: ['Sustainability', 'Materials'],
//         excerpt: 'New bio-based fibers and recycled blends are closing the gap between performance and planet-friendly fashion.',
//         author: 'K. Rivera',
//         date: 'Oct 8, 2025',
//     },
//     {
//         id: 'a3',
//         title: 'Streetwear to Smartwear: The Crossover',
//         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSijZFQXQ0TOz8ETjBKPFptiVEzivBkk-i-FzW-gSf2fVzlaVA3gVILonwVsv9UY63v300&usqp=CAU',
//         tags: ['Streetwear', 'Tech'],
//         excerpt: 'Casual silhouettes are getting functional upgrades — hidden pockets, adaptable fits and tech-friendly fabrics.',
//         author: 'J. Patel',
//         date: 'Oct 5, 2025',
//     },
//     {
//         id: 'a4',
//         title: 'Color Forecast: Jewel Tones Dominate',
//         image: 'https://xmondohair.com/cdn/shop/files/sapphire-1.png?v=1752528368&width=533',
//         tags: ['Colors', 'Jewel Tones'],
//         excerpt: 'Emerald greens, sapphire blues and ruby reds are making a statement on runways and retail racks alike.',
//     },
//     {        
//         id: 'a5',
//         title: 'Accessory Spotlight: Statement Belts',
//         image: 'https://xmondohair.com/cdn/shop/articles/FallColorTrends_Blog_HorizontalHeader.png?v=1755537684&width=1100',
//         tags: ['Accessories', 'Belts'],
//         excerpt: 'Oversized buckles and intricate designs are elevating belts from functional to fashionable.',

//     },
//     {
//         id: 'a6',
//         title: 'Footwear Focus: Chunky Soles Return',
//         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLfTYdxJWQ-2TjxRpRCDX5BjWSq9UDlm2S6g&s',
//         tags: ['Footwear', 'Trends'],
//         excerpt: 'The chunky sole trend is back with a vengeance, blending comfort with bold style statements.',
//     },
//     {
//         id: 'a7',
//         title: 'Layering Techniques for Transitional Weather',
//         image: 'https://www.anveya.com/cdn/shop/articles/shutterstock_1406948663.webp?v=1685427504',
//         tags: ['Layering', 'Weather'],
//         excerpt: 'Master the art of layering with versatile pieces that adapt to fluctuating temperatures and styles.',
//     }
// ];

const newsArticles = [
  {
    id: 'a1',
    title: 'Sculpted Silhouettes: Fall 2025 Trends',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmjS8ywMSOb3KUk39Ta5Ro3xb9yM6P8TLbdw&s',
    tags: ['Runway', 'Fall 2025', 'Silhouettes'],
    excerpt: 'Designers are experimenting with bold contours and architectural tailoring for a refined yet experimental fall palette.',
    author: 'A. Monroe',
    date: 'Oct 10, 2025',
  },
  {
    id: 'a2',
    title: 'Sustainable Fabrics Making Waves',
    image: 'https://cdn.mos.cms.futurecdn.net/dNW6cGyEpY6sYDVAPsMdfc-1200-80.jpg',
    tags: ['Sustainability', 'Materials'],
    excerpt: 'New bio-based fibers and recycled blends are closing the gap between performance and planet-friendly fashion.',
    author: 'K. Rivera',
    date: 'Oct 8, 2025',
  },
  {
    id: 'a3',
    title: 'Streetwear to Smartwear: The Crossover',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSijZFQXQ0TOz8ETjBKPFptiVEzivBkk-i-FzW-gSf2fVzlaVA3gVILonwVsv9UY63v300&usqp=CAU',
    tags: ['Streetwear', 'Tech'],
    excerpt: 'Casual silhouettes are getting functional upgrades — hidden pockets, adaptable fits and tech-friendly fabrics.',
    author: 'J. Patel',
    date: 'Oct 5, 2025',
  },
  {
    id: 'a4',
    title: 'Color Forecast: Jewel Tones Dominate',
    image: 'https://xmondohair.com/cdn/shop/files/sapphire-1.png?v=1752528368&width=533',
    tags: ['Colors', 'Jewel Tones'],
    excerpt: 'Emerald greens, sapphire blues and ruby reds are making a statement on runways and retail racks alike.',
  },
  {        
    id: 'a5',
    title: 'Accessory Spotlight: Statement Belts',
    image: 'https://xmondohair.com/cdn/shop/articles/FallColorTrends_Blog_HorizontalHeader.png?v=1755537684&width=1100',
    tags: ['Accessories', 'Belts'],
    excerpt: 'Oversized buckles and intricate designs are elevating belts from functional to fashionable.',
  },
  {
    id: 'a6',
    title: 'Footwear Focus: Chunky Soles Return',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLfTYdxJWQ-2TjxRpRCDX5BjWSq9UDlm2S6g&s',
    tags: ['Footwear', 'Trends'],
    excerpt: 'The chunky sole trend is back with a vengeance, blending comfort with bold style statements.',
  },
  {
    id: 'a7',
    title: 'Layering Techniques for Transitional Weather',
    image: 'https://www.anveya.com/cdn/shop/articles/shutterstock_1406948663.webp?v=1685427504',
    tags: ['Layering', 'Weather'],
    excerpt: 'Master the art of layering with versatile pieces that adapt to fluctuating temperatures and styles.',
  },

  // ------------------ NEW ITEMS START HERE ------------------ //

  {
    id: 'a8',
    title: 'Metallic Finishes Shine on Spring Runways',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrmS1t8pAM3w43TjZsnFtiQHq4ysoxKQ4oTA&s',
    tags: ['Runway', 'Spring 2025', 'Metallics'],
    excerpt: 'Gold, chrome and iridescent fabrics are returning with futuristic flair.',
    author: 'L. Hart',
    date: 'Sep 30, 2025',
  },
  {
    id: 'a9',
    title: 'Minimalist Chic Makes a Comeback',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWGsz95nLHpMagYvTebPlEwS8oTWqL8Zvzuw&s',
    tags: ['Minimalism', 'Trends'],
    excerpt: 'Clean lines and neutral palettes are becoming the go-to choice for effortless elegance.',
    author: 'T. James',
    date: 'Sep 25, 2025',
  },
  {
    id: 'a10',
    title: 'Denim Deconstruction Takes Center Stage',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8sNs2Uxd4feghXhdEapqj5PDPfzJSsb96vQ&s',
    tags: ['Denim', 'Streetwear'],
    excerpt: 'Patchwork, frayed seams and asymmetric cuts redefine modern denim.',
  },
  {
    id: 'a11',
    title: 'Knitwear Innovations for Winter Warmth',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuRgFY8C1fKDG4bwMF2mT54Zbv-GIw-FtKzA&s',
    tags: ['Knitwear', 'Winter'],
    excerpt: 'Hybrid yarns and intricate weaves offer warmth without bulk.',
  },
  {
    id: 'a12',
    title: 'Bold Prints Dominate Resort 2026',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUB-jBy7Qb_k3MhbvFuy5KJuj6l11HbQ0wTw&s',
    tags: ['Resort', 'Prints'],
    excerpt: 'Vibrant patterns inspired by nature and travel are leading the resort season.',
  },
  {
    id: 'a13',
    title: 'Tech-Integrated Jackets Hit the Market',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2f70o8F7_ICxTE15jrHB0XvErUc5JMGOobA&s',
    tags: ['Tech', 'Outerwear'],
    excerpt: 'Smart jackets now feature temperature regulation and embedded sensors.',
  },
  {
    id: 'a14',
    title: 'Retro Revival: 70s Aesthetic Returns',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY6zqQQdgVKO6kazNmwyYRDEGxTZ9jdX2JBg&s',
    tags: ['Retro', '1970s'],
    excerpt: 'Bell-bottoms, earthy hues and statement collars are trending again.',
  },
  {
    id: 'a15',
    title: 'Upcycled Accessories Gain Popularity',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxuUzXojJYTiQvRmNTukTTIYkmCChJjXfkow&s',
    tags: ['Sustainability', 'Accessories'],
    excerpt: 'Designers are transforming waste materials into luxury-grade accessories.',
  },
  {
    id: 'a16',
    title: 'Evening Wear Embraces Feather Details',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxbdzW8Y7xYhWm8Yfo4nfrFN5ExVeXKV4S_w&s',
    tags: ['Evening Wear', 'Trends'],
    excerpt: 'Soft feather trims bring movement and drama to red-carpet looks.',
  },
  {
    id: 'a17',
    title: 'Soft Pastels Take Over Spring Collections',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUhwy_6FM1gj7YvhqrOsRFvY9uzW1bCletSg&s',
    tags: ['Colors', 'Spring'],
    excerpt: 'Designers gravitate toward lavender, blush and mint tones for gentle sophistication.',
  },
  {
    id: 'a18',
    title: 'Menswear Sees Rise in Wide-Leg Trousers',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzPzr276UxYPDdiEx5ZY9YrOvAERJ3lrb_tQ&s',
    tags: ['Menswear', 'Trends'],
    excerpt: 'Relaxed silhouettes dominate menswear, offering comfort and style.',
  },
  {
    id: 'a19',
    title: 'Luxury Brands Embrace Digital Runways',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjY-u0RCDmT43cMoX3Nqi5GXFM6klT7Sv5Iw&s',
    tags: ['Digital Fashion', 'Runway'],
    excerpt: 'High-end labels experiment with VR catwalks and immersive presentations.',
  },
  {
    id: 'a20',
    title: 'Floral Embroidery Makes a Delicate Return',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6fCGItBzKcsoAutEIKH5dDa3h5XjyOlZgWQ&s',
    tags: ['Embroidery', 'Trends'],
    excerpt: 'Hand-stitched blooms elevate dresses, blouses and accessories.',
  },
  {
    id: 'a21',
    title: 'Athleisure Gets a Tailored Upgrade',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR875EXaTiQYPA6sFqzJ1iTH6b6NGpY0aij1Q&s',
    tags: ['Athleisure', 'Tailoring'],
    excerpt: 'Structured joggers and blazer-matching hoodies bridge comfort and refinement.',
  },
  {
    id: 'a22',
    title: 'Eco-Dyes Offer Vibrant New Palettes',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0MR6njNe35l-pzrg16ef8NPocaJE8HPPJtQ&s',
    tags: ['Sustainability', 'Materials'],
    excerpt: 'Natural dyeing methods now rival synthetic colors in vibrancy and longevity.',
  },
  {
    id: 'a23',
    title: 'Winter Coats Trend Toward Maxi Lengths',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxF7StRFAW5pzGJHTug7PSB6tGZJY_EoKCAQ&s',
    tags: ['Outerwear', 'Winter'],
    excerpt: 'Full-length silhouettes offer drama and improved insulation.',
  },
  {
    id: 'a24',
    title: 'Statement Earrings Reclaim the Spotlight',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4DGnJBG_djioG6eni8OXP8-jgyg7cLQYGyw&s',
    tags: ['Accessories', 'Jewelry'],
    excerpt: 'Sculptural metals and oversized gems dominate earring trends.',
  },
  {
    id: 'a25',
    title: 'Sheer Layers Add a Touch of Mystery',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOXkVGPy6DcsvP2a0bYuXbSyQWiGfi9L4xow&s',
    tags: ['Layering', 'Runway'],
    excerpt: 'Transparent overlays play with depth and light for ethereal looks.',
  },
  {
    id: 'a26',
    title: 'Utilitarian Pockets Are Back in Style',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThQj3mZG2WvTvws_wxCOiRqTnzvHHkeN_tUg&s',
    tags: ['Utility', 'Streetwear'],
    excerpt: 'Cargo elements appear across skirts, jackets and trousers.',
  },
  {
    id: 'a27',
    title: 'Faux Fur Innovations Mimic Real Texture',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTocjANXg9U8bE6rklJzIphRlCZjrL5fSe9wg&s',
    tags: ['Faux Fur', 'Winter'],
    excerpt: 'Next-gen materials offer ethical luxury with remarkable softness.',
  },
  {
    id: 'a28',
    title: 'Neon Accents Electrify Fall Outfits',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKbUad6jDoCynKgO0REV4EohmlZnYpWhtz7w&s',
    tags: ['Colors', 'Fall'],
    excerpt: 'Pops of neon contrast with muted layers for dynamic styling.',
  },
  {
    id: 'a29',
    title: 'Ballet-Inspired Fashion Gains Momentum',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdwHfyYw23O8S-Q1jHknk2OzpabpHzOpJrwg&s',
    tags: ['Balletcore', 'Trends'],
    excerpt: 'Soft tulle, wrap sweaters and satin shoes define the balletcore movement.',
  },
  {
    id: 'a30',
    title: 'The Rise of Monochrome Power Dressing',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRPWFeB5x6Lca7P8p9-FcZwNGsGBKF0KKqkQ&s',
    tags: ['Monochrome', 'Power Dressing'],
    excerpt: 'Head-to-toe tonal outfits communicate confidence and clarity.',
  }
];


      res.status(200).json({ news: newsArticles });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch news articles', error: err.message });
    }
  };
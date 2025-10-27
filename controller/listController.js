
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
    }
];

      res.status(200).json({ news: newsArticles });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch news articles', error: err.message });
    }
  };
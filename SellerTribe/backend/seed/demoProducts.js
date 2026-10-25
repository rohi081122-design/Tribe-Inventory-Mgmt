// seed/demoProducts.js
// SAMPLE products for trying out the websites. They belong to a "demo seller" account.
//
// The photos are openly licensed (Creative Commons / public domain) photos from Wikimedia Commons
// and Flickr. The photographer credit is added to each product description, as the licences require.
//
//   npm run seed:demo          -> adds these products (photos are uploaded to your Cloudinary)
//   npm run seed:demo:remove   -> removes them again, together with their photos and the demo seller
//
// Deleting an item here and running "npm run seed:demo" again removes that sample product.
//
// RULE: Tribal Marketplace does not sell food or drinks, so there are no food samples.

// The demo seller can also log in on SellerTribe with this contact number (prototype login)
const DEMO_SELLER = {
  name: 'Tribal Marketplace Demo Store',
  phone: '9000000001',
  aadhaar: '900000000001', // dummy number
  village: 'Ranchi',
  district: 'Ranchi',
  state: 'Jharkhand',
};

// category / subcategory are slugs from TribalMarketplace/backend/seed/categories.js
const DEMO_PRODUCTS = [
  // ---------- handicrafts-tribal-art ----------
  {
    name: 'Dokra Rhino Figurine',
    price: 1450,
    stock: 4,
    category: 'handicrafts-tribal-art',
    subcategory: 'dokra-art',
    description: 'Bell-metal figurine made with the ancient lost-wax (Dokra) casting technique. Every piece is cast by hand, so no two are exactly alike.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/A_Dhokra_figurine_made_by_a_Dharua_tribe.jpg',
      credit: 'Photo: Government of Odisha (CC BY 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=97547307',
    },
  },
  {
    name: 'Dokra Animal Figurine Set',
    price: 2200,
    stock: 3,
    category: 'handicrafts-tribal-art',
    subcategory: 'dokra-art',
    description: 'A set of small Dokra figurines cast in brass using the lost-wax method. A lovely decorative piece for shelves and for gifting.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Dhokra_figurines_by_Dharua_women_of_Odisha.jpg',
      credit: 'Photo: Government of Odisha (CC BY 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=97547381',
    },
  },
  {
    name: 'Terracotta Horse Pair',
    price: 850,
    stock: 6,
    category: 'handicrafts-tribal-art',
    subcategory: 'terracotta-art',
    description: 'Hand-shaped, kiln-fired clay horses with the long neck and pointed ears of traditional terracotta craft.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Terracotta-bankura-horse-ZineArt.webp',
      credit: 'Photo: AkashPratimDe (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=169159464',
    },
  },
  {
    name: 'Sohrai Art Painting',
    price: 1200,
    stock: 5,
    category: 'handicrafts-tribal-art',
    subcategory: 'tribal-paintings',
    description: 'Painting inspired by the Sohrai and Khovar wall art of Hazaribagh, made in earthy natural colours. Ready for framing.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sohrai_and_Kohbar_Paintings_03.jpg/1280px-Sohrai_and_Kohbar_Paintings_03.jpg',
      credit: 'Photo: Pratha Bopche (CC0 1.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=146881339',
    },
  },
  {
    name: 'Hand-Carved Wooden Elephant',
    price: 950,
    stock: 8,
    category: 'handicrafts-tribal-art',
    subcategory: 'wooden-handicrafts',
    description: 'Elephant figure carved by hand from a single block of wood, with a delicate cut-out (jali) pattern.',
    photo: {
      url: 'https://live.staticflickr.com/223/510227072_a7d622c603_b.jpg',
      credit: 'Photo: splashypants (CC BY 2.0), via Flickr - https://www.flickr.com/photos/69254243@N00/510227072',
    },
  },
  {
    name: 'Hand-Painted Bamboo Wall Art',
    price: 780,
    stock: 5,
    category: 'handicrafts-tribal-art',
    subcategory: 'tribal-paintings',
    description: 'Woven bamboo panel painted by hand with scenes of village life. Light and easy to hang on any wall.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0%E0%A6%BE%E0%A6%B0_%E0%A6%AC%E0%A6%BE%E0%A6%81%E0%A6%B6%E0%A7%87%E0%A6%B0_%E0%A6%95%E0%A6%BE%E0%A6%B0%E0%A7%81%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A7%8D%E0%A6%AA_Bamboo_Handicraft_of_Tripura.jpg/1280px-%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0%E0%A6%BE%E0%A6%B0_%E0%A6%AC%E0%A6%BE%E0%A6%81%E0%A6%B6%E0%A7%87%E0%A6%B0_%E0%A6%95%E0%A6%BE%E0%A6%B0%E0%A7%81%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A7%8D%E0%A6%AA_Bamboo_Handicraft_of_Tripura.jpg',
      credit: 'Photo: Sumasa (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=146457670',
    },
  },
  {
    name: 'Terracotta Wall Plaque',
    price: 640,
    stock: 7,
    category: 'handicrafts-tribal-art',
    subcategory: 'handmade-decorative-items',
    description: 'Hand-moulded terracotta plaque with a raised floral design, fired in a traditional kiln. Adds a warm earthy touch to walls.',
    photo: {
      url: 'https://live.staticflickr.com/3699/12843704713_6222884aae_b.jpg',
      credit: 'Photo: Martin Cooper Ipswich (CC BY 2.0), via Flickr - https://www.flickr.com/photos/92899351@N08/12843704713',
    },
  },

  // ---------- bamboo-cane-products ----------
  {
    name: 'Handwoven Bamboo Tray (Soop)',
    price: 350,
    stock: 15,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-baskets',
    description: 'Flat round tray woven from thin bamboo strips, used for cleaning grain and for serving. Light, strong and plastic-free.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Bamboo_craft_work.jpg/1280px-Bamboo_craft_work.jpg',
      credit: 'Photo: Thamizhpparithi Maari (CC BY-SA 3.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=17523716',
    },
  },
  {
    name: 'Bamboo Basket with Handle',
    price: 420,
    stock: 12,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-baskets',
    description: 'Sturdy round basket woven from bamboo strips with a carrying handle - for fruit, vegetables or shopping.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bamboo_Handicraft.jpg/1280px-Bamboo_Handicraft.jpg',
      credit: 'Photo: পাপৰি বৰা (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=156976196',
    },
  },
  {
    name: 'Woven Bamboo Vase',
    price: 560,
    stock: 6,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-home-decor',
    description: 'Decorative pot-shaped vase woven entirely from fine bamboo strips. Use it with dried flowers or on its own.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bamboo_Handicraft_2.jpg/1280px-Bamboo_Handicraft_2.jpg',
      credit: 'Photo: পাপৰি বৰা (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=157003384',
    },
  },
  {
    name: 'Bamboo Table Lamp',
    price: 1350,
    stock: 4,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-home-decor',
    description: 'Lamp with a hand-woven bamboo body that casts a warm patterned glow. Bulb not included.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bamboo_Lamp%2C_Tribal_Art%2C_Maharashtra.jpg/1280px-Bamboo_Lamp%2C_Tribal_Art%2C_Maharashtra.jpg',
      credit: 'Photo: Art Projects MKCL KF (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=163955775',
    },
  },
  {
    name: 'Handwoven Cane Chair',
    price: 3900,
    stock: 2,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-furniture',
    description: 'Comfortable armchair woven from natural cane on a strong frame. Light enough to move around the house or veranda.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cane_chair.jpeg/1280px-Cane_chair.jpeg',
      credit: 'Photo: User:Rajeshkunnoth (CC BY-SA 1.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=27281509',
    },
  },
  {
    name: 'Bamboo Floor Mat',
    price: 650,
    stock: 10,
    category: 'bamboo-cane-products',
    subcategory: 'bamboo-utility-items',
    description: 'Roll-up mat made from thin bamboo slats - cool to sit on in summer and easy to clean.',
    photo: {
      url: 'https://live.staticflickr.com/7573/15904021511_c3a75a0cb3_b.jpg',
      credit: 'Photo: shaire productions (CC BY 2.0), via Flickr - https://www.flickr.com/photos/9822107@N08/15904021511',
    },
  },

  // ---------- tribal-jewellery ----------
  {
    name: 'Beaded Tribal Necklace',
    price: 420,
    stock: 12,
    category: 'tribal-jewellery',
    subcategory: 'beaded-jewellery',
    description: 'Multi-strand necklace made with colourful glass beads in a traditional tribal style.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/These_are_handmade%2C_traditional_Naga_tribal_beaded_necklaces_from_North_East_India.jpg',
      credit: 'Photo: পাপৰি বৰা (CC BY 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=179758591',
    },
  },
  {
    name: 'Handmade Beaded Earrings',
    price: 180,
    stock: 20,
    category: 'tribal-jewellery',
    subcategory: 'earrings',
    description: 'Lightweight drop earrings with hand-painted beads and metal flower caps.',
    photo: {
      url: 'https://live.staticflickr.com/3245/3085922723_4f516b7764_b.jpg',
      credit: 'Photo: CreAtions2007 (CC BY-SA 2.0), via Flickr - https://www.flickr.com/photos/10235100@N03/3085922723',
    },
  },
  {
    name: 'Colourful Handmade Bangles (Set of 12)',
    price: 250,
    stock: 25,
    category: 'tribal-jewellery',
    subcategory: 'bangles-and-bracelets',
    description: 'A bright set of bangles in mixed colours, perfect for festivals and everyday wear.',
    photo: {
      url: 'https://live.staticflickr.com/2405/2146857390_ca12665e90_b.jpg',
      credit: 'Photo: mckaysavage (CC BY 2.0), via Flickr - https://www.flickr.com/photos/56796376@N00/2146857390',
    },
  },
  {
    name: 'Oxidised Silver Jhumka Earrings',
    price: 690,
    stock: 9,
    category: 'tribal-jewellery',
    subcategory: 'earrings',
    description: 'Bell-shaped jhumka earrings in oxidised silver with fine filigree work and small hanging beads.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Silver_Dogri_Jhumka_with_glass%2C_possibly_late_19th-early_20th_century%2C_Bilaspur.jpg',
      credit: 'Photo: SpeakingArch (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=192034583',
    },
  },
  {
    name: 'Peacock Bracelets (Pair)',
    price: 1250,
    stock: 4,
    category: 'tribal-jewellery',
    subcategory: 'bangles-and-bracelets',
    description: 'A pair of bracelets with peacock heads and colourful enamel work, inspired by traditional Indian designs.',
    photo: {
      url: 'https://live.staticflickr.com/7283/16419766712_a0cf5a65c5_b.jpg',
      credit: 'Photo: Fæ (CC BY 2.0), via Flickr - https://www.flickr.com/photos/50398299@N08/16419766712',
    },
  },
  {
    name: 'Colourful Bead Necklace',
    price: 360,
    stock: 14,
    category: 'tribal-jewellery',
    subcategory: 'beaded-jewellery',
    description: 'Long necklace of large painted beads in bright colours - a statement piece for festivals.',
    photo: {
      url: 'https://live.staticflickr.com/5122/5324851565_64554d26ca_b.jpg',
      credit: 'Photo: It\'s all about color (CC BY 2.0), via Flickr - https://www.flickr.com/photos/54851145@N02/5324851565',
    },
  },
  {
    name: 'Silver Anklets with Bells (Pair)',
    price: 980,
    stock: 6,
    category: 'tribal-jewellery',
    subcategory: 'anklets',
    description: 'Traditional payal anklets with tiny ghungroo bells that chime softly when you walk.',
    photo: {
      url: 'https://live.staticflickr.com/3272/2894293025_744dee52a4_b.jpg',
      credit: 'Photo: sk_vel (CC BY 2.0), via Flickr - https://www.flickr.com/photos/65815788@N00/2894293025',
    },
  },

  // ---------- forest-products ----------
  {
    name: 'Natural Lac Flakes (250 g)',
    price: 300,
    stock: 15,
    category: 'forest-products',
    subcategory: 'lac-products',
    description: 'Flakes of natural lac (shellac), a resin produced by lac insects on forest trees. Used for polish, bangles and crafts.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Shellac_three_colours.jpeg/1280px-Shellac_three_colours.jpeg',
      credit: 'Photo: Simon A. Eugster (CC BY-SA 3.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=7534499',
    },
  },

  // ---------- home-kitchen ----------
  {
    name: 'Bamboo Storage Baskets (Set of 3)',
    price: 690,
    stock: 7,
    category: 'home-kitchen',
    subcategory: 'handmade-storage-baskets',
    description: 'Set of handwoven bamboo containers for storing spices, dry fruits or small household items.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Bamboo_Crafts_%28photographed_in_Chau_Khe%2C_Con_Cuong%2C_Nghe_An%29.jpg/1280px-Bamboo_Crafts_%28photographed_in_Chau_Khe%2C_Con_Cuong%2C_Nghe_An%29.jpg',
      credit: 'Photo: KoheiU (CC0 1.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=159459151',
    },
  },
  {
    name: 'Handmade Clay Pots (Set of 2)',
    price: 600,
    stock: 5,
    category: 'home-kitchen',
    subcategory: 'clay-utensils',
    description: 'Earthen pots shaped by hand and fired in a traditional kiln. They keep water naturally cool.',
    photo: {
      url: 'https://live.staticflickr.com/8484/8246400909_40f3b20d47_b.jpg',
      credit: 'Photo: elminium (CC BY 2.0), via Flickr - https://www.flickr.com/photos/59407191@N04/8246400909',
    },
  },
  {
    name: 'Clay Cooking Pot with Lid',
    price: 750,
    stock: 6,
    category: 'home-kitchen',
    subcategory: 'clay-utensils',
    description: 'Hand-made clay pot for slow cooking. Food cooked in clay keeps its moisture and gets an earthy flavour.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/CLAY_COOKING_POT.jpg/1280px-CLAY_COOKING_POT.jpg',
      credit: 'Photo: Lilboi ayo (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=153323239',
    },
  },
  {
    name: 'Kulhad Clay Cups (Set of 6)',
    price: 240,
    stock: 20,
    category: 'home-kitchen',
    subcategory: 'clay-utensils',
    description: 'Traditional clay cups for chai and lassi. Natural, plastic-free and fully biodegradable.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Kulhad_Wali_chai.jpg',
      credit: 'Photo: Twit Rajat (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=40990226',
    },
  },
  {
    name: 'Hand-Carved Wooden Spoons (Set of 3)',
    price: 450,
    stock: 10,
    category: 'home-kitchen',
    subcategory: 'wooden-kitchenware',
    description: 'Cooking and serving spoons carved by hand from seasoned wood, with decorative handles.',
    photo: {
      url: 'https://live.staticflickr.com/7018/6825848567_44fe78c2f2_b.jpg',
      credit: 'Photo: Dvortygirl (CC BY-SA 2.0), via Flickr - https://www.flickr.com/photos/21093323@N02/6825848567',
    },
  },
  {
    name: 'Wooden Bowl with Lid',
    price: 680,
    stock: 6,
    category: 'home-kitchen',
    subcategory: 'wooden-kitchenware',
    description: 'Turned wooden bowl with a matching lid - for dry fruits, spices or as a keepsake box.',
    photo: {
      url: 'https://live.staticflickr.com/2342/2131584437_f1ec3aed50_b.jpg',
      credit: 'Photo: A.Davey (CC BY 2.0), via Flickr - https://www.flickr.com/photos/40595948@N00/2131584437',
    },
  },

  // ---------- eco-friendly-products ----------
  {
    name: 'Reusable Jute Tote Bag',
    price: 220,
    stock: 30,
    category: 'eco-friendly-products',
    subcategory: 'reusable-handmade-bags',
    description: 'Strong jute tote with handles - a plastic-free bag for shopping and daily use.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Baghashtag-Jute-bag.jpg/1280px-Baghashtag-Jute-bag.jpg',
      credit: 'Photo: Efkanakbiyik (CC0 1.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=155561775',
    },
  },
  {
    name: 'Handmade Leaf Plates (Pack of 50)',
    price: 150,
    stock: 40,
    category: 'eco-friendly-products',
    subcategory: 'sal-leaf-plates',
    description: 'Plates made by stitching dried leaves together with thin twigs. Fully biodegradable - a natural alternative to plastic plates.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ramdei%2C_a_resident_of_Nadli%2C_Kangra_district%2C_making_leaf_plates_03.jpg/1280px-Ramdei%2C_a_resident_of_Nadli%2C_Kangra_district%2C_making_leaf_plates_03.jpg',
      credit: 'Photo: Satdeep Gill (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=116928289',
    },
  },
  {
    name: 'Handmade Leaf Bowls (Pack of 50)',
    price: 120,
    stock: 40,
    category: 'eco-friendly-products',
    subcategory: 'leaf-bowls',
    description: 'Small bowls (dona) folded and pinned from dried leaves - for snacks, prasad and sweets. Compostable after use.',
    photo: {
      url: 'https://live.staticflickr.com/65535/24426733146_3ff88104b4_b.jpg',
      credit: 'Photo: Matt-Zimmerman (CC BY 2.0), via Flickr - https://www.flickr.com/photos/16725630@N00/24426733146',
    },
  },
  {
    name: 'Mini Jute Pouch',
    price: 120,
    stock: 30,
    category: 'eco-friendly-products',
    subcategory: 'reusable-handmade-bags',
    description: 'Small zip pouch made of jute - for coins, cosmetics or gifts.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Baghashtag-mini-jute-bag.jpg/1280px-Baghashtag-mini-jute-bag.jpg',
      credit: 'Photo: Efkanakbiyik (CC0 1.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=155561780',
    },
  },
  {
    name: 'Natural Jute Rope (10 m)',
    price: 160,
    stock: 25,
    category: 'eco-friendly-products',
    subcategory: 'natural-fibre-products',
    description: 'Strong, twisted rope made from natural jute fibre - for gardening, crafts and packing.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Jute_rope.jpg/1280px-Jute_rope.jpg',
      credit: 'Photo: Olga Aleksandra (CC BY 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=84401374',
    },
  },
  {
    name: 'Natural Fibre Storage Basket',
    price: 480,
    stock: 8,
    category: 'eco-friendly-products',
    subcategory: 'natural-fibre-products',
    description: 'Rectangular basket woven from natural plant fibre - for clothes, toys or magazines.',
    photo: {
      url: 'https://live.staticflickr.com/56/127346123_e75092cd45_b.jpg',
      credit: 'Photo: blmurch (CC BY 2.0), via Flickr - https://www.flickr.com/photos/82439748@N00/127346123',
    },
  },

  // ---------- tribal-culture ----------
  {
    name: 'Traditional Nagara Drum',
    price: 3500,
    stock: 2,
    category: 'tribal-culture',
    subcategory: 'traditional-musical-instruments',
    description: 'Large bowl-shaped drum played with sticks at festivals and folk performances in Jharkhand.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Jharkhand_folk_music_artist.jpg/1280px-Jharkhand_folk_music_artist.jpg',
      credit: 'Photo: Aditya.tiga (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=146955471',
    },
  },
  {
    name: 'Dhodro Banam (Santhal Folk Fiddle)',
    price: 2800,
    stock: 2,
    category: 'tribal-culture',
    subcategory: 'traditional-musical-instruments',
    description: 'Bowed string instrument of the Santhal community, carved from a single piece of wood and played at festivals and gatherings.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/163_Museu_de_la_M%C3%BAsica%2C_dhodro_banam%2C_violins_indis.jpg/1280px-163_Museu_de_la_M%C3%BAsica%2C_dhodro_banam%2C_violins_indis.jpg',
      credit: 'Photo: Enfo (CC BY-SA 3.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=29835636',
    },
  },
  {
    name: 'Dhol (Folk Drum)',
    price: 2400,
    stock: 3,
    category: 'tribal-culture',
    subcategory: 'traditional-musical-instruments',
    description: 'Two-sided wooden drum with rope tuning, played at weddings, festivals and folk dances.',
    photo: {
      url: 'https://live.staticflickr.com/3279/3028663574_ca5c3bf6c1_b.jpg',
      credit: 'Photo: jasleen_kaur (CC BY-SA 2.0), via Flickr - https://www.flickr.com/photos/25384802@N08/3028663574',
    },
  },
  {
    name: 'Hand-Painted Chhau Mask',
    price: 1800,
    stock: 3,
    category: 'tribal-culture',
    subcategory: 'cultural-artifacts',
    description: 'Colourful mask of the Chhau dance tradition, made from papier-mache and decorated by hand.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Handcrafted_Tribal_Mask_of_West_Bengal%2C_India._Chhau_Mask.jpg/1280px-Handcrafted_Tribal_Mask_of_West_Bengal%2C_India._Chhau_Mask.jpg',
      credit: 'Photo: Rhizoids (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=138256426',
    },
  },
  {
    name: 'Small Decorative Chhau Masks',
    price: 650,
    stock: 10,
    category: 'tribal-culture',
    subcategory: 'handmade-souvenirs',
    description: 'Small hand-painted Chhau masks - a colourful souvenir of eastern India\'s dance tradition.',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Chhau_Mask.jpg/1280px-Chhau_Mask.jpg',
      credit: 'Photo: Ghoshsoumi.49919021 (CC BY-SA 4.0), via Wikimedia Commons - https://commons.wikimedia.org/w/index.php?curid=87456907',
    },
  },
  {
    name: 'Carved Tribal Masks (Pair)',
    price: 1100,
    stock: 4,
    category: 'tribal-culture',
    subcategory: 'traditional-decorative-items',
    description: 'A pair of wooden masks carved and painted by hand, for walls and shelves.',
    photo: {
      url: 'https://live.staticflickr.com/7171/6657836815_e84fa32dc2_b.jpg',
      credit: 'Photo: Nagarjun (CC BY 2.0), via Flickr - https://www.flickr.com/photos/64924693@N00/6657836815',
    },
  },
];

module.exports = { DEMO_SELLER, DEMO_PRODUCTS };

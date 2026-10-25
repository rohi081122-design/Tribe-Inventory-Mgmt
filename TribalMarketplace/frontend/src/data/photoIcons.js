// data/photoIcons.js
// Small round photos used instead of decorative icons: About cards, homepage points and highlights,
// Contact cards, empty pages ("Your cart is empty"...) and categories without their own picture.
//
// The files are in frontend/public/images/photo-icons (160 x 160 px squares).
// They are openly licensed photos from Wikimedia Commons and Flickr; Creative Commons licences
// require the photographer credit, so every photo has a "credit" that is listed on the Photo Credits page.
//
// To use your own photo: put a square picture in public/images/photo-icons and change "src".
// (Your own photos do not need a credit.)

const photoIcons = {
  localSeller: {
    src: '/images/photo-icons/local-seller.jpg', // a local seller at her market stall
    credit: { text: 'Photo: VinothChandar, CC BY 2.0', url: 'https://www.flickr.com/photos/44345361@N06/5645156569' },
  },
  dokraFigurines: {
    src: '/images/photo-icons/dokra-figurines.jpg', // Dokra (lost-wax brass) figurines
    credit: { text: 'Photo: Government of Odisha, CC BY 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=97547381' },
  },
  mobilePhone: {
    src: '/images/photo-icons/mobile-phone.jpg', // a young woman using a mobile phone
    credit: { text: 'Photo: mandy_turner, CC BY 2.0', url: 'https://www.flickr.com/photos/71089665@N05/6436378719' },
  },
  wallPainting: {
    src: '/images/photo-icons/wall-painting.jpg', // women painting the walls of a Jharkhand village
    credit: { text: 'Photo: Md Khurshid, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=86609253' },
  },
  villageMarket: {
    src: '/images/photo-icons/village-market.jpg', // buying and selling at a local bazaar
    credit: { text: 'Photo: Inside me Journey, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=100120999' },
  },
  bambooWeaver: {
    src: '/images/photo-icons/bamboo-weaver.jpg', // a basket weaver working with bamboo strips
    credit: { text: 'Photo: Alokavinash11, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=130229762' },
  },
  paddyPlanting: {
    src: '/images/photo-icons/paddy-planting.jpg', // villagers planting paddy together
    credit: { text: 'Photo: Diganta Talukdar, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=49809426' },
  },
  potterHands: {
    src: '/images/photo-icons/potter-hands.jpg', // a potter shaping clay on a hand-turned wheel
    credit: { text: 'Photo: Gannu03, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=179653278' },
  },
  leafPlates: {
    src: '/images/photo-icons/leaf-plates.jpg', // making plates from leaves
    credit: { text: 'Photo: Satdeep Gill, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=116928289' },
  },
  basketStall: {
    src: '/images/photo-icons/basket-stall.jpg', // a basket weaver's stall at a handicrafts fair
    credit: { text: 'Photo: Salil Kumar Mukherjee, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=189510078' },
  },
  womenSelfHelpGroup: {
    src: '/images/photo-icons/women-self-help-group.jpg', // a self-help group of tribal women in Jharkhand
    credit: { text: 'Photo: Gaurang Pathak 1, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=56308222' },
  },
  haatSeller: {
    src: '/images/photo-icons/haat-seller.jpg', // a seller at a weekly village market (haat)
    credit: { text: 'Photo: Ad031259, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=115988875' },
  },
  craftFair: {
    src: '/images/photo-icons/craft-fair.jpg', // shoppers at a handicrafts fair
    credit: { text: 'Photo: Billjones94, CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=141978265' },
  },
  letterBox: {
    src: '/images/photo-icons/letter-box.jpg', // an India Post letter box
    credit: { text: 'Photo: Niraj Hitesh Chauhan, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=47110786' },
  },
  streetMarket: {
    src: '/images/photo-icons/street-market.jpg', // a village street market
    credit: { text: 'Photo: Drashokk, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=148220384' },
  },
  parcel: {
    src: '/images/photo-icons/parcel.jpg', // a parcel being packed for delivery
    credit: { text: 'Photo: The Bag N Box Man LTD, CC BY 2.0', url: 'https://www.flickr.com/photos/195311218@N08/52177106715' },
  },
  womenGroup: {
    src: '/images/photo-icons/women-group.jpg', // a group of village women
    credit: { text: 'Photo: Find Your Feet, CC BY 2.0', url: 'https://www.flickr.com/photos/31042566@N06/3693611933' },
  },
  bambooBasket: {
    src: '/images/photo-icons/bamboo-basket.jpg', // a handmade bamboo basket
    credit: { text: 'Photo: পাপৰি বৰা, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=156976196' },
  },
  bambooStorage: {
    src: '/images/photo-icons/bamboo-storage.jpg', // bamboo storage baskets and boxes
    credit: { text: 'Photo: KoheiU, CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=159459151' },
  },
  emptyBasket: {
    src: '/images/photo-icons/empty-basket.jpg', // an empty woven basket
    credit: { text: 'Photo: blmurch, CC BY 2.0', url: 'https://www.flickr.com/photos/82439748@N00/127346123' },
  },
  forest: {
    src: '/images/photo-icons/forest.jpg', // a sal forest (same photo as the Forest Products category)
    credit: { text: 'Photo: Xzantiyamoloy, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=133233926' },
  },
  handicrafts: {
    src: '/images/photo-icons/handicrafts.jpg', // handicrafts (same photo as the Handicrafts category)
    credit: { text: 'Photo: Footlooseinme, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=87534805' },
  },
};

export default photoIcons;

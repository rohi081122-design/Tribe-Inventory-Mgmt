// data/photoIcons.js
// Small photos used instead of decorative icons: dashboard number cards and empty pages
// ("No orders yet"...).
//
// The files are in frontend/public/images/photo-icons (160 x 160 px squares). They are openly licensed
// photos from Wikimedia Commons and Flickr - the same ones the marketplace uses. Creative Commons licences
// require the photographer credit: all credits are listed on the marketplace's Photo Credits page
// (linked in the footer of this website).
//
// To use your own photo: put a square picture in public/images/photo-icons and change "src".

const photoIcons = {
  dokraFigurines: {
    src: '/images/photo-icons/dokra-figurines.jpg', // Dokra (lost-wax brass) figurines
    credit: { text: 'Photo: Government of Odisha, CC BY 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=97547381' },
  },
  craftFair: {
    src: '/images/photo-icons/craft-fair.jpg', // shoppers at a handicrafts fair
    credit: { text: 'Photo: Billjones94, CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=141978265' },
  },
  bambooStorage: {
    src: '/images/photo-icons/bamboo-storage.jpg', // bamboo storage baskets and boxes
    credit: { text: 'Photo: KoheiU, CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=159459151' },
  },
  emptyBasket: {
    src: '/images/photo-icons/empty-basket.jpg', // an empty woven basket
    credit: { text: 'Photo: blmurch, CC BY 2.0', url: 'https://www.flickr.com/photos/82439748@N00/127346123' },
  },
  bambooBasket: {
    src: '/images/photo-icons/bamboo-basket.jpg', // a handmade bamboo basket
    credit: { text: 'Photo: পাপৰি বৰা, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=156976196' },
  },
  parcel: {
    src: '/images/photo-icons/parcel.jpg', // a parcel being packed for delivery
    credit: { text: 'Photo: The Bag N Box Man LTD, CC BY 2.0', url: 'https://www.flickr.com/photos/195311218@N08/52177106715' },
  },
  womenSelfHelpGroup: {
    src: '/images/photo-icons/women-self-help-group.jpg', // a self-help group of tribal women in Jharkhand
    credit: { text: 'Photo: Gaurang Pathak 1, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=56308222' },
  },
  womenGroup: {
    src: '/images/photo-icons/women-group.jpg', // a group of village women
    credit: { text: 'Photo: Find Your Feet, CC BY 2.0', url: 'https://www.flickr.com/photos/31042566@N06/3693611933' },
  },
  forest: {
    src: '/images/photo-icons/forest.jpg', // a sal forest
    credit: { text: 'Photo: Xzantiyamoloy, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=133233926' },
  },
};

export default photoIcons;

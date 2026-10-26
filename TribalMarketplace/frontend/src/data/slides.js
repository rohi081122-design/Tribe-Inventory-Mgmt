// data/slides.js
// Slides for the homepage carousel (HeroCarousel.jsx).
// You can edit the text, add or remove slides here without changing the component.
//
// Fields:
//   title, description - text shown on the banner
//   imageUrl           - banner picture. Leave '' to show a themed CSS background instead.
//                        Use a path like '/images/banners/my-banner.jpg' (file in frontend/public/images)
//                        or a full https:// URL. Recommended size: 1920 x 1080 px (landscape).
//   imagePosition      - which part of the photo to keep visible when it is cropped (CSS object-position)
//   credit             - photographer and licence (required by Creative Commons photos). Remove it
//                        when you use your own photos.
//   buttonText         - text on the call-to-action button
//   buttonLink         - page the button opens (a page of this site like '/products',
//                        or a full address like the seller website)
//   theme              - fallback background colour: 'forest' | 'terracotta' | 'brown' | 'ochre'
//   eyebrow            - small label above the title
//
// The current banner photos are openly licensed photos from Wikimedia Commons.
// To use your own, put the files in frontend/public/images/banners and change imageUrl.

import siteConfig from './siteConfig.js';

const slides = [
  {
    id: 'heritage',
    eyebrow: 'Handmade in Jharkhand',
    title: 'Discover the Heritage of Jharkhand',
    description: 'Explore traditional handicrafts and handmade products from local tribal artisans.',
    imageUrl: '/images/banners/cart.jpg', // Sohrai wall painting, Isko village, Hazaribagh
    imagePosition: 'center 40%',
    credit: {
      text: 'Photo: Kingshuk Mondal, CC BY 4.0',
      url: '#',
    },
    buttonText: 'Explore Products',
    buttonLink: '/products',
    theme: 'forest',
  },
  {
    id: 'handmade',
    eyebrow: 'Crafted by hand',
    title: 'Handmade with Tradition',
    description: 'Discover unique bamboo crafts, tribal jewellery, and traditional art.',
    imageUrl: '/images/banners/da.jpeg', // Dokra metal craft
    imagePosition: 'center 45%',
    credit: {
      text: 'Photo: Susannaanas, CC BY-SA 4.0',
      url: '#',
    },
    buttonText: 'Shop Handicrafts',
    buttonLink: '/categories/handicrafts-tribal-art',
    theme: 'terracotta',
  },
  {
    id: 'sellers',
    eyebrow: 'For artisans and sellers',
    title: 'Support Local Tribal Sellers',
    description: 'Help local artisans showcase their products to customers online.',
    imageUrl: '/images/banners/artisan.jpg', // artisan making lac bangles at a tribal crafts fair
    imagePosition: 'center 35%',
    credit: {
      text: 'Photo: Goutam1962, CC BY-SA 4.0',
      url: '#',
    },
    buttonText: 'Become a Seller',
    buttonLink: `${siteConfig.sellerSiteUrl}/login?mode=register`, // opens the SellerTribe website
    theme: 'brown',
  },
  {
    id: 'natural',
    eyebrow: 'From forests and villages',
    title: 'Explore Natural and Eco-Friendly Products',
    description: 'Discover lac work, sal leaf plates, jute and natural fibre goods made by hand.',
    imageUrl: '/images/banners/d.jpg', // Hundru Falls, Ranchi
    imagePosition: 'center 55%',
    credit: {
      text: 'Photo: Kingshuk Mondal, CC BY 4.0',
      url: '#',
    },
    buttonText: 'Explore Categories',
    buttonLink: '/categories',
    theme: 'ochre',
  },
];

export default slides;

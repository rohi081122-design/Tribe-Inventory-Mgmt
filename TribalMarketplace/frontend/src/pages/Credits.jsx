// pages/Credits.jsx
// Lists the photographers of the openly licensed photos used on the website.
// Creative Commons licences (CC BY / CC BY-SA) require this credit.
// Banner credits come from data/slides.js, page header credits from data/pageHeaderPhotos.js,
// category credits from the database (seed/categories.js), small photo credits from data/photoIcons.js.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import slides from '../data/slides.js';
import pageHeaderPhotos from '../data/pageHeaderPhotos.js';
import photoIcons from '../data/photoIcons.js';
import { categoryAPI } from '../services/api.js';
import { isUsableImageUrl } from '../utils/images.js';
import '../styles/credits.css';

function CreditRow({ imageUrl, title, credit }) {
  return (
    <li className="credit-row">
      <img src={imageUrl} alt="" loading="lazy" className="credit-thumb" />
      <div>
        <strong>{title}</strong>
        <a href={credit.url} target="_blank" rel="noopener noreferrer">
          {credit.text}
        </a>
      </div>
    </li>
  );
}

// "womenSelfHelpGroup" -> "Women self help group"
function photoTitle(key) {
  const words = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function Credits() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  const creditedSlides = slides.filter((slide) => slide.credit && isUsableImageUrl(slide.imageUrl));
  // Page header photos with their own credit (photos that are also banners are already listed above)
  const creditedHeaders = Object.entries(pageHeaderPhotos).filter(
    ([, photo]) => photo.credit && isUsableImageUrl(photo.url) && !slides.some((slide) => slide.imageUrl === photo.url)
  );
  const creditedCategories = categories.filter((category) => category.imageCredit?.text && isUsableImageUrl(category.image));
  // Small round photos (photos that are already listed above are not repeated)
  const listedCreditUrls = new Set([
    ...creditedSlides.map((slide) => slide.credit.url),
    ...creditedCategories.map((category) => category.imageCredit.url),
    ...creditedHeaders.map(([, photo]) => photo.credit.url),
  ]);
  const creditedPhotoIcons = Object.entries(photoIcons).filter(
    ([, photo]) => photo.credit && !listedCreditUrls.has(photo.credit.url)
  );

  return (
    <div className="credits-page">
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Photo Credits</span>
          </nav>
          <h1>Photo Credits</h1>
          <p>
            Some photos on this website are openly licensed photos from Wikimedia Commons and Flickr. Thank you to the
            photographers who shared them. Some of the banner and page header photos are also used behind the page
            titles of our seller website, SellerTribe.
          </p>
        </div>
      </section>

      <div className="container page-section credits-layout">
        {creditedSlides.length > 0 && (
          <section aria-labelledby="banner-credits">
            <h2 id="banner-credits">Homepage banners and page headers</h2>
            <ul className="credit-list">
              {creditedSlides.map((slide) => (
                <CreditRow key={slide.id} imageUrl={slide.imageUrl} title={slide.title} credit={slide.credit} />
              ))}
            </ul>
          </section>
        )}

        {creditedHeaders.length > 0 && (
          <section aria-labelledby="header-credits">
            <h2 id="header-credits">Page headers</h2>
            <ul className="credit-list">
              {creditedHeaders.map(([page, photo]) => (
                <CreditRow
                  key={page}
                  imageUrl={photo.url}
                  title={photo.title || `${page.charAt(0).toUpperCase()}${page.slice(1)} page`}
                  credit={photo.credit}
                />
              ))}
            </ul>
          </section>
        )}

        {creditedCategories.length > 0 && (
          <section aria-labelledby="category-credits">
            <h2 id="category-credits">Category pictures</h2>
            <ul className="credit-list">
              {creditedCategories.map((category) => (
                <CreditRow key={category._id} imageUrl={category.image} title={category.name} credit={category.imageCredit} />
              ))}
            </ul>
          </section>
        )}

        {creditedPhotoIcons.length > 0 && (
          <section aria-labelledby="small-photo-credits">
            <h2 id="small-photo-credits">Small round pictures</h2>
            <ul className="credit-list">
              {creditedPhotoIcons.map(([key, photo]) => (
                <CreditRow key={key} imageUrl={photo.src} title={photoTitle(key)} credit={photo.credit} />
              ))}
            </ul>
          </section>
        )}

        <section className="credits-note">
          <h2>Product photos</h2>
          <p>
            Photos of products uploaded by sellers belong to the sellers. For the sample products, the photographer and
            licence are written at the end of each product's description.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Credits;

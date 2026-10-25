// pages/About.jsx

import { Link } from 'react-router-dom';
import PhotoIcon from '../components/PhotoIcon.jsx';
import siteConfig from '../data/siteConfig.js';
import photoIcons from '../data/photoIcons.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/about.css';

const VALUES = [
  {
    photo: photoIcons.localSeller,
    title: 'Supporting artisans and local sellers',
    text: 'Many skilled artisans sell only at local haats and fairs. This marketplace gives them a simple way to show their work to customers who live far away.',
  },
  {
    photo: photoIcons.dokraFigurines,
    title: 'Promoting traditional Jharkhand products',
    text: 'Dokra metal craft, terracotta, bamboo weaving, tribal jewellery, lac work and Sohrai painting all deserve a wider audience.',
  },
  {
    photo: photoIcons.mobilePhone,
    title: 'Helping sellers reach customers online',
    text: 'Sellers register on our seller website and upload a product with photos, a price and its full details (stock, category, description and where it was made). They manage their own listings from a simple dashboard.',
  },
  {
    photo: photoIcons.wallPainting,
    title: 'Preserving crafts and cultural heritage',
    text: 'When traditional crafts find buyers, the knowledge behind them is more likely to be passed on to the next generation.',
  },
];

const STEPS = [
  { title: 'Seller registers', text: 'An artisan or producer creates a free seller account.' },
  { title: 'Product is uploaded', text: 'The seller adds photos, a price and the full product details.' },
  { title: 'Customers discover it', text: 'The product appears in search, categories and on the homepage.' },
];

function About() {
  return (
    <div className="about-page">
      <section className="about-hero about-hero-photo" style={headerPhotoStyle(pageHeaderPhotos.about)}>
        <div className="container about-hero-inner">
          <span className="eyebrow">About us</span>
          <h1>Bringing the crafts of tribal Jharkhand online</h1>
          <p>
            Tribal Marketplace is an online store front for tribal artisans and small local sellers. Our goal is simple:
            make it easy for the people who make these products to share them with customers who value handmade,
            traditional and natural goods.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="about-mission">
            <div>
              <h2 className="section-title">Our mission</h2>
              <p>
                Jharkhand is home to many tribal communities with rich traditions of craft and art. Much of this
                work is sold only nearby, and sellers often have few ways to reach new customers.
              </p>
              <p>
                We want to build a respectful, easy-to-use marketplace where sellers stay in control of their products
                and prices, and where buyers can learn where each product comes from.
              </p>
            </div>
            <div className="about-quote">
              <p>“Every handmade product carries the story of the hands and the village that made it.”</p>
            </div>
          </div>

          <div className="about-values">
            {VALUES.map((value) => (
              <article key={value.title} className="about-value">
                <span className="about-value-icon" aria-hidden="true">
                  <PhotoIcon photo={value.photo} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt">
        <div className="container">
          <h2 className="section-title text-center">How it works</h2>
          <ol className="about-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="about-step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-section">
        <div className="container about-journey">
          <div>
            <h2 className="section-title">Starting small, growing step by step</h2>
            <p>
              We are beginning with sellers from a few villages. As we learn what works for artisans and buyers, we plan
              to welcome more villages and districts and to add features such as online ordering in the future.
            </p>
            <p>
              If you are an artisan, a self-help group or a local producer who would like to sell here, we would love to
              hear from you.
            </p>
          </div>
          <div className="about-journey-actions">
            {/* Opens the separate SellerTribe website */}
            <a href={`${siteConfig.sellerSiteUrl}/login?mode=register`} className="btn btn-primary btn-lg">
              Become a Seller
            </a>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

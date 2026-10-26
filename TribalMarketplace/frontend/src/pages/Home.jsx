// pages/Home.jsx
// Homepage: carousel, search, categories, product sections, seller promotion and about section.
// All products shown here come from the backend (MongoDB) - nothing is hard-coded.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import CategoryThumb from '../components/CategoryThumb.jsx';
import PhotoIcon from '../components/PhotoIcon.jsx';
import { ArrowRightIcon } from '../components/Icons.jsx';
import { categoryAPI } from '../services/api.js';
import useProducts from '../hooks/useProducts.js';
import { isUsableImageUrl } from '../utils/images.js';
import siteConfig from '../data/siteConfig.js';
import photoIcons from '../data/photoIcons.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/home.css';
import '../styles/products.css';
import '../styles/categories.css';

const QUICK_SEARCHES = ['Dokra', 'Bamboo', 'Jewellery', 'Terracotta', 'Sohrai', 'Leaf plates'];

const HIGHLIGHTS = [
  { photo: photoIcons.potterHands, title: 'Made by hand', text: 'Products crafted by local artisans' },
  { photo: photoIcons.leafPlates, title: 'Natural materials', text: 'Bamboo, clay, sal leaf, cotton and more' },
  { photo: photoIcons.basketStall, title: 'Sellers set prices', text: 'Artisans list and manage their own products' },
  { photo: photoIcons.womenSelfHelpGroup, title: 'Support communities', text: 'Help traditional crafts reach new customers' },
];

// Main category slugs used by the special homepage sections (see backend/seed/categories.js).
// Tribal Marketplace does not sell food or drinks, so there is no food section.
const HANDICRAFTS_SLUG = 'handicrafts-tribal-art';
const FOREST_SLUG = 'forest-products';
const ECO_SLUG = 'eco-friendly-products';

function Home() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Product sections (each one is a separate API request)
  const popular = useProducts({ sort: 'popular', limit: 8 });
  const recent = useProducts({ sort: 'newest', limit: 8 });
  const handicrafts = useProducts({ category: HANDICRAFTS_SLUG, sort: 'newest', limit: 4 });
  const forest = useProducts({ category: FOREST_SLUG, sort: 'newest', limit: 2 });
  const eco = useProducts({ category: ECO_SLUG, sort: 'newest', limit: 2 });

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch((error) => setCategoriesError(error.message))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const findCategory = (slug) => categories.find((category) => category.slug === slug);
  const handicraftCategory = findCategory(HANDICRAFTS_SLUG);
  const forestCategory = findCategory(FOREST_SLUG);
  const ecoCategory = findCategory(ECO_SLUG);

  return (
    <div className="home">
      <h1 className="visually-hidden">Tribal Marketplace - handmade tribal products from Jharkhand</h1>

      {/* 1. Hero carousel */}
      <HeroCarousel />

      {/* 2. Search */}
      <section className="home-search" aria-labelledby="home-search-title">
        <div className="container">
          <div className="home-search-card">
            <div className="home-search-text">
              <h2 id="home-search-title">What are you looking for today?</h2>
              <p>Search handmade crafts, jewellery, bamboo and eco-friendly products from tribal sellers.</p>
            </div>
            <SearchBar size="small" />
            <div className="quick-searches">
              <span>Popular searches:</span>
              {QUICK_SEARCHES.map((term) => (
                <Link key={term} to={`/products?search=${encodeURIComponent(term)}`} className="chip">
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <ul className="home-highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="home-highlight">
                <span className="home-highlight-icon" aria-hidden="true">
                  <PhotoIcon photo={item.photo} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Featured categories */}
      <section className="page-section" aria-labelledby="featured-categories">
        <div className="container">
          <SectionHeader
            id="featured-categories"
            title="Shop by Category"
            subtitle="From Dokra metal craft to bamboo weaving - explore the traditions of Jharkhand."
            linkTo="/categories"
            linkText="All categories"
          />

          {categoriesLoading && (
            <div className="category-grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="skeleton category-skeleton" />
              ))}
            </div>
          )}
          {categoriesError && (
            <div className="alert alert-error" role="alert">
              {categoriesError}
            </div>
          )}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <p className="text-muted">No categories found. Start the backend once to create the default categories.</p>
          )}

          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                to={`/categories/${category.slug}`}
                className={`category-card accent-${index % 4}`}
              >
                <div className="category-card-media">
                  {isUsableImageUrl(category.image) ? (
                    <ImageWithFallback src={category.image} alt="" label="Category Image" width={400} />
                  ) : (
                    <span className="category-card-icon" aria-hidden="true">
                      <PhotoIcon photo={photoIcons.handicrafts} />
                    </span>
                  )}
                </div>
                <div className="category-card-body">
                  <h3>{category.name}</h3>
                  <p>{category.subcategories.slice(0, 3).map((sub) => sub.name).join(' · ')}</p>
                  <span className="category-card-count">
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular products */}
      <section className="page-section page-section-alt" aria-labelledby="popular-products">
        <div className="container">
          <SectionHeader
            id="popular-products"
            title="Popular Products"
            subtitle="Products that shoppers are viewing the most."
            linkTo="/products?sort=popular"
          />
          <ProductGrid {...popular} skeletonCount={4} />
        </div>
      </section>

      {/* 5. Recently added */}
      <section className="page-section" aria-labelledby="recent-products">
        <div className="container">
          <SectionHeader
            id="recent-products"
            title="Recently Added"
            subtitle="Fresh listings from our tribal sellers."
            linkTo="/products?sort=newest"
          />
          <ProductGrid {...recent} skeletonCount={4} />
        </div>
      </section>

      {/* 6. Explore tribal handicrafts */}
      <section className="page-section handicrafts-section" aria-labelledby="handicrafts-title">
        <div className="container handicrafts-layout">
          <div className="handicrafts-intro">
            <span className="eyebrow">Art that tells a story</span>
            <h2 id="handicrafts-title">Explore Tribal Handicrafts</h2>
            <p>
              Dokra figurines cast with the ancient lost-wax method, terracotta from village kilns, hand-carved wood and
              traditional paintings - each piece carries the skill of its maker.
            </p>
            {handicraftCategory && (
              <div className="chip-list">
                {handicraftCategory.subcategories.map((sub) => (
                  <Link key={sub.slug} to={`/categories/${HANDICRAFTS_SLUG}?sub=${sub.slug}`} className="chip chip-light">
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
            <Link to={`/categories/${HANDICRAFTS_SLUG}`} className="btn btn-hero">
              Shop Handicrafts <ArrowRightIcon size={18} />
            </Link>
          </div>
          <div className="handicrafts-products">
            <ProductGrid
              {...handicrafts}
              compact
              skeletonCount={4}
              emptyTitle="No products available yet."
              emptyMessage="Handicraft listings will appear here once sellers add them."
            />
          </div>
        </div>
      </section>

      {/* 7. Forest and eco-friendly products */}
      <section className="page-section" aria-labelledby="natural-title">
        <div className="container">
          <SectionHeader
            id="natural-title"
            title="Forest & Eco-Friendly Products"
            subtitle="Lac, sal leaves, jute and other natural materials, shaped by hand in forest and village communities."
          />
          <div className="natural-grid">
            {[
              { slug: FOREST_SLUG, title: 'Forest Products', category: forestCategory, list: forest, theme: 'forest' },
              { slug: ECO_SLUG, title: 'Eco-Friendly Products', category: ecoCategory, list: eco, theme: 'ochre' },
            ].map((panel) => (
              <div key={panel.slug} className={`natural-panel natural-panel-${panel.theme}`}>
                <div className="natural-panel-header">
                  <CategoryThumb category={panel.category} size={64} className="natural-panel-icon" />
                  <div>
                    <h3>{panel.title}</h3>
                    <p>{panel.category?.description}</p>
                  </div>
                </div>
                {panel.category && (
                  <div className="chip-list">
                    {panel.category.subcategories.map((sub) => (
                      <Link key={sub.slug} to={`/categories/${panel.slug}?sub=${sub.slug}`} className="chip">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
                <ProductGrid
                  {...panel.list}
                  compact
                  skeletonCount={2}
                  emptyTitle="No products available yet."
                  emptyMessage="Listings in this category will appear here."
                />
                <Link to={`/categories/${panel.slug}`} className="section-link">
                  Browse {panel.title} <ArrowRightIcon size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Become a seller (opens the separate SellerTribe website) */}
      <section
        className="seller-promo seller-promo-photo"
        style={headerPhotoStyle(pageHeaderPhotos.sellerPromo)}
        aria-labelledby="seller-promo-title"
      >
        <div className="container seller-promo-inner">
          <div className="seller-promo-text">
            <span className="eyebrow">For artisans, craftspeople and producers</span>
            <h2 id="seller-promo-title">Sell your handmade products online</h2>
            <p>
              Register on our seller website with your name, contact number and address. Once our team approves your
              account, upload photos of your products and they appear on the marketplace for customers to discover.
            </p>
            <ol className="seller-steps">
              <li>
                <strong>1</strong> Register as a seller
              </li>
              <li>
                <strong>2</strong> Get approved by our team
              </li>
              <li>
                <strong>3</strong> Upload products and reach customers
              </li>
            </ol>
          </div>
          <div className="seller-promo-action">
            <a href={`${siteConfig.sellerSiteUrl}/login?mode=register`} className="btn btn-hero btn-lg">
              Register as a Seller
            </a>
          </div>
        </div>
      </section>

      {/* 9. About the marketplace */}
      <section className="page-section home-about" aria-labelledby="home-about-title">
        <div className="container home-about-inner">
          <div>
            <span className="eyebrow eyebrow-dark">About the marketplace</span>
            <h2 id="home-about-title" className="section-title">
              Bringing village crafts to online shoppers
            </h2>
            <p>
              Tribal Marketplace is a digital platform for the artisans and small producers of Jharkhand. We are starting
              with a few villages and hope to grow step by step, helping more sellers share their work with customers
              who value handmade and traditional products.
            </p>
            <Link to="/about" className="btn btn-secondary">
              Read our story
            </Link>
          </div>
          <ul className="home-about-points">
            <li>
              <span aria-hidden="true">
                <PhotoIcon photo={photoIcons.villageMarket} />
              </span>
              <div>
                <strong>Direct connection</strong>
                <p>Sellers manage their own listings and prices.</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">
                <PhotoIcon photo={photoIcons.bambooWeaver} />
              </span>
              <div>
                <strong>Living traditions</strong>
                <p>Crafts like Dokra, Sohrai-inspired art and bamboo weaving.</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">
                <PhotoIcon photo={photoIcons.paddyPlanting} />
              </span>
              <div>
                <strong>Growing together</strong>
                <p>Starting small and expanding to more villages over time.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Home;

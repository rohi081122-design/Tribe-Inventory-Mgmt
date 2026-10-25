// components/HeroCarousel.jsx
// Homepage banner slider.
// - changes slide automatically every 5 seconds (one timer at a time, cleaned up on unmount)
// - previous / next arrows, clickable dots and a pause button
// - swipe on touch screens, arrow keys on the keyboard
// - pauses while the mouse is over it or a control has keyboard focus
// - no automatic sliding for users who prefer reduced motion
// The slide texts and images come from data/slides.js

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import slides from '../data/slides.js';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from './Icons.jsx';
import { isUsableImageUrl } from '../utils/images.js';
import '../styles/hero-carousel.css';

const AUTO_PLAY_DELAY_MS = 5000;
const SWIPE_DISTANCE_PX = 50;

function userPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [isStoppedByUser, setIsStoppedByUser] = useState(userPrefersReducedMotion);
  const [failedImages, setFailedImages] = useState({});
  const touchStart = useRef(null);

  const totalSlides = slides.length;
  const isPaused = isHovered || hasKeyboardFocus || isStoppedByUser;

  function goToSlide(index) {
    setCurrentIndex((index + totalSlides) % totalSlides);
  }

  function showNextSlide() {
    setCurrentIndex((index) => (index + 1) % totalSlides);
  }

  function showPreviousSlide() {
    setCurrentIndex((index) => (index - 1 + totalSlides) % totalSlides);
  }

  // Auto-play. A new timeout starts after every slide change; the cleanup function
  // clears the old one, so there is never more than one timer running.
  useEffect(() => {
    if (isPaused || totalSlides < 2) {
      return undefined;
    }
    const timerId = setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % totalSlides);
    }, AUTO_PLAY_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [currentIndex, isPaused, totalSlides]);

  /* ----- Keyboard and focus ----- */

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextSlide();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousSlide();
    }
  }

  // Pause only for keyboard focus (mouse clicks on the arrows should not stop the slider)
  function handleFocus(event) {
    if (event.target.matches(':focus-visible')) {
      setHasKeyboardFocus(true);
    }
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
    }
  }

  /* ----- Touch swipe ----- */

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - touchStart.current.x;
    const distanceY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    // Ignore mostly-vertical movements (the user is scrolling the page)
    if (Math.abs(distanceX) > SWIPE_DISTANCE_PX && Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX < 0) {
        showNextSlide();
      } else {
        showPreviousSlide();
      }
    }
  }

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className="carousel-viewport" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            const showImage = isUsableImageUrl(slide.imageUrl) && !failedImages[slide.id];

            return (
              <div
                key={slide.id}
                className={`carousel-slide theme-${slide.theme || 'forest'} ${showImage ? 'has-image' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${totalSlides}`}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                {showImage ? (
                  <img
                    className="slide-image"
                    src={slide.imageUrl}
                    alt=""
                    style={slide.imagePosition ? { objectPosition: slide.imagePosition } : undefined}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={() => setFailedImages((failed) => ({ ...failed, [slide.id]: true }))}
                  />
                ) : (
                  // Decorative tribal-style artwork made with CSS (used when no image is set)
                  <div className="slide-art" aria-hidden="true">
                    <span className="slide-art-sun" />
                    <span className="slide-art-ring" />
                    <span className="slide-art-band" />
                  </div>
                )}

                <div className="slide-overlay" />

                {/* Photographer credit (needed for Creative Commons photos) */}
                {showImage && slide.credit && (
                  <a className="slide-credit" href={slide.credit.url} target="_blank" rel="noopener noreferrer">
                    {slide.credit.text}
                  </a>
                )}

                <div className="container slide-content">
                  {slide.eyebrow && <span className="slide-eyebrow">{slide.eyebrow}</span>}
                  <h2 className="slide-title">{slide.title}</h2>
                  <p className="slide-description">{slide.description}</p>
                  {/* Full addresses (another website) need a normal <a>, pages of this site use <Link> */}
                  {/^https?:\/\//.test(slide.buttonLink) ? (
                    <a href={slide.buttonLink} className="btn btn-hero btn-lg">
                      {slide.buttonText}
                    </a>
                  ) : (
                    <Link to={slide.buttonLink} className="btn btn-hero btn-lg">
                      {slide.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            onClick={showPreviousSlide}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon size={26} />
          </button>
          <button type="button" className="carousel-arrow carousel-arrow-next" onClick={showNextSlide} aria-label="Next slide">
            <ChevronRightIcon size={26} />
          </button>

          <div className="carousel-controls">
            <div className="carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`carousel-dot ${index === currentIndex ? 'is-active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              className="carousel-pause"
              onClick={() => setIsStoppedByUser((stopped) => !stopped)}
              aria-label={isStoppedByUser ? 'Start automatic slide show' : 'Pause automatic slide show'}
            >
              {isStoppedByUser ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
            </button>
          </div>
        </>
      )}

      {/* Announces the slide change to screen readers when the user changes it */}
      <p className="visually-hidden" aria-live={isPaused ? 'polite' : 'off'}>
        Slide {currentIndex + 1} of {totalSlides}: {slides[currentIndex].title}
      </p>
    </section>
  );
}

export default HeroCarousel;

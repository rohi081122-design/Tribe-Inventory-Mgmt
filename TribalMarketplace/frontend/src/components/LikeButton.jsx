// components/LikeButton.jsx
// The ❤️ button. Grey outline = not liked, red = liked. Clicking it again unlikes the product.
// Visitors who are not logged in are sent to the login page (and come back afterwards).
//   variant "card"    -> small round button on a product card
//   variant "details" -> button with the word "Like" / "Liked" on the product page

import { useLocation, useNavigate } from 'react-router-dom';
import { HeartIcon } from './Icons.jsx';
import { useLikes } from '../context/LikesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function LikeButton({ product, variant = 'card' }) {
  const { isLiked, toggleLike } = useLikes();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const liked = isLiked(product._id);

  async function handleClick(event) {
    event.preventDefault(); // the button can sit on top of a link
    event.stopPropagation();

    try {
      const done = await toggleLike(product);
      if (!done) {
        showToast('Please log in or create an account to like products.', 'info');
        navigate('/login', { state: { from: location.pathname + location.search } });
        return;
      }
      showToast(liked ? `"${product.name}" removed from your likes.` : `"${product.name}" added to your likes.`, 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <button
      type="button"
      className={`like-button like-button-${variant} ${liked ? 'is-liked' : ''}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${product.name}` : `Like ${product.name}`}
      title={liked ? 'Remove from your likes' : 'Add to your likes'}
    >
      <HeartIcon size={variant === 'card' ? 20 : 22} fill={liked ? 'currentColor' : 'none'} />
      {variant === 'details' && <span>{liked ? 'Liked' : 'Like'}</span>}
    </button>
  );
}

export default LikeButton;

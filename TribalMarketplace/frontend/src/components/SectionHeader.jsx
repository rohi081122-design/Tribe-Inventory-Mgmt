// components/SectionHeader.jsx
// Title + subtitle (+ optional "View all" link) used at the top of homepage sections.

import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './Icons.jsx';

function SectionHeader({ title, subtitle, linkTo, linkText = 'View all', id }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title" id={id}>
          {title}
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="section-link">
          {linkText} <ArrowRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;

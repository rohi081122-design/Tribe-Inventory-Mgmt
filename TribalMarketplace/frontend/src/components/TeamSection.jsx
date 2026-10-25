// components/TeamSection.jsx
// "Meet Our Team": one card per team member with photo, name, designation and a short line.
// The team list (and where the photos go) is in data/team.js.
// Hovering a card makes it zoom up a little (see contact.css).

import { useState } from 'react';
import LeafOrnament from './LeafOrnament.jsx';
import team from '../data/team.js';
import { getInitials } from '../utils/format.js';

// The photo, or the person's initials when there is no photo (or it fails to load)
function TeamPhoto({ member }) {
  const [failed, setFailed] = useState(false);

  if (!member.photo || failed) {
    return (
      <span className="team-photo team-photo-initials" role="img" aria-label={member.name}>
        {getInitials(member.name)}
      </span>
    );
  }

  return (
    <img
      className="team-photo"
      src={member.photo}
      alt={member.name}
      width="120"
      height="120"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function TeamSection() {
  return (
    <section className="team-section" aria-labelledby="team-title">
      <div className="ornament-heading">
        <LeafOrnament side="left" />
        <h2 id="team-title">Meet Our Team</h2>
        <LeafOrnament side="right" />
      </div>
      <p className="team-subtitle">The people behind Tribal Marketplace</p>

      <ul className="team-grid">
        {team.map((member) => (
          <li key={member.name} className="team-card">
            <TeamPhoto member={member} />
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <span className="team-divider" aria-hidden="true" />
            <p className="team-about">{member.about}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TeamSection;

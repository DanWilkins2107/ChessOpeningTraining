import { Link } from 'react-router-dom';
import { PROFILE_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import './ProfileLink.css';

type ProfileLinkProps = {
  signOutError?: string;
};

export function ProfileLink({ signOutError }: ProfileLinkProps) {
  const user = useUser();

  if (user) {
    return (
      <Link to={PROFILE_ROUTE_PATH} className="profile-link">
        Profile
      </Link>
    );
  }

  return (
    signOutError && (
      <p role="alert" className="profile-link-error">
        {signOutError}
      </p>
    )
  );
}

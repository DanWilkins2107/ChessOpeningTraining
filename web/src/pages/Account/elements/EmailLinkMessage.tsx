import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { ACCOUNT_ROUTE_PATH } from '../../../elements/router.constants';
import { SUBSCRIBE_ONCE } from '../../../elements/useUser.constants';
import { SuccessMessage } from '../../../elements/SuccessMessage';
import { emailLinkNotice } from './emailLinkNotice';

export function EmailLinkMessage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  // Read once, so clearing the hash below does not take the notice with it.
  const [notice] = useState(() => emailLinkNotice(hash));

  useEffect(
    () => {
      if (notice) navigate(ACCOUNT_ROUTE_PATH, { replace: true });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SUBSCRIBE_ONCE is empty, so the hash is cleared once, on mount
    SUBSCRIBE_ONCE,
  );

  if (!notice) return null;
  return notice.confirmed ? (
    <SuccessMessage>{notice.text}</SuccessMessage>
  ) : (
    <ErrorMessage>{notice.text}</ErrorMessage>
  );
}

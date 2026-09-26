import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { CHANGE_EMAIL_ROUTE_PATH } from '../../../../shared/router/router.constants';
import { SUBSCRIBE_ONCE } from '../../../../shared/useUser/useUser.constants';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { emailLinkNotice } from '../emailLinkNotice/emailLinkNotice';

export function EmailLinkMessage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  // Read once, so clearing the hash below does not take the notice with it.
  const [notice] = useState(() => emailLinkNotice(hash));

  useEffect(
    () => {
      if (notice?.clearHash)
        navigate(CHANGE_EMAIL_ROUTE_PATH, { replace: true });
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

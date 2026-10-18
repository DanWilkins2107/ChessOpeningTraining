import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { emailLinkNotice } from '../emailLinkNotice/emailLinkNotice';

export function EmailLinkMessage() {
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  // Read once, so clearing the hash below does not take the notice with it.
  const [notice] = useState(() => emailLinkNotice(hash));

  useEffect(() => {
    if (notice?.clearHash) navigate(pathname, { replace: true });
  }, [notice, navigate, pathname]);

  if (!notice) return null;
  return notice.confirmed ? (
    <SuccessMessage>{notice.text}</SuccessMessage>
  ) : (
    <ErrorMessage>{notice.text}</ErrorMessage>
  );
}

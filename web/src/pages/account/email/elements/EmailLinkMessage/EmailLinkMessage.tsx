import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ErrorMessage } from '../../../../../shared/ErrorMessage/ErrorMessage';
import { SuccessMessage } from '../../../../../shared/SuccessMessage/SuccessMessage';
import { emailLinkNotice } from '../emailLinkNotice/emailLinkNotice';

export function EmailLinkMessage() {
  const { hash, pathname } = useLocation();
  // Read once, so clearing the hash below does not take the notice with it.
  const [notice] = useState(() => emailLinkNotice(hash));

  if (!notice) return null;
  return (
    <>
      {notice.clearHash && <Navigate to={pathname} replace />}
      {notice.confirmed ? (
        <SuccessMessage>{notice.text}</SuccessMessage>
      ) : (
        <ErrorMessage>{notice.text}</ErrorMessage>
      )}
    </>
  );
}

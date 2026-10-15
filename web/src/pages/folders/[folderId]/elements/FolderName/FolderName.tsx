import { use } from 'react';
import { FolderLoadError } from '../FolderLoadError/FolderLoadError';
import { FolderNotFound } from '../FolderNotFound/FolderNotFound';
import type { FolderResponse } from '../FolderResponse/FolderResponse';

export function FolderName({ folder }: { folder: Promise<FolderResponse> }) {
  const { data, error } = use(folder);

  if (error !== null) return <FolderLoadError />;
  if (data === null) return <FolderNotFound />;

  return <h1>{data.name}</h1>;
}

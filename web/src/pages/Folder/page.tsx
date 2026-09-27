import { useParams } from 'react-router-dom';
import { z } from '../../z';
import { FolderDetails } from './elements/FolderDetails/FolderDetails';
import { FolderNotFound } from './elements/FolderNotFound/FolderNotFound';
import './page.css';

const paramsSchema = z.object({ folderId: z.uuid() });

export function Folder() {
  const params = paramsSchema.safeParse(useParams());

  return (
    <section aria-label="Folder" className="folder">
      {params.success ? (
        <FolderDetails folderId={params.data.folderId} />
      ) : (
        <FolderNotFound />
      )}
    </section>
  );
}

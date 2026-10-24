import { useRepertoire } from '../useRepertoire/useRepertoire';
import './RepertoireList.css';

export function RepertoireList() {
  const { folders, move_trees } = useRepertoire();
  const empty = folders.length === 0 && move_trees.length === 0;

  return empty && <p className="repertoire-list-empty">No folders yet</p>;
}

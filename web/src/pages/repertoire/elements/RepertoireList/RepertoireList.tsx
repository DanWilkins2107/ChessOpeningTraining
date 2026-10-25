import { useRepertoire } from '../useRepertoire/useRepertoire';
import './RepertoireList.css';

export function RepertoireList() {
  const { folders, move_trees } = useRepertoire();
  const empty = folders.length === 0 && move_trees.length === 0;

  // TODO 65f64818 2026-11-14: replace with the prototype's EmptyRepertoire.
  return empty && <p className="repertoire-list-empty">No folders yet</p>;
}

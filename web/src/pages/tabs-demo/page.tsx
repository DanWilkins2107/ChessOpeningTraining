import { Tabs } from '../../shared/Tabs/Tabs';
import { MoveTreeLayout } from '../MoveTree/elements/MoveTreeLayout/MoveTreeLayout';

const empty = (text: string) => <p style={{ color: 'var(--ink-muted)' }}>{text}</p>;

export function TabsDemo() {
  return (
    <MoveTreeLayout>
      <Tabs
        label="Move tree panel"
        tabs={[
          { label: 'Moves', content: empty('No moves yet.') },
          { label: 'Engine', content: empty('Engine is off.') },
          { label: 'Book', content: empty('No book moves for this position.') },
        ]}
      />
    </MoveTreeLayout>
  );
}

import { templateProblems, writeTemplates } from './emailTemplates.ts';

const TEMPLATES_DIR = 'supabase/templates';

if (process.argv.includes('--check')) {
  const problems = templateProblems(TEMPLATES_DIR);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
} else {
  writeTemplates(TEMPLATES_DIR);
}

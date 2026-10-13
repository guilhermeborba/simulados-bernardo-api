import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
      'prisma/seed-inventory*.ts',
      'prisma/seed-backlog.ts',
      'prisma/quiz-catalog*.ts',
      'prisma/seed-quizzes.ts',
      'prisma/mission-catalog*.ts',
      'prisma/seed-missions.ts',
      'prisma/learning-skill*.ts',
      'prisma/seed-learning-skills.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  eslintConfigPrettier,
];

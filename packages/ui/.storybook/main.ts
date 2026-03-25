import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-essentials',   // controls, actions, docs, viewport, backgrounds
    '@storybook/addon-a11y',         // accessibility checks panel
    '@storybook/addon-interactions', // play() function step-through
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Output static build to storybook-static/ for GitLab Pages
  staticDirs: ['../public'],

  viteFinal: async (config) => {
    config.base = process.env.STORYBOOK_BASE_URL ?? '/'
    return config
  },

  docs: {
    autodocs: 'tag', // generate autodoc page for stories tagged with autodocs
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
}

export default config

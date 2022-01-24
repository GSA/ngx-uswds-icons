import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
// import '../src/stories/test.css'
// import '!style-loader!css-loader!../src/stories/test.css'
// import '!style-loader!css-loader!sass-loader!../src/styles.scss';

// import styles from '../src/styles.scss';
// import styles from '!!style-loader?injectType=lazyStyleTag!css-loader!sass-loader!../src/styles.scss'

// import cssVariablesTheme from '@etchteam/storybook-addon-css-variables-theme'

setCompodocJson(docJson);


// export const decorators = [
//   cssVariablesTheme,
// ]



export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: { inlineStories: true },
  // cssVariables: {
  //   files: {
  //     styles
  //   }
  // }
}


import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { IconComponent, uswdsAllIcons, allIcons as sdsIcons } from 'projects/icons/src/public-api';
import { kebabCase } from 'lodash-es';
import * as _ from 'lodash';
import { appendPrefix } from 'src/app/app.module';

const iconTemplate = require('!!raw-loader!./icon.html');


let uswdsSelected = true;
let sdsSelected = false;
let bootstrapSelected = false;

const xByXCorrection = (possibleXByXString: string) => {
  return possibleXByXString.replace(/(\d)-x-(\d)/, '$1x$2')
}

const degCorrection = (possibleDegString: string) => {
  return possibleDegString.replace(/(\d+)-deg/, '$1deg');
}

const xKCorrection = (possibleXKString: string) => {
  return possibleXKString.replace(/(\d)-k(-?)/, '$1k$2')
}

const fixDisplayName = (iconName: string, removePrefix?: boolean) => {
  if(removePrefix){
    const kebab = kebabCase(iconName);
    return kebab.split('-').slice(1).join('-');
  } else {
    return xKCorrection(
      degCorrection(
        xByXCorrection(
          kebabCase(iconName)
        )
      )
    )
  }
}


export default {
  title: 'IconComponent',
  component: IconComponent,
  argTypes: {
    search: {control: 'text'},
    library: {
      control: {
        type:'check',
        options: ['USWDS', 'SDS', 'Bootstrap'],
      }
    },
    rotate: {
      control: {
        type: 'select',
        options: ['0', '30', '45', '60', '90', '120', '135', '150', '180', '210', '240', '270', '300', '315', '330']
      }
    },
    size: {
      control: {
        type: 'select',
        options: ['xs', 'sm', 'lg', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x']
      }
    },
    // Adding this to remove from user view
    icon: {
      table: {
        disable: true
      }
    },
    icons: {
      table: {
        disable: true
      }
    },
    iconClasses: {
      table: {
        disable: true
      }
    },
    skewX: {
      table: {
        disable: true
      }
    },
    skewY: {
      table: {
        disable: true
      }
    },
    classes: {
      table: {
        disable: true
      }
    },
  },
  decorators: [
    moduleMetadata({
        imports: [
          NgxBootstrapIconsModule.pick(
            Object.assign(
              {},
              _.cloneDeep(allIcons),
              appendPrefix(_.cloneDeep(sdsIcons), 'sds'),
              _.cloneDeep(uswdsAllIcons),
            )
          )
        ],
    }),
  ],
} as Meta;

const filterResults = (iconList: Array<string>, searchTerm) => {
  return searchTerm ? iconList.filter(iconName => iconName.toLowerCase().includes(searchTerm)) : iconList;
};

const buildIconList = (library: Array<string>) => {
  const choices = [];
  library.forEach(lib => choices.push(lib));
  uswdsSelected = choices.includes('USWDS');
  sdsSelected = choices.includes('SDS');
  bootstrapSelected = choices.includes('Bootstrap');
}

const SingleIconTemplate: Story = (args) => {
  const searchTerm = args.search;
  buildIconList(args.library)
  return {
    props: {
      ...args,
      icons: {
        uswds: uswdsSelected ? filterResults(Object.keys(uswdsAllIcons), searchTerm).map(icon => ({display: fixDisplayName(icon), lookup: icon})) : [],
        sds: sdsSelected ? filterResults(Object.keys(appendPrefix(sdsIcons, 'sds')), searchTerm).map(icon => ({display: fixDisplayName(icon, true), lookup: icon})) : [],
        bootstrap: bootstrapSelected ? filterResults(Object.keys(allIcons), searchTerm).map(icon => ({display: fixDisplayName(icon), lookup: icon})) : []
      }
    },
    template: iconTemplate.default
  }
};

export const Basic = SingleIconTemplate.bind({});
Basic.args = {
  icons: {
    uswds: Object.keys(uswdsAllIcons),
    sds: Object.keys(appendPrefix(sdsIcons, 'sds')),
    bootstrap: Object.keys(allIcons)
  },
  library: ['USWDS'],
  rotate: '0'
}
